import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixa a raiz do workspace neste diretório. Sem isto, o Next detecta um
  // package-lock.json órfão na pasta do usuário e infere a raiz errada.
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Desliga o cache de filesystem do Turbopack no dev. A partir do Next 16.1
    // ele vem LIGADO por padrão e cresce em memória enquanto o servidor fica de
    // pé — chegava a ~8GB com o dev ocioso por ~1h. Custo de desligar: restart
    // a frio fica um pouco mais lento. Reative quando o leak estiver resolvido
    // upstream. Ver node_modules/next/dist/docs/.../turbopackFileSystemCache.md
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
