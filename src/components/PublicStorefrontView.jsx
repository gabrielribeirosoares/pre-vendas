import React, { useState } from 'react';
import {
  Flame,
  Search,
  Car,
  Calendar,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  ArrowLeft,
  UserCheck,
} from 'lucide-react';
import { formatBRL, buildWhatsAppUrl } from '../utils/helpers';
import { BRANDS, ITEM_STATUSES } from '../data/initialData';

export const PublicStorefrontView = ({
  items = [],
  settings,
  onBackToAdmin,
  onOpenCustomerPortal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Only show active items to public catalog (open pre-orders & in transit)
  const publicItems = items.filter((item) => item.status !== 'closed');

  const filteredItems = publicItems.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrand === 'all' || item.brandId === selectedBrand;

    return matchesSearch && matchesBrand;
  });

  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleReserveWhatsApp = (item) => {
    const message = `Olá! Gostaria de reservar a miniatura em pré-venda:\n\n🏎️ *${item.name}*\n📌 SKU: ${item.sku}\n💰 Preço: ${formatBRL(item.retailPrice)} (Sinal: ${formatBRL(item.minDeposit)})\n📅 Previsão de Chegada: ${item.releaseQuarter || 'A definir'}\n\nPor favor, me informe como proceder com o pagamento do sinal. Obrigado!`;
    const phone = settings?.storePhone || '';
    const url = buildWhatsAppUrl(phone, message);
    window.open(url, '_blank');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 10% 0%, rgba(168, 85, 247, 0.1) 0%, transparent 40%), radial-gradient(circle at 90% 100%, rgba(56, 189, 248, 0.1) 0%, transparent 40%), var(--bg-main)',
      color: 'var(--text-primary)',
      paddingBottom: '60px',
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
          maxWidth: '1300px',
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}>
          {/* Store Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
            ) : (
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 18px rgba(56, 189, 248, 0.35)',
              }}>
                <Flame size={24} color="#ffffff" />
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {settings?.storeName || 'Miniatures Pre-Orders Club'}
              </h1>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} /> VITRINE OFICIAL DE PRÉ-VENDAS DIECAST
              </span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Customer Portal Button */}
            {onOpenCustomerPortal && (
              <button onClick={onOpenCustomerPortal} className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '8px 14px', gap: '6px' }}>
                <UserCheck size={16} /> Meus Pedidos
              </button>
            )}

            <button onClick={handleShareLink} className="btn btn-secondary" style={{ fontSize: '0.8125rem', gap: '6px' }}>
              {copiedLink ? <Check size={16} color="var(--accent-green)" /> : <Copy size={16} />}
              {copiedLink ? 'Copiado!' : 'Compartilhar'}
            </button>

            {onBackToAdmin && (
              <button onClick={onBackToAdmin} className="btn btn-secondary" style={{ fontSize: '0.8125rem', gap: '6px', color: 'var(--accent-cyan)' }}>
                <ArrowLeft size={16} /> Painel Lojista
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Catalog */}
      <main style={{ maxWidth: '1300px', margin: '0 auto', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Welcome Banner */}
        <div className="glass-card" style={{
          padding: '24px 28px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(168, 85, 247, 0.08))',
          border: '1px solid var(--border-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div style={{ maxWidth: '680px' }}>
            <span style={{
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              background: 'rgba(56, 189, 248, 0.15)', padding: '4px 10px', borderRadius: '999px',
            }}>
              GARANTA SEU MODELO RARO
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px', lineHeight: 1.25 }}>
              Vitrine Oficial de Lançamentos em Pré-Venda
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '6px' }}>
              Reserve miniaturas exclusivas com pagamento de sinal reduzido. Acompanhe seus pedidos na Área do Colecionador.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '12px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <ShieldCheck size={26} color="var(--accent-green)" />
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Reserva Garantida</div>
              <div style={{ color: 'var(--text-secondary)' }}>Acompanhamento via WhatsApp</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Buscar modelo ou SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '38px', height: '42px', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => setSelectedBrand('all')}
              className={`btn ${selectedBrand === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 14px', fontSize: '0.8125rem', minHeight: '38px' }}
            >
              Todas ({publicItems.length})
            </button>
            {BRANDS.map((b) => {
              const brandItems = publicItems.filter((i) => i.brandId === b.id);
              if (brandItems.length === 0) return null;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrand(b.id)}
                  className={`btn ${selectedBrand === b.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '8px 14px', fontSize: '0.8125rem', minHeight: '38px',
                    borderColor: selectedBrand === b.id ? undefined : `${b.color}40`,
                    color: selectedBrand === b.id ? undefined : b.color,
                  }}
                >
                  {b.name} ({brandItems.length})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {filteredItems.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Car size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>Nenhum modelo encontrado</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '24px' }}>
            {filteredItems.map((item) => {
              const brand = BRANDS.find((b) => b.id === item.brandId) || BRANDS[BRANDS.length - 1];
              const statusConfig = ITEM_STATUSES[item.status] || ITEM_STATUSES.pre_order_open;

              return (
                <div key={item.id} className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ position: 'relative', width: '100%', height: '210px', backgroundColor: '#090d16' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=600&q=80'; }}
                    />
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px', padding: '4px 10px', borderRadius: '6px',
                      background: 'rgba(9, 13, 22, 0.88)', backdropFilter: 'blur(8px)',
                      border: `1px solid ${brand.color}`, color: brand.color,
                      fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase',
                    }}>
                      {brand.name}
                    </div>
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <span className="badge" style={{ color: statusConfig.color, backgroundColor: 'rgba(9, 13, 22, 0.9)' }}>
                        <span className="badge-dot" />
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        SKU: {item.sku} • Escala {item.scale || '1:64'}
                      </div>
                      <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.3 }}>
                        {item.name}
                      </h3>
                      {item.description && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div style={{
                      padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>VALOR FINAL</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatBRL(item.retailPrice)}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>SINAL P/ GARANTIR</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{formatBRL(item.minDeposit)}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} color="var(--accent-orange)" /> Previsão:
                        </span>
                        <strong style={{ color: 'var(--accent-orange)' }}>{item.releaseQuarter || 'Em breve'}</strong>
                      </div>
                      <button
                        onClick={() => handleReserveWhatsApp(item)}
                        className="btn btn-whatsapp"
                        style={{ width: '100%', padding: '10px 14px', fontSize: '0.875rem', gap: '8px' }}
                      >
                        <MessageCircle size={18} /> Garanta no WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)', fontSize: '0.8125rem', borderTop: '1px solid var(--border-color)', marginTop: '40px' }}>
        <div>{settings?.storeName || 'Loja de Miniaturas Diecast'} • Vitrine de Pré-Vendas</div>
      </footer>
    </div>
  );
};
