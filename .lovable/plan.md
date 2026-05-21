## Objetivo

No painel super admin (`/admin/oficinas`):
1. Botão **"Nova Oficina"** que cria a oficina + usuário DONO (com senha definida pelo admin).
2. Ação **"Editar oficina"** em cada linha — editar dados da oficina e dados/senha do DONO.

## Backend (migration)

Criar duas RPCs `SECURITY DEFINER` (gate `is_super_admin()`):

### `admin_criar_oficina(p_nome, p_email, p_telefone, p_cnpj, p_endereco, p_plano_id, p_status, p_dono_nome, p_dono_email, p_dono_senha)`
- Cria usuário em `auth.users` via inserção direta com senha já hasheada (`crypt(p_dono_senha, gen_salt('bf'))`) e `email_confirmed_at = now()`.
- Insere `oficinas` (nome, email, telefone, cnpj, endereco, plano_id, status).
- Insere `usuarios` (id = novo auth user, oficina_id, nome, email, cargo='DONO', ativo=true).
- Cria as 8 colunas kanban padrão (mesmo padrão de `criar_oficina_e_usuario`).
- Retorna `oficina_id`.

### `admin_editar_oficina(p_oficina_id, p_nome, p_email, p_telefone, p_cnpj, p_endereco, p_plano_id, p_status, p_trial_ate, p_dono_user_id?, p_dono_nome?, p_dono_email?, p_dono_senha?)`
- `UPDATE oficinas` com campos não-nulos (COALESCE).
- Se `p_dono_user_id` informado: atualiza `usuarios.nome/email`; se `p_dono_senha` informada, faz `UPDATE auth.users SET encrypted_password = crypt(...), email = COALESCE(...)` para esse id.

### `admin_listar_oficinas` — estender retorno
Adicionar colunas `cnpj`, `endereco`, `plano_id`, `dono_id`, `dono_nome`, `dono_email` (LEFT JOIN no usuário com `cargo='DONO'` LIMIT 1) para alimentar o diálogo de edição sem fetch extra.

## Frontend

### `src/hooks/useAdmin.ts`
- Tipo `OficinaAdmin` ganha os campos novos acima.
- Mutations: `criarOficina` e `editarOficina` (chamando as RPCs, invalidando `["admin_oficinas"]`).
- Incluir `isPending` no `isUpdating`.

### `src/routes/admin.oficinas.tsx`
- Header: botão **"Nova Oficina"** abrindo `Dialog` com formulário (Zod):
  - Dados da oficina: nome*, email, telefone, cnpj, endereço, plano (Select), status (Select: trial/ativo/inativo).
  - Dados do dono: nome*, email* (válido), senha* (mín 8).
- Novo item no `DropdownMenu` de cada linha: **"Editar oficina"** — abre `Dialog` similar, pré-preenchido. Campo senha do dono é opcional ("deixe em branco para manter"). Mantém os itens já existentes (Mudar plano, Registrar pagamento, Excluir).

## Detalhes técnicos

- Senha tratada via `crypt()`/`gen_salt('bf')` da extensão `pgcrypto` (já disponível no Supabase). Inserir/atualizar em `auth.users` direto é aceitável dentro de função `SECURITY DEFINER` restrita a super_admin; alternativa seria criar usuário em `auth.users` mais um registro em `auth.identities` — para simplicidade, gravamos `auth.users` com `email_confirmed_at = now()`, `aud='authenticated'`, `role='authenticated'`, `instance_id='00000000-0000-0000-0000-000000000000'`, e `raw_app_meta_data/raw_user_meta_data` mínimos, mais `auth.identities` com `provider='email'`, `provider_id=email`, `identity_data = jsonb_build_object('sub', id, 'email', email)`.
- Validações client-side com Zod (email, senha mín 8, nome mín 2).
- Toasts de sucesso/erro reutilizando padrão atual.

## Fora de escopo

- Edição de avatar/logo upload.
- Reenvio de e-mail de confirmação (usuário já criado confirmado).
- Recuperação de histórico de senhas.
