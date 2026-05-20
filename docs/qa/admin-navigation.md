# Checklist de Teste Manual: Navegação Admin

Este roteiro valida a integridade da navegação do módulo administrativo.

## Pré-requisitos
- Estar logado com uma conta que tenha privilégios de `super_admin`.

## Passos de Verificação

### 1. Visibilidade na Sidebar
- [ ] O grupo "Administração" deve aparecer na parte inferior do conteúdo da sidebar.
- [ ] Deve conter os itens: "Admin Dashboard", "Oficinas" e "Planos".

### 2. Navegação Dashboard Admin
- [ ] Clicar em **Admin Dashboard**.
- [ ] A URL deve mudar para `/admin`.
- [ ] O dashboard com estatísticas gerais deve ser renderizado.
- [ ] O item "Admin Dashboard" na sidebar deve aparecer como **ativo**.

### 3. Navegação Oficinas
- [ ] Clicar em **Oficinas**.
- [ ] A URL deve mudar para `/admin/oficinas`.
- [ ] A tabela de oficinas deve carregar corretamente.
- [ ] O item "Oficinas" na sidebar deve aparecer como **ativo**, e "Admin Dashboard" **não** deve estar ativo.

### 4. Navegação Planos
- [ ] Clicar em **Planos**.
- [ ] A URL deve mudar para `/admin/planos`.
- [ ] A interface de CRUD de planos deve ser exibida.
- [ ] O item "Planos" na sidebar deve aparecer como **ativo**.

### 5. Persistência e 404
- [ ] Dar F5 (refresh) na página `/admin/oficinas`.
- [ ] A página deve recarregar corretamente sem erro de rota (404).
- [ ] O `RouteValidator` não deve disparar alertas de erro de integridade se a rota existir fisicamente.

### 6. Proteção de Acesso
- [ ] Tentar acessar `/admin` com um usuário comum.
- [ ] O sistema deve redirecionar para a home ou exibir mensagem de acesso negado (conforme implementado em `useAdmin`).
- [ ] A sidebar não deve exibir links administrativos para este usuário.
