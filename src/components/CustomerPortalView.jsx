import React, { useState, useEffect } from 'react';
import {
  Flame,
  Search,
  Package,
  Truck,
  FileText,
  MessageCircle,
  Calendar,
  ExternalLink,
  Clock,
  ShieldCheck,
  LogOut,
  UserCheck,
  Phone,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Store,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { formatBRL, buildWhatsAppUrl, buildTrackingUrl } from '../utils/helpers';
import { BRANDS, RESERVATION_STATUSES } from '../data/initialData';
import { ModalReceipt } from './ModalReceipt';

// Status timeline order
const STATUS_TIMELINE = [
  { key: 'deposit_pending', label: 'Aguardando Sinal' },
  { key: 'deposit_paid', label: 'Sinal Pago' },
  { key: 'fully_paid', label: 'Pago Total' },
  { key: 'available_pickup', label: 'Pronto p/ Envio' },
  { key: 'delivered', label: 'Entregue' },
];

// Customer accounts storage key
const CUSTOMER_ACCOUNTS_KEY = 'diecast_customer_accounts';
const CUSTOMER_SESSION_KEY = 'diecast_customer_session';

// Helpers for customer accounts (localStorage-based for demo)
const getCustomerAccounts = () => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_ACCOUNTS_KEY) || '[]');
  } catch { return []; }
};

const saveCustomerAccounts = (accounts) => {
  localStorage.setItem(CUSTOMER_ACCOUNTS_KEY, JSON.stringify(accounts));
};

const getCustomerSession = () => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_SESSION_KEY) || 'null');
  } catch { return null; }
};

const saveCustomerSession = (session) => {
  if (session) {
    localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
  }
};

export const CustomerPortalView = ({
  items = [],
  reservations = [],
  customers = [],
  settings,
  onBackToStorefront,
  onBackToAdmin,
}) => {
  const [session, setSession] = useState(() => getCustomerSession());
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [receiptReservation, setReceiptReservation] = useState(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Find the linked store customer record by phone or email
  const loggedCustomer = session
    ? customers.find((c) => {
        const sessionPhone = (session.phone || '').replace(/\D/g, '');
        const custPhone = (c.phone || '').replace(/\D/g, '');
        return (
          (sessionPhone && custPhone && custPhone.includes(sessionPhone)) ||
          (session.email && c.email && c.email.toLowerCase() === session.email.toLowerCase()) ||
          (session.name && c.name && c.name.toLowerCase() === session.name.toLowerCase())
        );
      })
    : null;

  // Customer reservations
  const myReservations = loggedCustomer
    ? reservations
        .filter((r) => r.customerId === loggedCustomer.id && r.status !== 'cancelled')
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    : [];

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    setTimeout(() => {
      const accounts = getCustomerAccounts();
      const account = accounts.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!account) {
        setErrorMessage('Nenhuma conta encontrada com este e-mail. Crie uma conta primeiro.');
        setLoading(false);
        return;
      }

      if (account.password !== password) {
        setErrorMessage('Senha incorreta. Tente novamente.');
        setLoading(false);
        return;
      }

      const sessionData = { id: account.id, email: account.email, name: account.name, phone: account.phone };
      saveCustomerSession(sessionData);
      setSession(sessionData);
      setLoading(false);
    }, 400);
  };

  // Handle Register
  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Digite seu telefone com DDD (mínimo 10 dígitos).');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const accounts = getCustomerAccounts();
      const exists = accounts.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (exists) {
        setErrorMessage('Este e-mail já está cadastrado. Faça login.');
        setLoading(false);
        return;
      }

      const newAccount = {
        id: `customer-${Date.now()}`,
        email: email.trim().toLowerCase(),
        password,
        name: fullName.trim(),
        phone: cleanPhone,
        createdAt: new Date().toISOString(),
      };

      accounts.push(newAccount);
      saveCustomerAccounts(accounts);

      setSuccessMessage('Conta criada com sucesso! Faça login para acessar seus pedidos.');
      setAuthMode('login');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setPhone('');
      setLoading(false);
    }, 400);
  };

  // Handle Logout
  const handleLogout = () => {
    saveCustomerSession(null);
    setSession(null);
    setEmail('');
    setPassword('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Stats
  const totalPaid = myReservations.reduce((sum, r) => sum + Number(r.depositPaid || 0), 0);
  const totalPending = myReservations.reduce((sum, r) => {
    return sum + Math.max(0, Number(r.totalPrice || 0) - Number(r.depositPaid || 0));
  }, 0);
  const deliveredCount = myReservations.filter((r) => r.status === 'delivered').length;

  const handleContactStore = () => {
    const msg = `Olá! Sou ${session?.name || 'cliente'} e gostaria de falar sobre meus pedidos de pré-venda.`;
    const storePhone = settings?.storePhone || '';
    window.open(buildWhatsAppUrl(storePhone, msg), '_blank');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 20% 0%, rgba(56, 189, 248, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 100%, rgba(168, 85, 247, 0.08) 0%, transparent 50%), var(--bg-main)',
      color: 'var(--text-primary)',
    }}>
      {/* Header */}
      <header style={{
        background: 'var(--header-bg)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
            ) : (
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(56, 189, 248, 0.3)',
              }}>
                <Flame size={22} color="#fff" />
              </div>
            )}
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {settings?.storeName || 'Miniatures Club'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={12} /> ÁREA DO COLECIONADOR
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {session && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }} className="hide-on-xs">
                  {session.name}
                </span>
                <button
                  onClick={() => {
                    const selectStore = prompt('Digite o slug da loja que deseja acessar (ex: gabriel-minis, teste2):');
                    if (selectStore) {
                      window.location.href = `/loja/${selectStore.trim().toLowerCase()}`;
                    }
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '5px', borderColor: 'rgba(56, 189, 248, 0.3)', color: 'var(--accent-cyan)' }}
                  title="Trocar de Loja"
                >
                  <Store size={14} /> Trocar Loja
                </button>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '5px', color: 'var(--accent-red)' }}>
                  <LogOut size={14} /> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ===== AUTH SCREENS ===== */}
        {!session && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', paddingTop: '32px' }}>
            <div className="glass-card" style={{
              padding: '36px 32px',
              maxWidth: '440px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}>
              {/* Icon */}
              <div style={{
                width: '60px', height: '60px', borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto', border: '1px solid var(--border-glow)',
              }}>
                {authMode === 'login' ? <Lock size={28} color="var(--accent-cyan)" /> : <User size={28} color="var(--accent-purple)" />}
              </div>

              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {authMode === 'login' ? 'Entrar na Minha Conta' : 'Criar Conta de Colecionador'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  {authMode === 'login'
                    ? 'Acesse com seu e-mail e senha para acompanhar suas reservas e rastreios.'
                    : 'Cadastre-se usando o mesmo telefone que usa na loja para vincular seus pedidos.'
                  }
                </p>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div style={{
                  fontSize: '0.82rem', color: 'var(--accent-green)', padding: '10px 14px',
                  background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.25)', textAlign: 'center',
                }}>
                  <CheckCircle2 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  {successMessage}
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div style={{
                  fontSize: '0.82rem', color: 'var(--accent-red)', padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center',
                }}>
                  {errorMessage}
                </div>
              )}

              {/* LOGIN FORM */}
              {authMode === 'login' && (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Email */}
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      placeholder="Seu e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '42px', height: '48px', fontSize: '0.9375rem' }}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Password */}
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '42px', paddingRight: '42px', height: '48px', fontSize: '0.9375rem' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: '0.9375rem', gap: '8px' }}>
                    {loading ? 'Entrando...' : <><ArrowRight size={18} /> Entrar</>}
                  </button>
                </form>
              )}

              {/* REGISTER FORM */}
              {authMode === 'register' && (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Full Name */}
                  <div style={{ position: 'relative' }}>
                    <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '42px', height: '48px', fontSize: '0.9375rem' }}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Email */}
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      placeholder="Seu melhor e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '42px', height: '48px', fontSize: '0.9375rem' }}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="tel"
                      placeholder="WhatsApp com DDD (ex: 11988776655)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '42px', height: '48px', fontSize: '0.9375rem' }}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Criar senha (mín. 6 caracteres)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '42px', paddingRight: '42px', height: '48px', fontSize: '0.9375rem' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="password"
                      placeholder="Confirmar senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '42px', height: '48px', fontSize: '0.9375rem' }}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: '0.9375rem', gap: '8px' }}>
                    {loading ? 'Criando conta...' : <><UserCheck size={18} /> Criar Conta</>}
                  </button>
                </form>
              )}

              {/* Toggle Auth Mode */}
              <div style={{ textAlign: 'center', paddingTop: '4px' }}>
                {authMode === 'login' ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Ainda não tem conta?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Cadastre-se gratuitamente
                    </button>
                  </p>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Já tem conta?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Fazer login
                    </button>
                  </p>
                )}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <ShieldCheck size={14} color="var(--accent-green)" /> Seus dados estão protegidos e seguros.
              </div>
            </div>

            {/* Info Card */}
            <div className="glass-card" style={{ padding: '16px 22px', maxWidth: '440px', width: '100%', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Sparkles size={20} color="var(--accent-purple)" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Dica:</strong> Use o mesmo número de WhatsApp cadastrado na loja para que suas reservas apareçam automaticamente.
              </div>
            </div>
          </div>
        )}

        {/* ===== LOGGED IN DASHBOARD ===== */}
        {session && (
          <>
            {/* Profile Banner */}
            <div className="glass-card" style={{
              padding: '24px 28px',
              borderLeft: '4px solid var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  BEM-VINDO DE VOLTA, COLECIONADOR
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {session.name}
                </h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={13} /> {session.email}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={13} /> {session.phone}
                  </span>
                  {loggedCustomer?.instagram && (
                    <span style={{ color: 'var(--accent-purple)' }}>{loggedCustomer.instagram}</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>RESERVAS</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{myReservations.length}</div>
                </div>
                <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>ENTREGUES</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-green)' }}>{deliveredCount}</div>
                </div>
                <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.2)', textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>SALDO</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: totalPending > 0 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                    {totalPending > 0 ? formatBRL(totalPending) : '✓'}
                  </div>
                </div>
              </div>
            </div>

            {/* No linked customer warning */}
            {!loggedCustomer && (
              <div className="glass-card" style={{
                padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px',
                borderLeft: '4px solid var(--accent-orange)',
              }}>
                <Phone size={22} color="var(--accent-orange)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Seus pedidos ainda não foram vinculados
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    O lojista precisa cadastrar você com o mesmo número de WhatsApp (<strong style={{ color: 'var(--accent-cyan)' }}>{session.phone}</strong>) para que suas reservas apareçam aqui. Entre em contato com a loja.
                  </div>
                </div>
              </div>
            )}

            {/* Store Info & WhatsApp */}
            <div className="glass-card" style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Store size={18} color="var(--accent-purple)" />
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Loja</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {settings?.storeName || 'Miniatures Club'}
                  </div>
                </div>
              </div>

              <button onClick={handleContactStore} className="btn btn-whatsapp" style={{ padding: '8px 14px', fontSize: '0.8125rem', gap: '6px' }}>
                <MessageCircle size={16} /> Falar com a Loja
              </button>
            </div>

            {/* Reservations List */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={18} /> Minhas Reservas ({myReservations.length})
              </h3>

              {myReservations.length === 0 ? (
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                  <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Nenhuma reserva ativa no momento</div>
                  <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>Visite a vitrine para fazer novas reservas!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {myReservations.map((res) => {
                    const item = items.find((i) => i.id === res.itemId);
                    const brand = item ? BRANDS.find((b) => b.id === item.brandId) : null;
                    const statusConfig = RESERVATION_STATUSES[res.status] || RESERVATION_STATUSES.deposit_paid;
                    const balance = Math.max(0, Number(res.totalPrice || 0) - Number(res.depositPaid || 0));
                    const currentStepIdx = STATUS_TIMELINE.findIndex((s) => s.key === res.status);

                    return (
                      <div key={res.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        {/* Card Header */}
                        <div style={{ padding: '20px 22px 16px', display: 'flex', alignItems: 'flex-start', gap: '14px', borderBottom: '1px solid var(--border-color)' }}>
                          {item?.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item?.name}
                              style={{ width: '68px', height: '68px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)', flexShrink: 0 }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                              <div>
                                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                                  {item?.name || 'Modelo'}
                                </h4>
                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span>SKU: {item?.sku}</span>
                                  {brand && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: brand.color }} />
                                      {brand.name}
                                    </span>
                                  )}
                                  <span>{res.quantity} un</span>
                                </div>
                              </div>
                              <span className="badge" style={{ color: statusConfig.color, backgroundColor: statusConfig.bg, flexShrink: 0 }}>
                                <span className="badge-dot" />
                                {statusConfig.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Timeline */}
                        <div style={{ padding: '16px 22px', background: 'rgba(0,0,0,0.15)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                            <div style={{
                              position: 'absolute', top: '11px', left: '12px', right: '12px',
                              height: '3px', background: 'var(--border-color)', borderRadius: '2px', zIndex: 0,
                            }}>
                              <div style={{
                                width: `${Math.max(0, (currentStepIdx / (STATUS_TIMELINE.length - 1)) * 100)}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-green))',
                                borderRadius: '2px',
                                transition: 'width 0.5s ease',
                              }} />
                            </div>

                            {STATUS_TIMELINE.map((step, idx) => {
                              const isCompleted = idx <= currentStepIdx;
                              const isCurrent = idx === currentStepIdx;
                              return (
                                <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative' }}>
                                  <div style={{
                                    width: '24px', height: '24px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: isCompleted ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))' : 'var(--bg-card)',
                                    border: isCompleted ? 'none' : '2px solid var(--border-color)',
                                    boxShadow: isCurrent ? '0 0 12px rgba(56, 189, 248, 0.5)' : 'none',
                                    transition: 'all 0.3s ease',
                                  }}>
                                    {isCompleted ? <CheckCircle2 size={14} color="#fff" /> : <Circle size={10} color="var(--text-muted)" />}
                                  </div>
                                  <span style={{
                                    fontSize: '0.6rem', fontWeight: isCurrent ? 800 : 600,
                                    color: isCompleted ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                    marginTop: '5px', textAlign: 'center', maxWidth: '60px', lineHeight: 1.2,
                                  }}>
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Tracking */}
                        {res.trackingCode ? (
                          <div style={{
                            padding: '14px 22px',
                            background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.1), rgba(16, 185, 129, 0.1))',
                            borderTop: '1px solid rgba(56, 189, 248, 0.2)',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            flexWrap: 'wrap', gap: '10px',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <Truck size={20} color="var(--accent-cyan)" />
                              <div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>RASTREIO CORREIOS</div>
                                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.06em' }}>{res.trackingCode}</div>
                              </div>
                            </div>
                            <a href={buildTrackingUrl(res.trackingCode)} target="_blank" rel="noopener noreferrer"
                              className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.78rem', gap: '5px', textDecoration: 'none' }}>
                              Rastrear <ExternalLink size={13} />
                            </a>
                          </div>
                        ) : (
                          <div style={{
                            padding: '10px 22px', borderTop: '1px solid var(--border-color)',
                            borderBottom: '1px solid var(--border-color)',
                            fontSize: '0.78rem', color: 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: '6px',
                          }}>
                            <Clock size={14} /> Rastreio disponível após despacho
                          </div>
                        )}

                        {/* Financial */}
                        <div style={{ padding: '14px 22px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Valor Total</span>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatBRL(res.totalPrice)}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Sinal Pago</span>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{formatBRL(res.depositPaid)}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Saldo</span>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: balance > 0 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                              {balance > 0 ? formatBRL(balance) : 'QUITADO ✓'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ padding: '0 22px 18px', display: 'flex', gap: '10px' }}>
                          <button onClick={() => setReceiptReservation(res)} className="btn btn-secondary" style={{ flex: 1, padding: '9px 12px', fontSize: '0.8125rem', gap: '6px' }}>
                            <FileText size={15} /> Comprovante
                          </button>
                          <button onClick={handleContactStore} className="btn btn-whatsapp" style={{ flex: 1, padding: '9px 12px', fontSize: '0.8125rem', gap: '6px' }}>
                            <MessageCircle size={15} /> WhatsApp
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Receipt Modal */}
      {receiptReservation && (
        <ModalReceipt
          isOpen={!!receiptReservation}
          onClose={() => setReceiptReservation(null)}
          reservation={receiptReservation}
          customer={loggedCustomer}
          item={items.find((i) => i.id === receiptReservation.itemId)}
          settings={settings}
        />
      )}

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '28px 20px', color: 'var(--text-muted)', fontSize: '0.78rem', borderTop: '1px solid var(--border-color)', marginTop: '40px' }}>
        <div>{settings?.storeName || 'Diecast Store'} • Área do Colecionador</div>
      </footer>
    </div>
  );
};
