# 🚀 Organizador de Clientes (OLC) - Enterprise Edition

Uma aplicação web de alta performance desenvolvida com **Next.js 15** e **TypeScript** para limpeza, padronização e enriquecimento de bases de dados de clientes.

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🌟 Diferenciais Técnicos

- **Alta Performance:** Processamento de **mais de 120.000 registros em segundos** utilizando estruturas de dados otimizadas (Hash Maps/Sets) em memória.
- **Parser Inteligente de Endereço:** Algoritmo avançado que separa Rua, Número, Bairro e Complemento mesmo em strings sem delimitadores claros.
- **Validação Híbrida:** Integração com **BrasilAPI** (via Proxy Server-side) e suporte a **Base de Bairros Local (CSV)** para validação offline.
- **Expansão Dinâmica:** Suporte a múltiplos endereços na mesma célula (separados por `;`), gerando automaticamente novas entradas.
- **Arquitetura Moderna:** Componentização total, Hooks customizados e Proxy de API para contornar problemas de CORS.

## 🛠️ Funcionalidades

- [x] Upload de CSV com detecção automática de encoding.
- [x] Mapeamento interativo de colunas (De/Para).
- [x] Formatação automática de telefones (apenas números ou padrão Brasil).
- [x] Enriquecimento de dados via API de CEP e IBGE.
- [x] Renomeação de colunas em tempo real no preview.
- [x] Exportação separada de registros **Válidos** e **Inválidos** (com motivo da falha).

## 🚀 Como rodar o projeto

1. Clone o repositório:
   git clone https://github.com/Teagogs/Lista-de-Clientes.git
   
3. Instale as dependências:
    npm install

4. Inicie o servidor de desenvolvimento:
    npm run dev
