import React from 'react';
import {
  LayoutDashboard,
  Car,
  ClipboardList,
  Boxes,
  Users,
  Settings,
  Flame,
  X,
} from 'lucide-react';

export const Sidebar = ({
  currentTab,
  setCurrentTab,
  counts,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalog', label: 'Catálogo de Pré-Vendas', icon: Car, count: counts.items },
    { id: 'reservations', label: 'Reservas de Clientes', icon: ClipboardList, count: counts.reservations },
    { id: 'supplier', label: 'Pedidos ao Fornecedor', icon: Boxes },
    { id: 'customers', label: 'Colecionadores / Clientes', icon: Users, count: counts.customers },
    { id: 'settings', label: 'Backup & Configurações', icon: Settings },
  ];

  const handleSelectTab = (tabId) => {
    setCurrentTab(tabId);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        style={{
          width: '270px',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: isMobileOpen ? 'fixed' : 'relative',
          top: 0,
          left: isMobileOpen ? 0 : undefined,
          bottom: 0,
          zIndex: 250,
          transition: 'transform 0.25s ease',
        }}
        className={isMobileOpen ? 'sidebar-mobile-open' : 'sidebar-desktop'}
      >
        {/* Brand Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-purple))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(249, 115, 22, 0.4)',
            }}>
              <Flame size={22} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                DIECAST <span style={{ color: 'var(--accent-orange)' }}>PRE-ORDER</span>
              </h1>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
                MINI GT • KAIDO • POP RACE
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="btn btn-icon"
              style={{ border: 'none', background: 'transparent' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.15), transparent)' : 'transparent',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                  transition: 'all 0.15s ease',
                  minHeight: '44px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={19} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    fontWeight: 600,
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div style={{
          padding: '14px',
          margin: '12px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>
            Sistema Mobile-First
          </div>
          Controle completo de reservas e lotes em qualquer dispositivo.
        </div>
      </aside>
    </>
  );
};
