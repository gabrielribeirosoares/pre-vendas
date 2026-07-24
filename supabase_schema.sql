-- ==============================================================================
-- SCHEMA DO BANCO DE DADOS SUPABASE - SISTEMA DE PRÉ-VENDAS DIECAST
-- Execute este script no SQL Editor do seu projeto no Supabase Dashboard
-- ==============================================================================

-- 1. TABELA DE MODELOS EM PRÉ-VENDA (ITEMS)
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_id TEXT NOT NULL DEFAULT 'mini_gt',
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    scale TEXT DEFAULT '1:64',
    retail_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    min_deposit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    wholesale_cost NUMERIC(10, 2) DEFAULT 0.00,
    release_quarter TEXT DEFAULT 'Q3 2026',
    status TEXT DEFAULT 'pre_order_open',
    image_url TEXT,
    description TEXT,
    store_buffer_units INT DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE COLECIONADORES / CLIENTES (CUSTOMERS)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    instagram TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE RESERVAS DE PRÉ-VENDA (RESERVATIONS)
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    deposit_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'deposit_paid',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE CONFIGURAÇÕES DA LOJA (STORE SETTINGS)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    store_name TEXT DEFAULT 'Miniatures Pre-Orders Club',
    pix_key TEXT DEFAULT 'pix@miniaturasprevendas.com.br',
    primary_color TEXT DEFAULT '#38bdf8',
    secondary_color TEXT DEFAULT '#a855f7',
    theme_mode TEXT DEFAULT 'dark',
    logo_url TEXT,
    favicon_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HABILITAR ROW LEVEL SECURITY (RLS) PARA SEGURANÇA POR USUÁRIO
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS (Cada usuário acessa somente os seus próprios dados)
CREATE POLICY "Usuários acessam apenas seus próprios itens"
    ON public.items FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários acessam apenas seus próprios clientes"
    ON public.customers FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários acessam apenas suas próprias reservas"
    ON public.reservations FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários acessam apenas suas próprias configurações"
    ON public.store_settings FOR ALL
    USING (auth.uid() = user_id);
