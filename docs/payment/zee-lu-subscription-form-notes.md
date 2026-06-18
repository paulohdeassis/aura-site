# Anotações — Formulário de assinatura do Zee.lu

> Estudo de referência feito via Playmuright MCP em 2026-06-16, navegando em https://zee.lu/
> Objetivo: servir de base para a integração de pagamento (branch `feat/payment-integration`).

## Visão geral do fluxo

1. **Landing** (`/`) → seção "Planos" (`#planos`) com 3 cards.
2. Cada card tem um botão **"Assinar"** que leva a uma rota de checkout dedicada:
   - Solo → `/checkout/solo`
   - Pro → `/checkout/pro`
   - Studio → `/checkout/studio`
3. **Checkout** (`/checkout/{plano}`) → formulário de dados + botão "Continuar para pagamento".
4. Após submit válido → tela de pagamento (atualmente cai em **"Checkout indisponível"** — ver abaixo).

> Não há formulário de assinatura na própria landing; ele vive só na rota de checkout.

## Planos (preços de referência)

| Plano  | Preço     | Limite de notas      | Destaques                                   | Rota               |
|--------|-----------|----------------------|---------------------------------------------|--------------------|
| Solo   | R$49/mês  | Até 50 notas/mês     | Emissão manual, suporte por email           | `/checkout/solo`   |
| Pro    | R$89/mês  | Até 500 notas/mês    | Integrações ilimitadas, suporte WhatsApp (Mais popular) | `/checkout/pro`    |
| Studio | R$189/mês | Notas ILIMITADAS     | Integrações ilimitadas, suporte prioritário | `/checkout/studio` |

Mensagem recorrente: "Cancele quando quiser. Sem multas ou fidelidade."

## Estrutura do formulário de checkout

Header fixo: botão **"Voltar"** + selo **"Pagamento seguro"** (ícone de cadeado).

Coluna esquerda: resumo do plano (badge, nome, preço, lista de features, nota de cancelamento).
Coluna direita: o formulário em si.

### Campos

**Grupo "Dados pessoais"**
| Campo          | Placeholder          | Tipo     | Máscara / formato                 |
|----------------|----------------------|----------|-----------------------------------|
| Nome completo  | `Seu nome`           | text     | —                                 |
| Email          | `seu@email.com`      | email    | validação de email                |
| Telefone       | `(00) 00000-0000`    | tel      | máscara BR: `(27) 99988-7766`     |

**Grupo "Dados fiscais"**
| Campo          | Placeholder            | Tipo     | Máscara / formato                  |
|----------------|------------------------|----------|------------------------------------|
| CNPJ           | `00.000.000/0000-00`   | text     | máscara: `66.812.648/0001-70`      |

- Checkbox **"Receber notas fiscais no email de cadastro"** — marcado por padrão.

**Aceite**
- Checkbox **"Li e aceito os Termos de Uso e a Política de Privacidade"** — desmarcado por padrão; obrigatório. Links para `/termos` e `/privacidade`.

**Ação**
- Botão **"Continuar para pagamento"** (largura total, laranja).

## Comportamento / validação observado

- **Máscaras automáticas** funcionam ao digitar (telefone e CNPJ formatam sozinhos).
- **Validação no submit**: ao enviar vazio, aparecem erros inline por campo:
  - "Informe seu nome"
  - "Informe um email válido"
  - "Informe um telefone válido"
  - "Informe um CNPJ válido"
  - "Você precisa aceitar os termos para continuar"
- ⚠️ **Bug de UX**: as mensagens de erro **não limpam ao preencher/blur** — só re-avaliam no próximo submit. Com todos os campos válidos os erros continuam visíveis até reenviar. (Vale evitar isso na nossa implementação: validar on-change/on-blur, não só on-submit.)
- Submit com dados válidos limpa os erros e avança.

## Provedor de pagamento

- O front carrega **Stripe.js** (console mostra request para `m.stripe.com`).
- Sugere checkout via Stripe (provavelmente Stripe Checkout / Payment Element + assinaturas recorrentes).

## Estado atual do checkout

- Após submit válido, a tela mostra **"Checkout indisponível"**:
  > "Nosso sistema de pagamento está temporariamente fora do ar. Por favor, tente novamente mais tarde ou entre em contato conosco."
- Opções: botão "Tentar novamente" + contatos (contato@zee.lu / (27) 3191-4466).
- Provável causa: backend de pagamento / chaves não configurados (ou bloqueio de rede no ambiente de teste).

## Pré-requisitos do usuário (mencionados na landing)

Antes do pré-cadastro o fotógrafo precisa ter: **CNPJ ativo**, **Inscrição Municipal**, **Certificado Digital A1**.
(Obs.: a Inscrição Municipal e o Certificado A1 NÃO são coletados no formulário de checkout — provavelmente entram numa etapa de onboarding pós-pagamento, no `app.zee.lu`.)

## Implicações para a nossa integração (aura-site)

1. Modelar 3 planos recorrentes mensais (Solo / Pro / Studio) como produtos/preços no provedor.
2. Rota de checkout por plano: `/checkout/[plano]`.
3. Coletar: nome, email, telefone, CNPJ + 2 consentimentos (notas no email, termos).
4. Validar com máscara BR (telefone, CNPJ) e validação on-change (evitar o bug de erro persistente do Zee.lu).
5. Definir provedor: Zee.lu usa Stripe; confirmar se vamos seguir o mesmo.
6. Etapa de pagamento e tratamento de indisponibilidade (tela de fallback com retry + contato).
