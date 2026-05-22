-- Remove a versão antiga da função que não incluía os campos de integração WhatsApp
DROP FUNCTION IF EXISTS public.admin_editar_oficina(
    p_oficina_id uuid, 
    p_nome text, 
    p_email text, 
    p_telefone text, 
    p_cnpj text, 
    p_endereco text, 
    p_plano_id uuid, 
    p_status text, 
    p_trial_ate timestamp with time zone, 
    p_dono_user_id uuid, 
    p_dono_nome text, 
    p_dono_email text, 
    p_dono_senha text
);