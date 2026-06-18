// Máscaras, formatação e validação dos campos do checkout.
// Tudo client-safe (sem dependências de servidor).

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata centavos (inteiro) como moeda BRL — ex.: 4990 → "R$ 49,90". */
export function formatBRL(cents: number): string {
  return brl.format(cents / 100);
}

// ─── Máscaras ───────────────────────────────────────────────────────

const onlyDigits = (v: string) => v.replace(/\D/g, "");

/** (00) 00000-0000 — aceita fixo (10) e celular (11). */
export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.replace(/(\d{0,2})/, "($1");
  if (d.length <= 6) return d.replace(/(\d{2})(\d{0,4})/, "($1) $2");
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

/** 00.000.000/0000-00 */
export function maskCNPJ(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

/** 000.000.000-00 */
export function maskCPF(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return d.replace(/(\d{3})(\d{0,3})/, "$1.$2");
  if (d.length <= 9) return d.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
}

/** Máscara dinâmica: até 11 dígitos formata como CPF; acima disso, como CNPJ. */
export function maskCpfCnpj(value: string): string {
  const d = onlyDigits(value);
  return d.length <= 11 ? maskCPF(d) : maskCNPJ(d);
}

// ─── Validação ──────────────────────────────────────────────────────

export function isValidName(value: string): boolean {
  return value.trim().length >= 2;
}

export function isValidEmail(value: string): boolean {
  // suficiente para UI; a validação dura é do gateway/back depois.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const d = onlyDigits(value);
  return d.length === 10 || d.length === 11;
}

/** Valida CNPJ por tamanho + dígitos verificadores. */
export function isValidCNPJ(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(d)) return false; // rejeita sequências iguais

  const calc = (base: string, weights: number[]) => {
    const sum = weights.reduce((acc, w, i) => acc + Number(base[i]) * w, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dv1 = calc(d.slice(0, 12), w1);
  const dv2 = calc(d.slice(0, 12) + dv1, w2);
  return dv1 === Number(d[12]) && dv2 === Number(d[13]);
}

/** Valida CPF por tamanho + dígitos verificadores (algoritmo da Receita). */
export function isValidCPF(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false; // rejeita sequências iguais

  // DV de N dígitos: soma d[i]*(N+1-i), resto = (soma*10)%11 (10 vira 0).
  const dv = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10]);
}

/** Aceita CPF (11 dígitos) ou CNPJ (14), validando os dígitos verificadores de cada um. */
export function isValidCpfCnpj(value: string): boolean {
  const len = onlyDigits(value).length;
  if (len === 11) return isValidCPF(value);
  if (len === 14) return isValidCNPJ(value);
  return false;
}

// ─── Cartão de crédito / CEP ────────────────────────────────────────

/** #### #### #### #### — agrupa em blocos de 4, até 19 dígitos. */
export function maskCardNumber(value: string): string {
  return onlyDigits(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

/** MM/AA */
export function maskExpiry(value: string): string {
  const d = onlyDigits(value).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

/** Só dígitos, 3–4 (CVV). */
export function maskCVV(value: string): string {
  return onlyDigits(value).slice(0, 4);
}

/** 00000-000 */
export function maskCEP(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

/** Valida número de cartão por tamanho + algoritmo de Luhn. */
export function isValidCardNumber(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

/** Valida validade MM/AA: mês 1–12 e não vencido. */
export function isValidExpiry(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 4) return false;
  const month = Number(d.slice(0, 2));
  const year = 2000 + Number(d.slice(2));
  if (month < 1 || month > 12) return false;
  const now = new Date();
  // Vence no último dia do mês informado.
  const expiry = new Date(year, month, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return expiry >= today;
}

export function isValidCVV(value: string): boolean {
  const d = onlyDigits(value);
  return d.length === 3 || d.length === 4;
}

export function isValidCEP(value: string): boolean {
  return onlyDigits(value).length === 8;
}

/** Converte "MM/AA" em { month: "MM", year: "AAAA" } para o Asaas. */
export function parseExpiry(value: string): { month: string; year: string } {
  const d = onlyDigits(value);
  return { month: d.slice(0, 2), year: String(2000 + Number(d.slice(2))) };
}

export const stripDigits = onlyDigits;
