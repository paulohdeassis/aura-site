# Contrato de integração do SITE (signup self-service)

Este documento é o que o **site da Aura** implementa. A Aura expõe 2 endpoints públicos e
recebe o webhook do Asaas; o **site** monta a tela, coleta o cartão e cobra **direto no Asaas**
(conta da Homio). Quem provisiona a org é a Aura, via webhook.

> **PCI**: o site coleta dados crus de cartão e usa a chave `ASAAS_PARENT_ACCOUNT_API`. Isso
> coloca o site no escopo PCI. A chave **não** sai do backend do site.

## Visão geral (3 passos)

```
1. GET  {AURA}/api/v1/public/billing/catalog        → preços + metadados
2. POST {AURA}/api/v1/public/billing/intent          → intent_id + manifesto (sem cartão)
3. site → Asaas (conta Homio):
     a. POST /customers                               → customer
     b. POST /subscriptions  (plano)                  → 1ª cobrança c/ cartão → guarda token
     c. POST /subscriptions  (cada addon)             → reusa creditCardToken
     d. POST /payments       (onboarding, se houver)  → reusa creditCardToken
   (cada cobrança leva o externalReference com o intent_id)
        │
        ▼  Asaas → webhook → Aura provisiona a org e dispara o e-mail de acesso
```

O site **não** chama nenhum endpoint de provisionamento. Após cobrar, o trabalho do site
acabou; a Aura cuida do resto pelo webhook.

---

## Passo 1 — `GET /api/v1/public/billing/catalog`

Público, sem auth. Use para renderizar a tela (nunca hardcode preços).

**Response 200**
```json
{
  "plans": [
    { "code": "START", "name": "Start", "max_units": 10,
      "monthly_cents": 14700, "yearly_cents": 157000 }
  ],
  "addons": [
    { "code": "ADDITIONAL_UNITS", "name": "Unidades adicionais", "kind": "UNIT_QUOTA",
      "available_plan_codes": null, "monthly_cents": 500, "yearly_cents": 5400 },
    { "code": "CHANNEL_MANAGER", "name": "Channel Manager", "kind": "INTEGRATION",
      "available_plan_codes": ["CORE","MAX"], "monthly_cents": 9900, "yearly_cents": 106800 }
  ],
  "fees": [ { "code": "ONBOARDING", "name": "Onboarding assistido", "amount_cents": 50000 } ]
}
```
- Valores em **centavos**. `available_plan_codes: null` = vale para todos os planos.
- Mostre apenas addons elegíveis ao plano escolhido (`available_plan_codes` inclui o `plan_code`
  ou é `null`).
- Para `kind: "UNIT_QUOTA"` (ex.: `ADDITIONAL_UNITS`), `monthly_cents`/`yearly_cents` é o preço
  **por unidade**; o `quantity` do intent é o **número de unidades** (use múltiplos de 10).
  Para `kind: "INTEGRATION"`, `quantity` é `1`.

---

## Passo 2 — `POST /api/v1/public/billing/intent`

Público, **sem cartão**. Registra o pedido na Aura e devolve o `intent_id` que amarra as
cobranças. Faça **antes** de cobrar.

**Request**
```json
{
  "org_name": "Pousada do Vale",
  "owner_name": "Maria Silva",
  "owner_email": "maria@pousadadovale.com",
  "plan_code": "START",
  "cycle": "MONTHLY",
  "addons": [ { "code": "ADDITIONAL_UNITS", "quantity": 10 } ],
  "include_onboarding": true
}
```
- `quantity` para `UNIT_QUOTA` = **número de unidades** (múltiplo de 10). Para `INTEGRATION` = `1`.

**Response 200**
```json
{
  "intent_id": "ac757a7e-e62b-449a-b4c4-bc7a809989a5",
  "owner_is_existing_user": false,
  "expected_total_cents": 69700,
  "manifest": [
    { "kind": "plan",  "code": "START",            "cycle": "MONTHLY",                 "amount_cents": 14700 },
    { "kind": "addon", "code": "ADDITIONAL_UNITS",  "cycle": "MONTHLY", "quantity": 10, "amount_cents": 5000  },
    { "kind": "fee",   "code": "ONBOARDING",                                            "amount_cents": 50000 }
  ]
}
```
- **`owner_is_existing_user: true`** → o e-mail já tem conta na Aura. Avise o usuário: "esta
  organização será adicionada à sua conta existente" (ele não vai definir senha nova).
- Use `manifest[].amount_cents` como **fonte da verdade do valor de cada cobrança**. O webhook
  vai recusar cobranças cujo valor não bata com o catálogo.

**Erros** (envelope padrão `{ "error": { "code", "message" } }`): `validation_error` (payload),
`unknown_plan`/`unknown_addon`, `addon_not_available` (não elegível ao plano), `plan_not_priced`.

---

## Passo 3 — Cobranças no Asaas (feitas pelo site)

Conta: **Homio** (`ASAAS_PARENT_ACCOUNT_API`). Base: `https://sandbox.asaas.com/api/v3` (sandbox)
ou `https://www.asaas.com/api/v3` (prod). Header `access_token: <chave>`.

### 3a. Criar customer
```http
POST /customers
{ "name": "Pousada do Vale", "email": "maria@pousadadovale.com", "cpfCnpj": "<cpf/cnpj>" }
```
Guarde o `id` (`cus_...`). Use o **mesmo customer** em todas as cobranças do pedido.

### 3b. Assinatura do plano (1ª cobrança, com cartão)
```http
POST /subscriptions
{
  "customer": "cus_...",
  "billingType": "CREDIT_CARD",
  "value": 147.00,                      // = manifest plano /100
  "cycle": "MONTHLY",
  "nextDueDate": "<hoje YYYY-MM-DD>",
  "description": "Aura · Plano Start (mensal)",
  "externalReference": "aura-billing;kind=plan;code=START;intent=ac757a7e-...-989a5",
  "creditCard": { "holderName","number","expiryMonth","expiryYear","ccv" },
  "creditCardHolderInfo": { "name","email","cpfCnpj","postalCode","addressNumber","phone" },
  "remoteIp": "<ip do cliente>"
}
```
Na resposta vem `creditCard.creditCardToken`. **Guarde** para reusar.

### 3c. Assinatura de cada addon (reusa o token)
```http
POST /subscriptions
{
  "customer": "cus_...",
  "billingType": "CREDIT_CARD",
  "value": 50.00,                       // = manifest addon /100 (já multiplicado pela quantidade, se aplicável)
  "cycle": "MONTHLY",
  "nextDueDate": "<hoje>",
  "description": "Aura · Unidades adicionais (mensal)",
  "externalReference": "aura-billing;kind=addon;code=ADDITIONAL_UNITS;intent=ac757a7e-...-989a5",
  "creditCardToken": "<token do 3b>",
  "remoteIp": "<ip do cliente>"
}
```

### 3d. Onboarding (cobrança avulsa, reusa o token)
```http
POST /payments
{
  "customer": "cus_...",
  "billingType": "CREDIT_CARD",
  "value": 500.00,                      // = manifest fee /100
  "dueDate": "<hoje>",
  "description": "Aura · Onboarding",
  "externalReference": "aura-billing;kind=fee;code=ONBOARDING;intent=ac757a7e-...-989a5",
  "creditCardToken": "<token do 3b>",
  "remoteIp": "<ip do cliente>"
}
```

---

## Regras que o site DEVE seguir

1. **externalReference exato** por cobrança: `aura-billing;kind=<plan|addon|fee>;code=<CODE>;intent=<intent_id>`.
   Sem `cycle` (a Aura lê o ciclo do intent). Mantenha ≤ 100 chars (já fica ~90).
2. **Valor = catálogo.** Use `manifest[].amount_cents / 100`. Valor divergente → a Aura **não
   provisiona** aquele item (anti-adulteração).
3. **Um intent por checkout.** Todas as cobranças do mesmo pedido usam o **mesmo `intent_id`**.
4. **Cartão uma vez.** Faça a 1ª cobrança com `creditCard`+`creditCardHolderInfo`, capture o
   `creditCardToken` e reuse nas demais. O cliente digita o cartão uma vez.
5. **Mesmo customer** (`cus_...`) em todas as cobranças do pedido.
6. **Ordem sugerida**: plano → addons → onboarding. (A confirmação é parcial; a org nasce na 1ª
   confirmação. Plano primeiro garante que o entitlement do plano entre primeiro.)
7. **Ambiente**: sandbox vs prod é definido pela chave/base que o site usa. A Aura provisiona em
   ambos conforme o webhook configurado.

## O que o site NÃO faz

- Não chama nenhum endpoint de provisionamento/criação de org na Aura.
- Não lida com o webhook (é a Aura que recebe e provisiona).
- Não define senha do usuário (a Aura dispara o e-mail de cadastro; usuário existente recebe
  aviso de "nova organização adicionada").

## O que acontece depois (lado Aura, para sua referência)

- Asaas confirma cada cobrança → webhook da Aura.
- Na 1ª confirmação do `intent`: cria a org (nome = `org_name`), resolve o owner
  (novo = e-mail de cadastro; existente = adiciona como owner), grava o billing e o entitlement.
- Cobranças seguintes do mesmo intent anexam itens/entitlement.
- Cobrança recusada não bloqueia o resto; pode ser reprocessada.

## Cartão de teste (sandbox Asaas)

`5162306219378829` · validade `05/2028` · CCV `318` · CPF `24971563792`.
