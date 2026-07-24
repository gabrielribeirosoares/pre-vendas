import React, { useState } from 'react';
import { Plus, Search, Car, UserPlus, Menu, LogOut, Sun, Moon, Share2, Check } from 'lucide-react';

export const Header = ({
  onNewItem,
  onNewReservation,
  onNewCustomer,
  searchQuery,
  setSearchQuery,
  onToggleMobileMenu,
  onToggleSidebarCollapse,
  user,
  onLogout,
  settings,
  onToggleTheme,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const storeDisplayName = settings?.storeName || user?.user_metadata?.store_name || 'Minha Loja';
  const isLight = settings?.themeMode === 'light';

  const handleCopyStoreLink = () => {
    // Copy full store URL with store path
    const storeUrl = window.location.href;
    navigator.clipboard.writeText(storeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleMenuClick = () => {
    if (window.innerWidth <= 768) {
      if (onToggleMobileMenu) onToggleMobileMenu();
    } else {
      if (onToggleSidebarCollapse) onToggleSidebarCollapse();
    }
  };

  return (
    <header style={{
      background: 'var(--header-bg)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexWrap: 'nowrap',
      overflowX: 'auto',
    }}>
      {/* Mobile Toggle & Search Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 200px', minWidth: '180px', maxWidth: '300px' }}>
        {/* Hamburger Menu Button (Mobile Only) */}
        <button
          onClick={onToggleMobileMenu}
          className="btn btn-icon mobile-menu-btn"
          title="Abrir Menu"
          aria-label="Abrir Menu"
        >
          <Menu size={20} color="var(--accent-cyan)" />
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
        {/* Copy Store Link Button */}
        <button
          onClick={handleCopyStoreLink}
          className="btn btn-secondary"
          style={{
            fontSize: '0.8125rem',
            padding: '8px 12px',
            borderColor: copiedLink ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.3)',
            color: copiedLink ? 'var(--accent-green)' : 'var(--accent-cyan)',
            gap: '6px',
          }}
          title="Copiar link da vitrine/loja para enviar aos seus clientes"
        >
          {copiedLink ? <Check size={16} color="var(--accent-green)" /> : <Share2 size={16} />}
          <span className="hide-on-xs">{copiedLink ? 'Link Copiado!' : 'Divulgar Loja'}</span>
        </button>

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

        {/* Theme Toggle Button (Light/Dark) */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="btn btn-icon"
          title={isLight ? 'Alternar para Modo Escuro' : 'Alternar para Modo Claro'}
          aria-label="Alternar Tema"
          style={{ color: 'var(--accent-cyan)' }}
        >
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
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
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {userDisplayName}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              {storeDisplayName}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="btn btn-icon"
            title="Sair da Conta"
            style={{ color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
