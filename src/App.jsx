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

import {
  INITIAL_ITEMS,
  INITIAL_CUSTOMERS,
  INITIAL_RESERVATIONS,
  INITIAL_SETTINGS,
} from './data/initialData';

import { loadState, saveState, STORAGE_KEYS } from './utils/helpers';
import { supabase, isSupabaseConfigured, signOutUser } from './services/supabase';

export default function App() {
  // Auth State
  const [user, setUser] = useState(() => {
    const demo = localStorage.getItem('diecast_demo_user');
    return demo ? JSON.parse(demo) : null;
  });
  const [authLoading, setAuthLoading] = useState(true);

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

  // Persistent Data States
  const [items, setItems] = useState(() => loadState(STORAGE_KEYS.ITEMS, INITIAL_ITEMS));
  const [customers, setCustomers] = useState(() => loadState(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS));
  const [reservations, setReservations] = useState(() => loadState(STORAGE_KEYS.RESERVATIONS, INITIAL_RESERVATIONS));
  const [settings, setSettings] = useState(() => loadState(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS));

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
  };

  // Handlers: Items
  const handleSaveItem = (itemData) => {
    if (itemToEdit) {
      setItems(items.map((i) => (i.id === itemData.id ? itemData : i)));
    } else {
      setItems([...items, itemData]);
    }
    setItemToEdit(null);
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Tem certeza que deseja excluir este modelo? Reservas vinculadas continuarão registradas.')) {
      setItems(items.filter((i) => i.id !== itemId));
    }
  };

  // Handlers: Reservations
  const handleSaveReservation = (resData) => {
    if (reservationToEdit) {
      setReservations(reservations.map((r) => (r.id === resData.id ? resData : r)));
    } else {
      setReservations([...reservations, resData]);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
      });
    }
    setReservationToEdit(null);
    setPreselectedItem(null);
  };

  const handleDeleteReservation = (resId) => {
    if (window.confirm('Tem certeza que deseja excluir esta reserva?')) {
      setReservations(reservations.filter((r) => r.id !== resId));
    }
  };

  const handleUpdateReservationStatus = (resId, newStatus) => {
    setReservations(reservations.map((r) => (r.id === resId ? { ...r, status: newStatus } : r)));
  };

  // Handlers: Customers
  const handleSaveCustomer = (custData) => {
    if (customerToEdit) {
      setCustomers(customers.map((c) => (c.id === custData.id ? custData : c)));
    } else {
      setCustomers([...customers, custData]);
    }
    setCustomerToEdit(null);
  };

  const handleDeleteCustomer = (custId) => {
    if (window.confirm('Tem certeza que deseja excluir este colecionador?')) {
      setCustomers(customers.filter((c) => c.id !== custId));
    }
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
    if (parsed.settings) setSettings(parsed.settings);
    alert('Dados de backup restaurados com sucesso!');
  };

  const handleResetDemoData = () => {
    setItems(INITIAL_ITEMS);
    setCustomers(INITIAL_CUSTOMERS);
    setReservations(INITIAL_RESERVATIONS);
    setSettings(INITIAL_SETTINGS);
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

  // Render Auth Screen if not logged in
  if (!user) {
    return <AuthView onAuthSuccess={(loggedUser) => setUser(loggedUser)} />;
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
      />

      {/* Main Content Wrapper */}
      <div className="main-wrapper">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
          user={user}
          onLogout={handleLogout}
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
              onSaveSettings={setSettings}
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
