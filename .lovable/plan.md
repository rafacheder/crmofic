## Causa

Em `src/routes/_app.kanban.tsx` linha 105, há um `useMemo` chamado **dentro de um ternário no JSX**:

```tsx
{columns.length > 0 ? useMemo(() => columns.map(...), [...]) : (
  <div>Nenhuma coluna...</div>
)}
```

Isso viola as Regras dos Hooks. Quando `columns.length` muda de 0 para >0 (ou vice-versa), o número de hooks executados muda → React lança "Rendered more hooks than during the previous render", quebrando a tela.

Há também um early `return` em `if (isLoading)` antes desse hook, o que agrava o problema: a contagem de hooks varia entre renders de loading e pós-loading.

## Correção

Remover o `useMemo` (mapear colunas é barato, não justifica memoização) e simplesmente inlinear `columns.map(...)`:

```tsx
{columns.length > 0 ? columns.map((col) => { ... }) : (
  <div>Nenhuma coluna...</div>
)}
```

Apenas substituir a expressão `useMemo(() => columns.map(...), [deps])` por `columns.map(...)`. Sem mudanças de comportamento.

## Fora de escopo

- Reorganizar os outros hooks ou o early return de loading (não causam o crash atual).
