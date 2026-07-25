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
      storeName: settingsRes.data.store_name ?? null,
      pixKey: settingsRes.data.pix_key ?? null,
      primaryColor: settingsRes.data.primary_color ?? null,
      secondaryColor: settingsRes.data.secondary_color ?? null,
      themeMode: settingsRes.data.theme_mode ?? null,
      logoUrl: settingsRes.data.logo_url ?? null,
      faviconUrl: settingsRes.data.favicon_url ?? null,
    } : null;

    return { items, customers, reservations, settings };
  } catch (err) {
    console.error('Erro ao buscar dados do Supabase:', err);
    return null;
  }
};

export const fetchPublicStoreBySlug = async (slug) => {
  if (!isSupabaseConfigured || !supabase || !slug) return null;

  try {
    console.log('[Supabase] Buscando loja pública pelo slug:', slug);
    const { data: allSettings, error } = await supabase.from('store_settings').select('*');
    
    if (error) {
      console.error('[Supabase] Erro ao buscar store_settings:', error);
      return null;
    }
    if (!allSettings || allSettings.length === 0) {
      console.log('[Supabase] Nenhuma store_settings encontrada');
      return null;
    }

    console.log('[Supabase] Lojas encontradas:', allSettings.length);

    const matched = allSettings.find((s) => {
      if (!s.store_name) return false;
      const sSlug = s.store_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return sSlug === slug;
    });

    if (matched) {
      console.log('[Supabase] Loja encontrada:', matched.store_name, '| user_id:', matched.user_id);
      return {
        userId: matched.user_id,
        storeName: matched.store_name,
        pixKey: matched.pix_key || '',
        primaryColor: matched.primary_color || '#38bdf8',
        secondaryColor: matched.secondary_color || '#a855f7',
        themeMode: matched.theme_mode || 'dark',
        logoUrl: matched.logo_url || '',
        faviconUrl: matched.favicon_url || '',
      };
    }

    console.log('[Supabase] Nenhuma loja correspondente ao slug:', slug);
  } catch (err) {
    console.error('[Supabase] Erro ao buscar loja pública por slug:', err);
  }
  return null;
};

// Fetch public store items, customers and reservations by store owner user_id
export const fetchPublicStoreItems = async (storeUserId) => {
  if (!isSupabaseConfigured || !supabase || !storeUserId) return null;

  try {
    const [itemsRes, custRes, resRes] = await Promise.all([
      supabase.from('items').select('*').eq('user_id', storeUserId).order('created_at', { ascending: false }),
      supabase.from('customers').select('*').eq('user_id', storeUserId).order('created_at', { ascending: false }),
      supabase.from('reservations').select('*').eq('user_id', storeUserId).order('created_at', { ascending: false }),
    ]);

    const items = (itemsRes.data || []).map(i => ({
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

    const customers = (custRes.data || []).map(c => ({
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

    return { items, customers, reservations };
  } catch (err) {
    console.error('[Supabase] Erro ao buscar dados públicos da loja:', err);
    return null;
  }
};
export const fetchCustomerStores = async (phoneOrEmail) => {
  if (!isSupabaseConfigured || !supabase || !phoneOrEmail) return [];

  try {
    const cleanPhone = phoneOrEmail.replace(/\D/g, '');
    const cleanEmail = phoneOrEmail.trim().toLowerCase();

    // Query customers table where phone or email matches this collector
    const { data: matchedCustomers } = await supabase
      .from('customers')
      .select('user_id');

    if (!matchedCustomers || matchedCustomers.length === 0) return [];

    const userIds = [...new Set(matchedCustomers.map((c) => c.user_id))];

    // Fetch store_settings for these unique user_ids
    const { data: stores } = await supabase
      .from('store_settings')
      .select('*')
      .in('user_id', userIds);

    if (!stores) return [];

    return stores.map((s) => ({
      name: s.store_name || 'Loja Parceira',
      slug: (s.store_name || 'loja')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
      logoUrl: s.logo_url || '',
    }));
  } catch (err) {
    console.error('Erro ao buscar lojas do colecionador:', err);
    return [];
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
    customer_id: isValidUUID(res.customerId) ? res.customerId : null,
    item_id: isValidUUID(res.itemId) ? res.itemId : null,
    quantity: res.quantity || 1,
    deposit_paid: res.depositPaid || 0,
    total_price: res.totalPrice || 0,
    status: res.status || 'deposit_paid',
    notes: res.notes || '',
  };

  if (isValidUUID(res.id)) {
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
    // Truncate logo/favicon data URLs if too large for Supabase TEXT column
    let logoUrl = settings.logoUrl || '';
    let faviconUrl = settings.faviconUrl || '';
    const MAX_DATA_URL_LENGTH = 500000; // 500KB limit
    if (logoUrl.length > MAX_DATA_URL_LENGTH) {
      console.warn('Logo data URL muito grande, não será salvo no Supabase. Use uma URL externa.');
      logoUrl = '';
    }
    if (faviconUrl.length > MAX_DATA_URL_LENGTH) {
      console.warn('Favicon data URL muito grande, não será salvo no Supabase.');
      faviconUrl = '';
    }

    const payload = {
      user_id: userId,
      store_name: settings.storeName || '',
      pix_key: settings.pixKey || '',
      primary_color: settings.primaryColor || '#38bdf8',
      secondary_color: settings.secondaryColor || '#a855f7',
      theme_mode: settings.themeMode || 'dark',
      logo_url: logoUrl,
      favicon_url: faviconUrl,
    };

    console.log('[Supabase] Salvando store_settings:', { ...payload, logo_url: logoUrl ? `(${logoUrl.length} chars)` : '', favicon_url: faviconUrl ? `(${faviconUrl.length} chars)` : '' });

    const { data, error } = await supabase
      .from('store_settings')
      .upsert(payload, { onConflict: 'user_id' })
      .select();

    if (error) {
      console.error('[Supabase] Erro ao salvar store_settings:', error);
    } else {
      console.log('[Supabase] store_settings salvo com sucesso:', data);
    }
  } catch (err) {
    console.error('[Supabase] Erro ao salvar store_settings:', err);
  }
};

const isValidUUID = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// ============================================================
// PUBLIC RESERVATION (Customer creates reservation from portal)
// ============================================================
export const savePublicReservation = async (reservation, storeUserId) => {
  if (!isSupabaseConfigured || !supabase || !storeUserId) return null;

  try {
    const payload = {
      user_id: storeUserId,
      customer_id: isValidUUID(reservation.customerId) ? reservation.customerId : null,
      item_id: isValidUUID(reservation.itemId) ? reservation.itemId : null,
      quantity: reservation.quantity || 1,
      deposit_paid: 0,
      total_price: reservation.totalPrice || 0,
      status: 'deposit_pending',
      notes: reservation.notes || '',
    };

    console.log('[Supabase] Criando reserva pública:', payload);

    const { data, error } = await supabase
      .from('reservations')
      .insert([payload])
      .select();

    if (error) {
      console.error('[Supabase] Erro ao criar reserva pública:', error);
      return null;
    }

    if (data && data[0]) {
      console.log('[Supabase] Reserva pública criada:', data[0].id);
      return {
        id: data[0].id,
        customerId: data[0].customer_id,
        itemId: data[0].item_id,
        quantity: Number(data[0].quantity || 1),
        depositPaid: 0,
        totalPrice: Number(data[0].total_price || 0),
        status: 'deposit_pending',
        notes: data[0].notes || '',
        createdAt: data[0].created_at,
      };
    }
  } catch (err) {
    console.error('[Supabase] Erro ao criar reserva pública:', err);
  }
  return null;
};

// ============================================================
// NOTIFICATIONS SYSTEM
// ============================================================
export const createNotification = async (storeUserId, { type, title, message, metadata }) => {
  if (!isSupabaseConfigured || !supabase || !storeUserId) return null;

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: storeUserId,
        type: type || 'new_reservation',
        title,
        message: message || '',
        is_read: false,
        metadata: metadata || {},
      }])
      .select();

    if (error) {
      console.error('[Supabase] Erro ao criar notificação:', error);
      return null;
    }
    return data?.[0] || null;
  } catch (err) {
    console.error('[Supabase] Erro ao criar notificação:', err);
    return null;
  }
};

export const fetchNotifications = async (userId) => {
  if (!isSupabaseConfigured || !supabase || !userId) return [];

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('[Supabase] Erro ao buscar notificações:', error);
      return [];
    }

    return (data || []).map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.is_read,
      metadata: n.metadata,
      createdAt: n.created_at,
    }));
  } catch (err) {
    console.error('[Supabase] Erro ao buscar notificações:', err);
    return [];
  }
};

export const markNotificationRead = async (notificationId) => {
  if (!isSupabaseConfigured || !supabase || !notificationId) return;

  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
  } catch (err) {
    console.error('[Supabase] Erro ao marcar notificação como lida:', err);
  }
};

export const markAllNotificationsRead = async (userId) => {
  if (!isSupabaseConfigured || !supabase || !userId) return;

  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  } catch (err) {
    console.error('[Supabase] Erro ao marcar todas notificações como lidas:', err);
  }
};

// ============================================================
// REALTIME SUBSCRIPTIONS
// ============================================================
export const subscribeToPublicStore = (storeUserId, onDataChange) => {
  if (!isSupabaseConfigured || !supabase || !storeUserId) return () => {};

  console.log('[Supabase Realtime] Inscrevendo no canal da loja:', storeUserId);

  const channel = supabase
    .channel(`public-store-${storeUserId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `user_id=eq.${storeUserId}` }, (payload) => {
      console.log('[Supabase Realtime] Alteração em items:', payload.eventType);
      onDataChange();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations', filter: `user_id=eq.${storeUserId}` }, (payload) => {
      console.log('[Supabase Realtime] Alteração em reservations:', payload.eventType);
      onDataChange();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings', filter: `user_id=eq.${storeUserId}` }, (payload) => {
      console.log('[Supabase Realtime] Alteração em store_settings:', payload.eventType);
      onDataChange();
    })
    .subscribe((status) => {
      console.log('[Supabase Realtime] Status da inscrição:', status);
    });

  return () => {
    console.log('[Supabase Realtime] Cancelando inscrição do canal:', storeUserId);
    supabase.removeChannel(channel);
  };
};

