import React, { useState } from 'react';
import { Flame, Lock, Mail, User, Store, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { signInUser, signUpUser, resetUserPassword, isSupabaseConfigured } from '../services/supabase';

export const AuthView = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const { data, error } = await signInUser({ email, password });
      if (error) {
        setErrorMessage(error.message || 'Erro ao realizar login. Verifique suas credenciais.');
      } else if (data && data.user) {
        onAuthSuccess(data.user);
      }
    } catch (err) {
      setErrorMessage('Ocorreu um erro ao conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem. Digite novamente.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUpUser({ email, password, fullName, storeName });
      if (error) {
        setErrorMessage(error.message || 'Erro ao criar conta.');
      } else {
        setSuccessMessage('Conta criada com sucesso! Você já pode navegar.');
        if (data && data.user) {
          setTimeout(() => onAuthSuccess(data.user), 1000);
        }
      }
    } catch (err) {
      setErrorMessage('Ocorreu um erro no cadastro.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const { error } = await resetUserPassword(email);
      if (error) {
        setErrorMessage(error.message || 'Erro ao solicitar redefinição.');
      } else {
        setSuccessMessage('Enviamos um e-mail com as instruções para redefinir sua senha.');
      }
    } catch (err) {
      setErrorMessage('Erro ao solicitar redefinição.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const { data } = await signInUser({ email: 'demo@diecastprevendas.com.br', password: 'demo' });
    onAuthSuccess(data.user);
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.12) 0%, transparent 50%), radial-gradient(circle at 50% 100%, rgba(56, 189, 248, 0.12) 0%, transparent 50%), var(--bg-main)',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
      }}>
        {/* Logo & Brand Header */}
        <div style={{ textTransform: 'center', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(249, 115, 22, 0.4)',
            marginBottom: '12px',
          }}>
            <Flame size={32} color="#ffffff" />
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
            DIECAST <span style={{ color: 'var(--accent-orange)' }}>PRE-ORDER</span>
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Sistema de Gestão de Pré-Vendas de Miniaturas (Mini GT, Kaido House, Pop Race)
          </p>


        </div>

        {/* Mode Switch Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: authMode === 'forgot' ? '1fr' : '1fr 1fr',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
        }}>
          {authMode !== 'forgot' && (
            <>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: authMode === 'login' ? 'var(--bg-card)' : 'transparent',
                  color: authMode === 'login' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: authMode === 'login' ? 700 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Entrar na Conta
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: authMode === 'register' ? 'var(--bg-card)' : 'transparent',
                  color: authMode === 'register' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: authMode === 'register' ? 700 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Criar Nova Conta
              </button>
            </>
          )}

          {authMode === 'forgot' && (
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: 'var(--accent-cyan)',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              ← Voltar para o Login
            </button>
          )}
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '0.8125rem',
          }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#86efac',
            fontSize: '0.8125rem',
          }}>
            {successMessage}
          </div>
        )}

        {/* LOGIN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="seuemail@loja.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Senha</label>
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Esqueci minha senha
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '38px', paddingRight: '38px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '6px', fontSize: '0.9375rem', padding: '12px' }}
            >
              {loading ? 'Entrando...' : 'Acessar Painel'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nome da Loja / Perfil</label>
              <div style={{ position: 'relative' }}>
                <Store size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="Ex: Diecast Club Pré-Vendas"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="seuemail@loja.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Senha (mínimo 6 caracteres)</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Senha</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '6px', fontSize: '0.9375rem', padding: '12px' }}
            >
              {loading ? 'Criando Conta...' : 'Cadastrar e Acessar'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Digite seu e-mail cadastrado e enviaremos um link de recuperação.
            </p>

            <div className="form-group">
              <label className="form-label">E-mail de Cadastro</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="seuemail@loja.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
            </button>
          </form>
        )}

        {/* Quick Demo Access Button */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.8125rem' }}
          >
            <ShieldCheck size={16} color="var(--accent-orange)" />
            Entrar no Modo Demonstração Rápida
          </button>
        </div>
      </div>
    </div>
  );
};
