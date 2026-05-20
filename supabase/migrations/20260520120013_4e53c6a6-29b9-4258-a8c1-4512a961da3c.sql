-- Adiciona colunas para Evolution API e Typebot
ALTER TABLE public.configuracoes_oficina 
ADD COLUMN IF NOT EXISTS evolution_api_url TEXT,
ADD COLUMN IF NOT EXISTS evolution_api_key TEXT,
ADD COLUMN IF NOT EXISTS evolution_instance_name TEXT,
ADD COLUMN IF NOT EXISTS typebot_url TEXT,
ADD COLUMN IF NOT EXISTS typebot_name TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.configuracoes_oficina.evolution_api_url IS 'URL da API do Evolution API';
COMMENT ON COLUMN public.configuracoes_oficina.evolution_api_key IS 'Chave de API (apikey) do Evolution API';
COMMENT ON COLUMN public.configuracoes_oficina.evolution_instance_name IS 'Nome da instância no Evolution API';
COMMENT ON COLUMN public.configuracoes_oficina.typebot_url IS 'URL do servidor Typebot';
COMMENT ON COLUMN public.configuracoes_oficina.typebot_name IS 'Nome (slug) do Typebot para autoatendimento';
