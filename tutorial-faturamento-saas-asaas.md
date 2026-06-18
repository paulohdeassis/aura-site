# Tutorial: Faturar um SaaS numa conta Asaas compartilhada (de forma rastreável)

> **Cenário:** você tem uma conta Asaas (mesmo CNPJ) usada para outra operação e quer
> processar os pagamentos de um SaaS pela mesma conta, conseguindo **separar quanto o
> SaaS fatura** do resto — e deixando o caminho pronto para **isolar de verdade no futuro**.
>
> **Decisão já tomada:** subconta com o mesmo CNPJ não dá (cada conta exige um documento
> próprio). E subconta no mesmo CNPJ seria separação só cosmética mesmo — mesmo CNPJ = mesma
> empresa pro fisco. Então a separação aqui é **gerencial**, não jurídica.

---

## Princípio central

Você vai empilhar **três camadas que não brigam entre si**:

| Camada | Responde | Onde vive | Risco se errar |
|--------|----------|-----------|----------------|
| **Produto** | *O quê* foi vendido | Catálogo / descrição da cobrança | Baixo (é rótulo) |
| **`externalReference`** | *De quem / qual assinatura* | Campo da cobrança (API) | Baixo |
| **NFS-e (serviço)** | Natureza **fiscal** | Emissão de nota | **Alto — é com o fisco** |

> ⚠️ **Regra de ouro:** o rótulo "produto" vive no catálogo e no seu dashboard.
> A **nota fiscal do SaaS tem que sair como SERVIÇO (NFS-e)**, nunca como mercadoria (NF-e).
> O Asaas emite NFS-e — usar um "produto" no catálogo **não** força uma NF-e errada,
> desde que a config fiscal esteja como serviço.

> 📌 **A fonte da verdade do faturamento é o SEU sistema, não o Asaas.**
> Guarde no seu banco o `id`/`subscription_id`/`payment_id` do Asaas atrelado ao seu cliente.
> Assim, "quanto o SaaS faturou" é uma query no seu banco, e no dia que trocar de
> conta/CNPJ **nada quebra** — você só troca a credencial da API. Trate o Asaas como
> **trilho de pagamento**, não como livro-caixa.

---

## Camada 1 — Padrão do `externalReference`

Essa é a chave que segrega tudo. Padronize com um prefixo fixo:

```
SAAS-{plano}-{customerId}-{assinaturaId}
```

Exemplos:
```
SAAS-PRO-cus_000123-sub_000999
SAAS-START-cus_000456-sub_001010
```

Vantagens sobre depender só do "produto":
- **Consultável/exportável via API** (filtra cobrança por ele)
- **Imutável** na cobrança (não depende de lembrar de etiquetar)
- **Migra junto** quando você abrir o CNPJ separado — você sabe exatamente o que é do SaaS
- **Não contamina o fiscal**

> Tudo que começa com `SAAS-` = receita do SaaS. Fim da história.

---

## Camada 2 — Criar cliente + cobrança

> ⚠️ Confira os nomes de campos/endpoints contra a **doc atual** do Asaas antes de subir
> pra produção. O formato abaixo segue a API v3.

### Variáveis

```bash
ASAAS_BASE="https://api.asaas.com/v3"      # produção
# ASAAS_BASE="https://sandbox.asaas.com/api/v3"  # sandbox p/ testar
ASAAS_KEY="$ASAAS_API_KEY"                  # nunca commitar a chave
```

### 1. Criar o cliente

```bash
curl -s -X POST "$ASAAS_BASE/customers" \
  -H "access_token: $ASAAS_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente Exemplo Ltda",
    "cpfCnpj": "12345678000199",
    "email": "financeiro@cliente.com",
    "groupName": "SaaS"
  }'
```

> `groupName: "SaaS"` cria/atribui um **grupo de clientes** — filtro visual no painel,
> redundância barata com o `externalReference`.

### 2A. Cobrança avulsa (pagamento único)

```bash
curl -s -X POST "$ASAAS_BASE/payments" \
  -H "access_token: $ASAAS_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "cus_000123",
    "billingType": "PIX",
    "value": 199.00,
    "dueDate": "2026-07-01",
    "description": "SaaS Plano PRO - mensalidade",
    "externalReference": "SAAS-PRO-cus_000123-avulsa-202607"
  }'
```

### 2B. Assinatura (recorrente) — recomendado para SaaS

```bash
curl -s -X POST "$ASAAS_BASE/subscriptions" \
  -H "access_token: $ASAAS_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "cus_000123",
    "billingType": "CREDIT_CARD",
    "value": 199.00,
    "nextDueDate": "2026-07-01",
    "cycle": "MONTHLY",
    "description": "SaaS Plano PRO",
    "externalReference": "SAAS-PRO-cus_000123-sub"
  }'
```

> Cada cobrança gerada pela assinatura herda o contexto. A assinatura já agrupa a
> receita recorrente naturalmente — dá pra somar por ela também.

---

## Camada 3 — Emissão da NFS-e (a parte fiscal)

Aqui é onde **não se chuta**. SaaS = **serviço** = **NFS-e**.

### Antes de codar, confirme com seu contador:
- [ ] **Código de serviço municipal** do SaaS
      (licenciamento/cessão de uso de software costuma ser o **item 1.05 da LC 116/2003**,
      mas pode cair em 1.03 / 1.07 / 1.09 dependendo do município e do enquadramento)
- [ ] **Alíquota de ISS** do seu município
- [ ] Se há **retenção de ISS** no seu caso
- [ ] Regime tributário (Simples, Presumido, etc.) e impacto na nota

> Estes valores variam por cidade e por enquadramento. **Errar aqui é problema com o fisco**,
> diferente de errar um rótulo de catálogo.

### Emitir NFS-e atrelada à cobrança

```bash
curl -s -X POST "$ASAAS_BASE/invoices" \
  -H "access_token: $ASAAS_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "payment": "pay_000888",
    "serviceDescription": "Licenciamento de uso de software (SaaS) - Plano PRO",
    "observations": "Referente a SAAS-PRO-cus_000123-sub",
    "value": 199.00,
    "deductions": 0,
    "effectiveDate": "2026-07-01",
    "municipalServiceCode": "1.05",
    "municipalServiceName": "Licenciamento ou cessao de direito de uso de programas de computacao",
    "taxes": {
      "retainIss": false,
      "iss": 2.0,
      "cofins": 0,
      "csll": 0,
      "inss": 0,
      "ir": 0,
      "pis": 0
    }
  }'
```

> Os campos exatos de `taxes`/código de serviço dependem da integração da sua prefeitura
> com o Asaas — **valide na doc e com o contador**. O `municipalServiceCode` acima é
> ilustrativo.

---

## Conciliação mensal ("quanto o SaaS faturou?")

### Opção A — via painel
Filtre por **grupo de clientes "SaaS"** + período e exporte o extrato.

### Opção B — via API (confiável, automatizável)
Puxe as cobranças **recebidas** no período e filtre por `externalReference` começando com `SAAS-`.

Exemplo em Node (resumo do faturamento do mês):

```js
// reconcilia-saas.mjs
const BASE = process.env.ASAAS_BASE ?? "https://api.asaas.com/v3";
const KEY  = process.env.ASAAS_API_KEY;

const inicio = "2026-06-01";
const fim    = "2026-06-30";

async function* paginar(path, params) {
  let offset = 0;
  const limit = 100;
  while (true) {
    const qs = new URLSearchParams({ ...params, limit, offset });
    const res = await fetch(`${BASE}${path}?${qs}`, {
      headers: { access_token: KEY },
    });
    const json = await res.json();
    for (const item of json.data) yield item;
    if (!json.hasMore) break;
    offset += limit;
  }
}

let total = 0;
let qtd = 0;
const porPlano = {};

// status RECEIVED/CONFIRMED = dinheiro que de fato entrou no período
for (const status of ["RECEIVED", "CONFIRMED"]) {
  for await (const p of paginar("/payments", {
    status,
    "paymentDate[ge]": inicio,
    "paymentDate[le]": fim,
  })) {
    if (!p.externalReference?.startsWith("SAAS-")) continue;
    total += p.value;
    qtd += 1;
    const plano = p.externalReference.split("-")[1] ?? "?";
    porPlano[plano] = (porPlano[plano] ?? 0) + p.value;
  }
}

console.log(`Faturamento SaaS (${inicio} a ${fim}): R$ ${total.toFixed(2)} em ${qtd} cobranças`);
console.table(porPlano);
```

```bash
ASAAS_API_KEY="sua_chave" node reconcilia-saas.mjs
```

> Confirme os nomes dos filtros de data (`paymentDate[ge]` etc.) na doc atual — a sintaxe
> de filtro por período pode mudar.

---

## Contabilidade

- Crie um **centro de custo / classe de receita "SaaS"** no seu plano de contas.
- Bata o número da conciliação contra o **seu banco de dados** (fonte da verdade).
- Se possível, **segregue a saída de caixa**: transfira/saque o que é SaaS para uma
  conta bancária dedicada (ou ao menos marque as transferências). Receita misturada +
  saída misturada = pesadelo de conciliação depois.

---

## Checklist de implementação

- [ ] Definir e documentar o padrão de `externalReference` (`SAAS-{plano}-{customerId}-{...}`)
- [ ] Criar grupo de clientes "SaaS" no Asaas
- [ ] Toda cobrança do SaaS sai com `externalReference` + `description` padronizados
- [ ] Seu sistema guarda `customerId` / `subscriptionId` / `paymentId` do Asaas
- [ ] Config de NFS-e validada com o contador (código de serviço + ISS)
- [ ] Emissão de NFS-e como **serviço** atrelada à cobrança
- [ ] Script/rotina de conciliação mensal rodando
- [ ] Centro de custo "SaaS" criado na contabilidade
- [ ] (Opcional) saída de caixa do SaaS segregada

---

## Quando migrar para o "jeito certo de verdade"

No dia que o SaaS precisar de **dados isolados de verdade** (sócio novo, investidor,
venda da operação, responsabilidade separada):

1. Abrir **CNPJ próprio** para o SaaS (empresa nova ou MEI, conforme porte/atividade).
2. Abrir conta Asaas sob esse novo CNPJ.
3. Como tudo está marcado com `externalReference` **e** sua fonte da verdade é seu
   próprio banco, você sabe exatamente quais clientes/assinaturas migrar — e o histórico
   financeiro continua sendo seu.

> Por isso a camada "fonte da verdade no seu sistema" importa tanto: ela é o que transforma
> "vou conseguir isolar depois" em realidade, em vez de "vou ter que reconstruir histórico
> no grito".
