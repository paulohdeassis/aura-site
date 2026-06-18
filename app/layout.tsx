import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Aura for Stay — Sistema Operacional de Hospedagem",
  description: "PMS completo para pousadas, hotéis boutique e aluguel por temporada. Tudo em um lugar, preço transparente, feito para o Brasil.",
  openGraph: {
    title: "Aura for Stay",
    description: "Sistema operacional de hospedagem all-in-one para pousadas e aluguel por temporada.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
