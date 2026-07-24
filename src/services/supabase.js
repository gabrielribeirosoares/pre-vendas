import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseUrl !== 'https://sua-url-do-projeto.supabase.co' &&
  supabaseAnonKey.trim().length > 10
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Auth Helpers
export const signUpUser = async ({ email, password, fullName, storeName }) => {
  if (!isSupabaseConfigured || !supabase) {
    const demoUser = { id: `demo-user-${Date.now()}`, email, user_metadata: { full_name: fullName, store_name: storeName } };
    localStorage.setItem('diecast_demo_user', JSON.stringify(demoUser));
    return { data: { user: demoUser }, error: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        store_name: storeName,
      },
    },
  });

  return { data, error };
};

export const signInUser = async ({ email, password }) => {
  if (!isSupabaseConfigured || !supabase) {
    const demoUser = { id: 'demo-user-123', email, user_metadata: { full_name: 'Colecionador Lojista', store_name: 'Diecast Pre-Orders Store' } };
    localStorage.setItem('diecast_demo_user', JSON.stringify(demoUser));
    return { data: { user: demoUser }, error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const signOutUser = async () => {
  if (!isSupabaseConfigured || !supabase) {
    localStorage.removeItem('diecast_demo_user');
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetUserPassword = async (email) => {
  if (!isSupabaseConfigured || !supabase) {
    return { error: null };
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
};

// Database Mappers & Helpers
export const fetchSupabaseData = async (userId) => {
  if (!isSupabaseConfigured || !supabase || !userId) return null;

  try {
    const [itemsRes, custRes, resRes, settingsRes] = await Promise.all([
      supabase.from('items').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('customers').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('reservations').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('store_settings').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    // Deduplicate items by SKU to prevent duplicated multiplying records from past saves
    const rawItems = itemsRes.data || [];
    const uniqueItemsMap = new Map();
    rawItems.forEach((i) => {
      const key = i.sku ? i.sku.trim() : i.id;
      if (!uniqueItemsMap.has(key)) {
        uniqueItemsMap.set(key, i);
      }
    });

    const items = Array.from(uniqueItemsMap.values()).map(i => ({
      id: i.id,
      brandId: i.brand_id,
      sku: i.sku,
      name: i.name,
      scale: i.scale,
      retailPrice: Number(i.retail_price || 0),
      minDeposit: Number(i.min_deposit || 0),
      wholesaleCost: Number(i.wholesale_cost || 0),
      releaseQuarter: i.release_quarter,
      status: i.status,
      imageUrl: i.image_url,
      description: i.description,
      storeBufferUnits: Number(i.store_buffer_units || 0),
      createdAt: i.created_at,
    }));

    // Deduplicate customers by ID
    const rawCust = custRes.data || [];
    const uniqueCustMap = new Map();
    rawCust.forEach((c) => {
      const key = c.name ? c.name.trim() : c.id;
      if (!uniqueCustMap.has(key)) {
        uniqueCustMap.set(key, c);
      }
    });

    const customers = Array.from(uniqueCustMap.values()).map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      instagram: c.instagram,
      notes: c.notes,
      createdAt: c.created_at,
    }));

    const reservations = (resRes.data || []).map(r => ({
      id: r.id,
      customerId: r.customer_id,
      itemId: r.item_id,
      quantity: Number(r.quantity || 1),
      depositPaid: Number(r.deposit_paid || 0),
      totalPrice: Number(r.total_price || 0),
      status: r.status,
      notes: r.notes,
      createdAt: r.created_at,
    }));

    const settings = settingsRes.data ? {
      storeName: settingsRes.data.store_name,
      pixKey: settingsRes.data.pix_key,
      primaryColor: settingsRes.data.primary_color || '#38bdf8',
      secondaryColor: settingsRes.data.secondary_color || '#a855f7',
      themeMode: settingsRes.data.theme_mode || 'dark',
      logoUrl: settingsRes.data.logo_url || '',
      faviconUrl: settingsRes.data.favicon_url || '',
    } : null;

    return { items, customers, reservations, settings };
  } catch (err) {
    console.error('Erro ao buscar dados do Supabase:', err);
    return null;
  }
};

export const saveSupabaseItem = async (item, userId) => {
  if (!isSupabaseConfigured || !supabase || !userId) return item;
  const payload = {
    user_id: userId,
    brand_id: item.brandId || 'mini_gt',
    sku: item.sku || '',
    name: item.name || '',
    scale: item.scale || '1:64',
    retail_price: item.retailPrice || 0,
    min_deposit: item.minDeposit || 0,
    wholesale_cost: item.wholesaleCost || 0,
    release_quarter: item.releaseQuarter || 'Q3 2026',
    status: item.status || 'pre_order_open',
    image_url: item.imageUrl || '',
    description: item.description || '',
    store_buffer_units: item.storeBufferUnits || 0,
  };

  // Include id if valid UUID (not demo string id)
  if (item.id && !item.id.startsWith('item-')) {
    payload.id = item.id;
  }

  const { data } = await supabase.from('items').upsert(payload).select();
  if (data && data[0]) {
    return {
      ...item,
      id: data[0].id,
    };
  }
  return item;
};

export const deleteSupabaseItem = async (itemId) => {
  if (!isSupabaseConfigured || !supabase || !itemId) return;
  if (!itemId.startsWith('item-')) {
    await supabase.from('items').delete().eq('id', itemId);
  }
};

export const saveSupabaseCustomer = async (cust, userId) => {
  if (!isSupabaseConfigured || !supabase || !userId) return cust;
  const payload = {
    user_id: userId,
    name: cust.name || '',
    phone: cust.phone || '',
    instagram: cust.instagram || '',
    notes: cust.notes || '',
  };

  if (cust.id && !cust.id.startsWith('cust-')) {
    payload.id = cust.id;
  }

  const { data } = await supabase.from('customers').upsert(payload).select();
  if (data && data[0]) {
    return {
      ...cust,
      id: data[0].id,
    };
  }
  return cust;
};

export const deleteSupabaseCustomer = async (custId) => {
  if (!isSupabaseConfigured || !supabase || !custId) return;
  if (!custId.startsWith('cust-')) {
    await supabase.from('customers').delete().eq('id', custId);
  }
};

export const saveSupabaseReservation = async (res, userId) => {
  if (!isSupabaseConfigured || !supabase || !userId) return res;
  const payload = {
    user_id: userId,
    customer_id: res.customerId && !res.customerId.startsWith('cust-') ? res.customerId : null,
    item_id: res.itemId && !res.itemId.startsWith('item-') ? res.itemId : null,
    quantity: res.quantity || 1,
    deposit_paid: res.depositPaid || 0,
    total_price: res.totalPrice || 0,
    status: res.status || 'deposit_paid',
    notes: res.notes || '',
  };

  if (res.id && !res.id.startsWith('res-')) {
    payload.id = res.id;
  }

  const { data } = await supabase.from('reservations').upsert(payload).select();
  if (data && data[0]) {
    return {
      ...res,
      id: data[0].id,
    };
  }
  return res;
};

export const deleteSupabaseReservation = async (resId) => {
  if (!isSupabaseConfigured || !supabase || !resId) return;
  if (!resId.startsWith('res-')) {
    await supabase.from('reservations').delete().eq('id', resId);
  }
};

export const saveSupabaseSettings = async (settings, userId) => {
  if (!isSupabaseConfigured || !supabase || !userId) return;
  try {
    const payload = {
      user_id: userId,
      store_name: settings.storeName || '',
      pix_key: settings.pixKey || '',
      primary_color: settings.primaryColor || '#38bdf8',
      secondary_color: settings.secondaryColor || '#a855f7',
      theme_mode: settings.themeMode || 'dark',
      logo_url: settings.logoUrl || '',
      favicon_url: settings.faviconUrl || '',
    };

    const { data: existing } = await supabase
      .from('store_settings')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing && existing.id) {
      await supabase
        .from('store_settings')
        .update(payload)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('store_settings')
        .insert([payload]);
    }
  } catch (err) {
    console.error('Erro ao salvar store_settings no Supabase:', err);
  }
};
