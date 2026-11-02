# Cardápio digital com pedido pelo WhatsApp

Site de cardápio para uma pastelaria fictícia, a Mão Cheia. O cliente monta o pedido pelo celular e envia tudo pronto para o WhatsApp da loja, sem cadastro.

**Ver funcionando:** https://juliohguedes.github.io/cardapio-pastelaria/

## O que ele faz

- Cardápio por categorias, com foto, nome, descrição e preço
- Escolha de tamanho, quantidade e adicionais em cada item
- Carrinho com total atualizado na hora e guardado ao recarregar a página
- Número automático para cada pedido
- Campos de entrega e forma de pagamento, incluídos na mensagem
- Botão que abre o WhatsApp com o pedido já formatado, por link `wa.me`
- Layout feito primeiro para celular, com carrinho lateral no computador

## Painel da loja

Fica em `#/admin`.

- Resumo com total de pedidos enviados, pedidos do dia, valor somado, valor médio e lista dos últimos pedidos
- Cadastro de produtos com foto, nome, descrição, categoria, preço e tamanhos
- Edição de adicionais e seus preços
- Botão para marcar produto como esgotado e busca por nome
- Nome da loja e número do WhatsApp

## Tecnologias

React, TypeScript, Vite e Vitest. Publicado no GitHub Pages por GitHub Actions.

## Como rodar

```bash
npm install
npm run dev
```

Para rodar os testes:

```bash
npm test
```

## Como está organizado

| Pasta ou arquivo | O que tem |
| --- | --- |
| `src/lib/order.ts` | Regras do pedido: preço, carrinho, mensagem e link do WhatsApp, com testes em `order.test.ts` |
| `src/lib/money.ts` | Conversão de preços em reais; tudo é calculado em centavos |
| `src/data/store.ts` | Leitura e gravação dos dados |
| `src/data/seed.ts` | Cardápio inicial |
| `src/components` | Telas do site e do painel |

## Limites desta demonstração

Por ser um site estático, os dados ficam no navegador de quem usa. Por isso:

- Alterações no painel valem só naquele navegador.
- O total e a numeração dos pedidos são separados em cada aparelho.
- O pedido conta quando o cliente toca em enviar; o site não sabe se a mensagem foi enviada dentro do WhatsApp.
- O painel está aberto, sem senha.
- Sem número configurado no painel, o WhatsApp pede para escolher o contato.

Para uma loja de verdade, o painel precisa de senha, e os dados e a numeração precisam ficar em um banco de dados. Toda a leitura e a gravação já passam por `src/data/store.ts`, e é ali que essa troca começa.

## Fotos

As fotos são do Wikimedia Commons, e os autores e licenças estão em [CREDITOS.md](CREDITOS.md).

## Autor

Julio Guedes

© 2026 Julio Guedes. Código com todos os direitos reservados.
