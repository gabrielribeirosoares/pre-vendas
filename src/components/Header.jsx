import React, { useState } from 'react';
import { Plus, Search, Car, UserPlus, Menu, LogOut, Sun, Moon, Share2, Check, ChevronDown, LayoutDashboard, Store, Bell, CheckCircle2, Clock, ShoppingBag } from 'lucide-react';

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
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const storeDisplayName = settings?.storeName || user?.user_metadata?.store_name || 'Minha Loja';
  const isLight = settings?.themeMode === 'light';

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
      zIndex: 100,
      position: 'relative',
      overflow: 'visible',
    }}>
      {/* Mobile Toggle Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Hamburger Menu Button (Mobile Only) */}
        <button
          onClick={onToggleMobileMenu}
          className="btn btn-icon mobile-menu-btn"
          title="Abrir Menu"
          aria-label="Abrir Menu"
        >
          <Menu size={20} color="var(--accent-cyan)" />
        </button>
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

        {/* Notifications Bell Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-icon"
            title="Notificações"
            aria-label="Notificações"
            style={{ color: unreadCount > 0 ? 'var(--accent-orange)' : 'var(--text-secondary)', position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: 'var(--accent-red)', color: '#fff',
                fontSize: '0.65rem', fontWeight: 800,
                width: '18px', height: '18px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                border: '2px solid var(--bg-main)',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="glass-card" style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '8px',
              width: '320px', maxHeight: '400px', overflowY: 'auto',
              zIndex: 1000, padding: 0, boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              border: '1px solid var(--border-glow)',
            }}>
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(0,0,0,0.2)',
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={15} color="var(--accent-cyan)" /> Notificações {unreadCount > 0 && `(${unreadCount})`}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => { if (onMarkAllNotificationsRead) onMarkAllNotificationsRead(); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Marcar lidas
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  <Bell size={28} style={{ opacity: 0.3, marginBottom: '6px' }} />
                  <div>Nenhuma notificação por enquanto</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => { if (onMarkNotificationRead) onMarkNotificationRead(n.id); }}
                      style={{
                        padding: '12px 16px', borderBottom: '1px solid var(--border-color)',
                        background: n.isRead ? 'transparent' : 'rgba(56, 189, 248, 0.06)',
                        cursor: 'pointer', transition: 'background 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: n.isRead ? 'transparent' : 'var(--accent-cyan)',
                          marginTop: '6px', flexShrink: 0,
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: n.isRead ? 600 : 700, color: 'var(--text-primary)' }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.3 }}>
                            {n.message}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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


