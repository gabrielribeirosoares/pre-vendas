import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { CatalogView } from './components/CatalogView';
import { ReservationsView } from './components/ReservationsView';
import { SupplierOrdersView } from './components/SupplierOrdersView';
import { CustomersView } from './components/CustomersView';
import { SettingsBackupView } from './components/SettingsBackupView';
import { ModalItemForm } from './components/ModalItemForm';
import { ModalReservationForm } from './components/ModalReservationForm';
import { ModalCustomerForm } from './components/ModalCustomerForm';
import { ModalWhatsApp } from './components/ModalWhatsApp';
import { PublicStorefrontView } from './components/PublicStorefrontView';
import { CustomerPortalView } from './components/CustomerPortalView';

import {
  INITIAL_ITEMS,
  INITIAL_CUSTOMERS,
  INITIAL_RESERVATIONS,
  INITIAL_SETTINGS,
} from './data/initialData';

import { loadState, saveState, STORAGE_KEYS } from './utils/helpers';
import {
  supabase,
  isSupabaseConfigured,
  signOutUser,
  fetchSupabaseData,
  fetchPublicStoreBySlug,
  fetchPublicStoreItems,
  saveSupabaseSettings,
  saveSupabaseItem,
  deleteSupabaseItem,
  saveSupabaseCustomer,
  deleteSupabaseCustomer,
  saveSupabaseReservation,
  deleteSupabaseReservation,
} from './services/supabase';

export default function App() {
  // Auth State
  const [user, setUser] = useState(() => {
    const demo = localStorage.getItem('diecast_demo_user');
    return demo ? JSON.parse(demo) : null;
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [publicStoreLoading, setPublicStoreLoading] = useState(() => {
    return window.location.pathname.startsWith('/loja/');
  });
  const [publicStoreData, setPublicStoreData] = useState(null);

  // Check Supabase session on startup
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
        }
        setAuthLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setAuthLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Navigation State
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('diecast_sidebar_collapsed') === 'true';
  });

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('diecast_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Persistent Data States
  const [items, setItems] = useState(() => loadState(STORAGE_KEYS.ITEMS, INITIAL_ITEMS));
  const [customers, setCustomers] = useState(() => loadState(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS));
  const [reservations, setReservations] = useState(() => loadState(STORAGE_KEYS.RESERVATIONS, INITIAL_RESERVATIONS));
  const [settings, setSettings] = useState(() => loadState(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS));

  // Load public store data when visiting a store link as a visitor
  useEffect(() => {
    if (!user) {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/loja/')) {
        const slug = pathname.replace('/loja/', '').replace(/\/$/, '').trim();
        if (slug) {
          setPublicStoreLoading(true);
          fetchPublicStoreBySlug(slug).then(async (publicSettings) => {
            if (publicSettings) {
              // Apply store visual settings
              const { userId, ...storeSettings } = publicSettings;
              setSettings((prev) => ({ ...prev, ...storeSettings }));

              // Fetch the store's items, customers and reservations
              if (userId) {
                const storeData = await fetchPublicStoreItems(userId);
                if (storeData) {
                  setPublicStoreData(storeData);
                  if (storeData.items && storeData.items.length > 0) setItems(storeData.items);
                  if (storeData.customers && storeData.customers.length > 0) setCustomers(storeData.customers);
                  if (storeData.reservations && storeData.reservations.length > 0) setReservations(storeData.reservations);
                }
              }
            }
            setPublicStoreLoading(false);
          }).catch(() => {
            setPublicStoreLoading(false);
          });
        } else {
          setPublicStoreLoading(false);
        }
      } else {
        setPublicStoreLoading(false);
      }
    } else {
      setPublicStoreLoading(false);
    }
  }, [user]);

  // Derive Store Slug for Multi-Store URL Routing
  const storeSlug = (settings?.storeName || 'minha-loja')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Keep Browser URL updated with store slug (Multi-store URL)
  useEffect(() => {
    if (user && storeSlug) {
      const currentPath = window.location.pathname;
      const targetPath = `/loja/${storeSlug}`;
      if (currentPath !== targetPath) {
        window.history.replaceState(null, '', targetPath);
      }
    }
  }, [user, storeSlug]);

  // Load Remote Supabase Data on Auth Login (New accounts start empty)
  useEffect(() => {
    if (user?.id && isSupabaseConfigured) {
      fetchSupabaseData(user.id).then((remote) => {
        if (remote) {
          if (remote.items && remote.items.length > 0) setItems(remote.items);
          if (remote.customers && remote.customers.length > 0) setCustomers(remote.customers);
          if (remote.reservations && remote.reservations.length > 0) setReservations(remote.reservations);
          
          if (remote.settings) {
            console.log('[App] Settings do Supabase recebidos:', remote.settings);
            setSettings((prev) => {
              const merged = { ...prev };
              Object.keys(remote.settings).forEach((key) => {
                const remoteVal = remote.settings[key];
                // Only override if Supabase has a real saved value (not null)
                if (remoteVal !== null && remoteVal !== undefined) {
                  merged[key] = remoteVal;
                }
              });
              console.log('[App] Settings finais após merge:', merged);
              return merged;
            });
          }
        }
      });
    }
  }, [user?.id]);

  // Apply Store Custom Theme, Colors, Document Title & Favicon
  useEffect(() => {
    const mode = settings?.themeMode || 'dark';
    document.documentElement.setAttribute('data-theme', mode);

    if (settings?.primaryColor) {
      document.documentElement.style.setProperty('--accent-cyan', settings.primaryColor);
      document.documentElement.style.setProperty('--border-glow', `${settings.primaryColor}4d`);
    }
    if (settings?.secondaryColor) {
      document.documentElement.style.setProperty('--accent-purple', settings.secondaryColor);
    }
    if (settings?.storeName) {
      document.title = `${settings.storeName} - Pré-Vendas`;
    }
    const activeFavicon = settings?.faviconUrl || settings?.logoUrl;
    if (activeFavicon) {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = activeFavicon;
    }
  }, [settings]);

  // Sync to LocalStorage
  useEffect(() => { saveState(STORAGE_KEYS.ITEMS, items); }, [items]);
  useEffect(() => { saveState(STORAGE_KEYS.CUSTOMERS, customers); }, [customers]);
  useEffect(() => { saveState(STORAGE_KEYS.RESERVATIONS, reservations); }, [reservations]);
  useEffect(() => { saveState(STORAGE_KEYS.SETTINGS, settings); }, [settings]);

  // Modal States
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [reservationToEdit, setReservationToEdit] = useState(null);
  const [preselectedItem, setPreselectedItem] = useState(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState({ reservation: null, customer: null, item: null });

  // Handlers: Auth Logout
  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
    window.history.replaceState(null, '', '/');
  };

  // Handlers: Items
  const handleSaveItem = async (itemData) => {
    let itemToSave = itemData;
    if (user?.id && isSupabaseConfigured) {
      const saved = await saveSupabaseItem(itemData, user.id);
      if (saved && saved.id) {
        itemToSave = saved;
      }
    }

    setItems((prevItems) => {
      const exists = prevItems.some((i) => i.id === itemToSave.id || (itemData.id && i.id === itemData.id));
      if (exists) {
        return prevItems.map((i) => (i.id === itemToSave.id || i.id === itemData.id ? itemToSave : i));
      }
      return [...prevItems, itemToSave];
    });

    setItemToEdit(null);
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Tem certeza que deseja excluir este modelo? Reservas vinculadas continuarão registradas.')) {
      setItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
      if (user?.id && isSupabaseConfigured) {
        deleteSupabaseItem(itemId);
      }
    }
  };

  // Handlers: Reservations
  const handleSaveReservation = async (resData) => {
    let resToSave = resData;
    if (user?.id && isSupabaseConfigured) {
      const saved = await saveSupabaseReservation(resData, user.id);
      if (saved && saved.id) {
        resToSave = saved;
      }
    }

    setReservations((prevRes) => {
      const exists = prevRes.some((r) => r.id === resToSave.id || (resData.id && r.id === resData.id));
      if (exists) {
        return prevRes.map((r) => (r.id === resToSave.id || r.id === resData.id ? resToSave : r));
      }
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
      });
      return [...prevRes, resToSave];
    });

    setReservationToEdit(null);
    setPreselectedItem(null);
  };

  const handleDeleteReservation = (resId) => {
    if (window.confirm('Tem certeza que deseja excluir esta reserva?')) {
      setReservations((prevRes) => prevRes.filter((r) => r.id !== resId));
      if (user?.id && isSupabaseConfigured) {
        deleteSupabaseReservation(resId);
      }
    }
  };

  const handleUpdateReservationStatus = (resId, newStatus) => {
    setReservations((prevRes) => {
      const updated = prevRes.map((r) => (r.id === resId ? { ...r, status: newStatus } : r));
      const target = updated.find((r) => r.id === resId);
      if (target && user?.id && isSupabaseConfigured) {
        saveSupabaseReservation(target, user.id);
      }
      return updated;
    });
  };

  // Handlers: Customers
  const handleSaveCustomer = async (custData) => {
    let custToSave = custData;
    if (user?.id && isSupabaseConfigured) {
      const saved = await saveSupabaseCustomer(custData, user.id);
      if (saved && saved.id) {
        custToSave = saved;
      }
    }

    setCustomers((prevCust) => {
      const exists = prevCust.some((c) => c.id === custToSave.id || (custData.id && c.id === custData.id));
      if (exists) {
        return prevCust.map((c) => (c.id === custToSave.id || c.id === custData.id ? custToSave : c));
      }
      return [...prevCust, custToSave];
    });

    setCustomerToEdit(null);
  };

  const handleDeleteCustomer = (custId) => {
    if (window.confirm('Tem certeza que deseja excluir este colecionador?')) {
      setCustomers(customers.filter((c) => c.id !== custId));
      if (user?.id && isSupabaseConfigured) {
        deleteSupabaseCustomer(custId);
      }
    }
  };

  // Handlers: Settings
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveState(STORAGE_KEYS.SETTINGS, newSettings);
    if (user?.id && isSupabaseConfigured) {
      saveSupabaseSettings(newSettings, user.id);
    }
  };

  const handleToggleTheme = () => {
    const newMode = settings?.themeMode === 'light' ? 'dark' : 'light';
    handleSaveSettings({
      ...settings,
      themeMode: newMode,
    });
  };

  // Handlers: WhatsApp Modal Trigger
  const handleOpenWhatsApp = (reservation, customer, item) => {
    setWhatsAppData({ reservation, customer, item });
    setIsWhatsAppModalOpen(true);
  };

  // Backup & Data Restore
  const handleExportData = () => {
    const backupObj = { items, customers, reservations, settings, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_diecast_prevendas_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (parsed) => {
    if (parsed.items && Array.isArray(parsed.items)) setItems(parsed.items);
    if (parsed.customers && Array.isArray(parsed.customers)) setCustomers(parsed.customers);
    if (parsed.reservations && Array.isArray(parsed.reservations)) setReservations(parsed.reservations);
    if (parsed.settings) handleSaveSettings(parsed.settings);
    alert('Dados de backup restaurados com sucesso!');
  };

  const handleResetDemoData = () => {
    setItems(INITIAL_ITEMS);
    setCustomers(INITIAL_CUSTOMERS);
    setReservations(INITIAL_RESERVATIONS);
    handleSaveSettings(INITIAL_SETTINGS);
  };

  // Render Loading Spinner during auth check
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        color: 'var(--accent-cyan)',
        fontWeight: 600,
      }}>
        Carregando sistema de pré-vendas...
      </div>
    );
  }

  // Render Public Store Visitor / Customer Portal if accessing via store link (/loja/slug) and not logged in as Admin
  const isVisitingPublicStore = window.location.pathname.startsWith('/loja/');

  if (!user && isVisitingPublicStore) {
    // Show loading while fetching store data from Supabase
    if (publicStoreLoading) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-main)',
          color: 'var(--accent-cyan)',
          fontWeight: 600,
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '3px solid var(--accent-cyan)',
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }} />
          Carregando loja...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    return (
      <CustomerPortalView
        items={items}
        reservations={reservations}
        customers={customers}
        settings={settings}
        onBackToStorefront={() => setCurrentTab('storefront')}
      />
    );
  }

  // Render Admin Auth Screen if not logged in
  if (!user) {
    return <AuthView settings={settings} onAuthSuccess={(loggedUser) => setUser(loggedUser)} />;
  }

  // Render Public Storefront View if active
  if (currentTab === 'storefront') {
    return (
      <PublicStorefrontView
        items={items}
        settings={settings}
        onBackToAdmin={() => setCurrentTab('dashboard')}
        onOpenCustomerPortal={() => setCurrentTab('customer_portal')}
      />
    );
  }

  // Render Customer Portal View if active
  if (currentTab === 'customer_portal') {
    return (
      <CustomerPortalView
        items={items}
        reservations={reservations}
        customers={customers}
        settings={settings}
        onBackToStorefront={() => setCurrentTab('storefront')}
        onBackToAdmin={() => setCurrentTab('dashboard')}
      />
    );
  }

  // Render Main Application when logged in
  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        counts={{
          items: items.length,
          reservations: reservations.length,
          customers: customers.length,
        }}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        settings={settings}
      />

      {/* Main Content Wrapper */}
      <div className="main-wrapper">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
          onToggleSidebarCollapse={handleToggleSidebarCollapse}
          onOpenStorefront={() => setCurrentTab('storefront')}
          onOpenCustomerPortal={() => setCurrentTab('customer_portal')}
          user={user}
          onLogout={handleLogout}
          settings={settings}
          onToggleTheme={handleToggleTheme}
          onNewItem={() => {
            setItemToEdit(null);
            setIsItemModalOpen(true);
          }}
          onNewReservation={() => {
            setReservationToEdit(null);
            setPreselectedItem(null);
            setIsReservationModalOpen(true);
          }}
          onNewCustomer={() => {
            setCustomerToEdit(null);
            setIsCustomerModalOpen(true);
          }}
        />

        <main className="content-area">
          {currentTab === 'dashboard' && (
            <DashboardView
              items={items}
              reservations={reservations}
              customers={customers}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenWhatsApp={handleOpenWhatsApp}
            />
          )}

          {currentTab === 'catalog' && (
            <CatalogView
              items={items}
              reservations={reservations}
              customers={customers}
              settings={settings}
              searchQuery={searchQuery}
              onNewItem={() => {
                setItemToEdit(null);
                setIsItemModalOpen(true);
              }}
              onEditItem={(item) => {
                setItemToEdit(item);
                setIsItemModalOpen(true);
              }}
              onDeleteItem={handleDeleteItem}
              onNewReservationForItem={(item) => {
                setReservationToEdit(null);
                setPreselectedItem(item);
                setIsReservationModalOpen(true);
              }}
            />
          )}

          {currentTab === 'reservations' && (
            <ReservationsView
              reservations={reservations}
              items={items}
              customers={customers}
              settings={settings}
              searchQuery={searchQuery}
              onNewReservation={() => {
                setReservationToEdit(null);
                setPreselectedItem(null);
                setIsReservationModalOpen(true);
              }}
              onEditReservation={(res) => {
                setReservationToEdit(res);
                setIsReservationModalOpen(true);
              }}
              onDeleteReservation={handleDeleteReservation}
              onUpdateReservationStatus={handleUpdateReservationStatus}
              onOpenWhatsApp={handleOpenWhatsApp}
            />
          )}

          {currentTab === 'supplier' && (
            <SupplierOrdersView
              items={items}
              reservations={reservations}
              onSaveItem={handleSaveItem}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersView
              customers={customers}
              reservations={reservations}
              onNewCustomer={() => {
                setCustomerToEdit(null);
                setIsCustomerModalOpen(true);
              }}
              onEditCustomer={(cust) => {
                setCustomerToEdit(cust);
                setIsCustomerModalOpen(true);
              }}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsBackupView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onResetDemoData={handleResetDemoData}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <ModalItemForm
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
      />

      <ModalReservationForm
        isOpen={isReservationModalOpen}
        onClose={() => {
          setIsReservationModalOpen(false);
          setReservationToEdit(null);
          setPreselectedItem(null);
        }}
        onSave={handleSaveReservation}
        reservationToEdit={reservationToEdit}
        items={items}
        customers={customers}
        preselectedItem={preselectedItem}
      />

      <ModalCustomerForm
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setCustomerToEdit(null);
        }}
        onSave={handleSaveCustomer}
        customerToEdit={customerToEdit}
      />

      <ModalWhatsApp
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        reservation={whatsAppData.reservation}
        customer={whatsAppData.customer}
        item={whatsAppData.item}
        settings={settings}
      />
    </div>
  );
}
