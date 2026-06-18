# Anotações — Construtor de preços do Homio

> Estudo de referência feito via Playwright MCP em 2026-06-16, navegando em https://www.homio.com.br/#/precos
> A página `#/precos` tem **dois** construtores interativos distintos.

---

## 1) Construtor de plano — "Monte o plano da sua operação"

Configurador principal. Coluna esquerda = controles; coluna direita = card "Resumo" que recalcula em tempo real.

### Controles

**a) Usuários do Sistema** (stepper − / valor / +)
- 1º usuário sempre incluso (grátis).
- Cada usuário adicional: **+R$147/mês**.
- Ex.: 3 usuários → 2 pagos × R$147 = **R$294/mês**.

**b) Volume de Contatos** (slider com 4 steps / "snap")
| Step | Faixa                  | Preço          |
|------|------------------------|----------------|
| 0    | Até 500 contatos       | Incluso (R$0)  |
| 1    | 501 a 5.000 contatos   | R$847/mês      |
| 2    | 5.001 a 10.000 contatos| R$1.247/mês    |
| 3    | Ilimitado              | R$1.697/mês    |

> O slider só assume valores discretos (0–3); não é contínuo.

**c) Canais de Conversa** (gate condicional)
- Com ≤ 500 contatos: bloqueado (ícone de cadeado) — "E-mail, SMS e Instagram liberados apenas a partir de 500 contatos" + botão **"Desbloquear"** (sobe o slider para o 1º tier pago).
- Com > 500 contatos: card fica verde — "Todos os canais de conversa (E-mail, SMS, Instagram) estão ativos".

**d) Add-on "Homio Assist"** (+R$247/mês)
- Treinamento ao vivo e suporte para IA: 4h de mentoria, Grupo VIP, Suporte Prioritário, Onboarding Guiado.
- Botão "Adicionar ao plano" → cria a seção **"Adicionais"** no resumo.

### Card "Resumo" (comportamento dinâmico)

- **Estado gratuito** (1 usuário + até 500 contatos, sem add-ons): mostra "Plano Gratuito / Free Tier", itens como "Incluso", CTA **"Criar conta grátis"**.
- **Estado pago** (qualquer upgrade): aparece toggle **Mensal / Anual (−20%)** e CTA muda para **"Testar grátis por 14 dias"**.
  - Toggle troca qual preço fica em destaque; o outro vira linha secundária.
  - Anual = mensal × 0,8 (badge "−20% OFF").
- Discrimina linhas: "Assinatura Homio" (usuários + faixa de contatos) e "Adicionais".
- Rodapé: "Pagamento seguro e nota fiscal automática."

### Exemplo de cálculo validado
3 usuários + Ilimitado + Homio Assist:
- Usuários R$294 + Contatos R$1.697 + Assist R$247 = **R$2.238/mês** (mensal) → **R$1.790,4/mês** (anual).

### Fórmula geral
```
mensal = 147 * (usuarios - 1)
       + faixaContatos   // {0, 847, 1247, 1697}
       + 247 * (homioAssist ? 1 : 0)
anual  = mensal * 0.8
```

---

## 2) Calculadora de economia — "Você está pagando a 'Taxa do Caos'?"

Ferramenta separada de ROI/comparação (não monta plano; estima economia vs. stack atual).

### Controles
- Toggle de cenário: **Plano Base** / **Plano Empresarial**.
- Chips "Selecione suas ferramentas atuais" (multi-seleção): HubSpot, Pipedrive, ClickFunnels, ActiveCampaign, Kommo CRM, ManyChat, Calendly, RD Station.
- Slider **Tamanho da Equipe**: 1–100 usuários (default 10).

### Saída — card "Relatório Financeiro / Auditoria"
- Lista cada ferramenta selecionada com custo estimado (ex.: HubSpot R$37.800, RD Station R$4.309, Calendly R$7.500, ManyChat R$4.309).
- "Total Atual" somado (ex.: R$53.918,00).
- "Recomendado" → plano Homio equivalente + "Custo Mensal Homio" (ex.: R$3.267,00).
- "Economia anual projetada" + % de redução (ex.: R$607.812 / "Redução de 94% nos custos fixos").
- Data do relatório dinâmica (mostrou 16/06/2026).

---

## Implicações para o aura-site

1. O "construtor de preços" é o configurador #1 — replicável como componente com estado: `{ usuarios, faixaContatos, addons[], ciclo }`.
2. Preço derivado puramente no client (fórmula acima) — fácil de portar; manter a tabela de faixas como fonte única.
3. UX a reaproveitar: stepper de usuários, slider com snap em tiers nomeados, gate de canais por volume, toggle mensal/anual com −20%, e o resumo que troca de "grátis" para "trial 14 dias".
4. A calculadora "Taxa do Caos" é um lead magnet/ROI à parte — opcional para o nosso escopo de pagamento.
5. CTAs levam a cadastro/trial, não a checkout direto (diferente do fluxo Stripe do Zee.lu). Rodapé reforça "nota fiscal automática".
