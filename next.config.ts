import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixa a raiz do workspace neste diretório. Sem isto, o Next detecta um
  // package-lock.json órfão na pasta do usuário e infere a raiz errada.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
