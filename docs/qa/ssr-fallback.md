# Testes de Fallback de Erro

## 1. Fallback SSR (HTML Estático)
1. Abra o arquivo `src/server.ts`.
2. Temporariamente mude o `getServerEntry` para dar throw: `throw new Error("SSR Fail Test")`.
3. Publique ou acesse o ambiente de preview.
4. Você deve ver a página estilizada em pt-BR com o ícone de alerta e botões "Tentar novamente".

## 2. Fallback React (ErrorComponent)
1. No arquivo `src/routes/admin.tsx` (ou qualquer rota admin), adicione um throw no loader ou componente: `throw new Error("React Error Test")`.
2. Acesse a rota.
3. Você deve ver o componente `AppErrorFallback` com a mensagem em pt-BR e o ícone AlertTriangle.

## 3. Chunk Error Handler
1. Abra o console do navegador.
2. Execute: `window.dispatchEvent(new ErrorEvent('error', { message: 'Failed to fetch dynamically imported module' }))`.
3. Um banner roxo/escuro deve aparecer no topo avisando sobre a nova versão e oferecendo um botão de recarregar.
