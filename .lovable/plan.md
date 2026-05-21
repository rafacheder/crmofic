## Adicionar "Excluir" e "Mudar plano" em /admin/oficinas

Hoje o menu Ações só permite: registrar pagamento, ativar/suspender e estender trial. Faltam duas ações: trocar o plano de uma oficina sem precisar registrar pagamento, e excluir a oficina.

### 1. Banco (migration)

Adicionar uma função RPC `admin_excluir_oficina(p_oficina_id uuid)` `SECURITY DEFINER`, que:
- Verifica `is_super_admin()`, senão lança exceção.
- Apaga em cascata os dados da oficina: `os_fotos`, `os_historico`, `os_itens` (via `ordens_servico`), `ordens_servico`, `agendamentos`, `lembretes`, `veiculos`, `clientes`, `catalogo_servicos`, `catalogo_produtos`, `templates_mensagem`, `automacoes_kanban` (via `kanban_colunas`), `kanban_colunas`, `configuracoes_oficina`, `assinaturas`, `usuarios` e por fim `oficinas`.
- Observação: usuários da oficina ficam órfãos em `auth.users` (não tocamos nesse schema reservado). Documentar no diálogo de confirmação.

Para "mudar plano" reutilizar a RPC já existente `admin_atualizar_oficina(p_oficina_id, p_plano_id := ...)`. Nenhuma migration necessária para isso.

### 2. Hook `useAdmin`

- Adicionar mutation `excluirOficina(oficina_id)` chamando `supabase.rpc("admin_excluir_oficina", { p_oficina_id })`, invalidando `["admin_oficinas"]`.
- Expor `excluirOficina` e incluir em `isUpdating`.

### 3. UI `src/routes/admin.oficinas.tsx`

No `DropdownMenu` de cada linha, adicionar dois novos itens:

- **"Mudar plano"** → abre novo `Dialog` `planoDialog` (state já declarado mas não usado) com:
  - `Select` listando `planos` ativos.
  - Botão "Salvar" chama `atualizarOficina({ oficina_id, plano_id })`.
- **"Excluir oficina"** (item destrutivo, ícone `Trash2` vermelho) → abre `AlertDialog` de confirmação:
  - Texto: "Excluir **{nome}**? Todos os dados (OS, clientes, veículos, agendamentos, usuários da oficina) serão removidos permanentemente. Esta ação não pode ser desfeita."
  - Confirmar chama `excluirOficina(o.id)`.

Imports a adicionar: `Trash2`, `Package` (ou similar) do lucide; componentes `AlertDialog*` de `@/components/ui/alert-dialog`.

### Fora de escopo
- Remover usuários de `auth.users` (schema reservado).
- Soft-delete / restauração.
- Log de auditoria das exclusões.
