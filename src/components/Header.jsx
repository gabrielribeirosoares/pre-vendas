import React from 'react';
import { Plus, Search, Car, UserPlus, Menu, LogOut, User as UserIcon } from 'lucide-react';

export const Header = ({
  onNewItem,
  onNewReservation,
  onNewCustomer,
  searchQuery,
  setSearchQuery,
  onToggleMobileMenu,
  user,
  onLogout,
}) => {
  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const storeDisplayName = user?.user_metadata?.store_name || 'Minha Loja';

  return (
    <header style={{
      minHeight: '64px',
      background: 'rgba(13, 19, 34, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexWrap: 'wrap',
    }}>
      {/* Mobile Toggle & Search Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
        {/* Hamburger Menu Button (Mobile) */}
        <button
          onClick={onToggleMobileMenu}
          className="btn btn-icon mobile-menu-btn"
          title="Abrir Menu"
          aria-label="Abrir Menu"
        >
          <Menu size={20} />
        </button>

        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Buscar modelo, cliente ou SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px', height: '40px', fontSize: '0.84rem' }}
          />
        </div>
      </div>

      {/* Action Buttons & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
        <button onClick={onNewCustomer} className="btn btn-secondary" style={{ fontSize: '0.8125rem', padding: '8px 12px' }}>
          <UserPlus size={16} />
          <span className="hide-on-xs">+ Cliente</span>
        </button>

        <button onClick={onNewItem} className="btn btn-secondary" style={{ fontSize: '0.8125rem', padding: '8px 12px' }}>
          <Car size={16} />
          <span className="hide-on-xs">+ Modelo</span>
        </button>

        <button onClick={onNewReservation} className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '8px 14px' }}>
          <Plus size={16} />
          <span>Nova Reserva</span>
        </button>

        {/* User Account Dropdown & Logout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingLeft: '8px',
          borderLeft: '1px solid var(--border-color)',
        }}>
          <div style={{ textAlign: 'right' }} className="hide-on-xs">
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
              {userDisplayName}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
              {storeDisplayName}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="btn btn-icon"
            title="Sair da Conta"
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
