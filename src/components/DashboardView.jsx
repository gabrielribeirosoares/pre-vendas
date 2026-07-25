import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  Car,
  ChevronRight,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { formatBRL, buildWhatsAppUrl, generateWhatsAppMessage } from '../utils/helpers';
import { BRANDS, ITEM_STATUSES, RESERVATION_STATUSES } from '../data/initialData';

export const DashboardView = ({
  items,
  reservations,
  customers,
  onNavigate,
  onOpenWhatsApp,
}) => {
  // Calculations
  const activeItemsCount = items.filter((i) => i.status !== 'closed').length;

  const totalReservedUnits = reservations.reduce((acc, r) => acc + (Number(r.quantity) || 1), 0);

  const totalExpectedRevenue = reservations.reduce((acc, r) => acc + (Number(r.totalPrice) || 0), 0);

  const totalDepositsReceived = reservations.reduce((acc, r) => acc + (Number(r.depositPaid) || 0), 0);

  const totalPendingBalance = Math.max(0, totalExpectedRevenue - totalDepositsReceived);

  // Incoming / Urgent Items (In Transit or Open Pre-orders)
  const itemsInTransit = items.filter((i) => i.status === 'in_transit');

  // Brand Stats
  const brandStats = BRANDS.map((brand) => {
    const brandItems = items.filter((i) => i.brandId === brand.id);
    const itemIds = brandItems.map((i) => i.id);
    const brandReservations = reservations.filter((r) => itemIds.includes(r.itemId));
    const units = brandReservations.reduce((acc, r) => acc + Number(r.quantity || 1), 0);
    const revenue = brandReservations.reduce((acc, r) => acc + Number(r.totalPrice || 0), 0);

    return {
      ...brand,
      itemCount: brandItems.length,
      unitsReserved: units,
      revenue,
    };
  });

  // Recent Reservations
  const recentReservations = [...reservations].reverse().slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Title */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Painel de Controle de Pré-Vendas
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '4px' }}>
          Visão geral de lançamentos, sinais recebidos de colecionadores e saldos a receber.
        </p>
      </div>

      {/* KPI Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
      }}>
        {/* Metric 1 */}
        <div className="glass-card glass-card-interactive" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Modelos em Pré-Venda
            </span>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent-cyan)' }}>
              <Car size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '12px' }}>
            {activeItemsCount} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>modelos</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--accent-cyan)', marginTop: '6px', fontWeight: 500 }}>
            {totalReservedUnits} miniaturas reservadas no total
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card glass-card-interactive" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Receita Total Prevista
            </span>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.12)', color: 'var(--accent-purple)' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '12px' }}>
            {formatBRL(totalExpectedRevenue)}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--accent-purple)', marginTop: '6px', fontWeight: 500 }}>
            Valor bruto das pré-vendas ativas
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card glass-card-interactive" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Sinais / Depósitos Recebidos
            </span>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-green)' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '12px' }}>
            {formatBRL(totalDepositsReceived)}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Garantias já pagas pelos clientes
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card glass-card-interactive" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Saldo Pendente A Receber
            </span>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(249, 115, 22, 0.12)', color: 'var(--accent-orange)' }}>
              <Clock size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-orange)', marginTop: '12px' }}>
            {formatBRL(totalPendingBalance)}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            A ser quitado na chegada do lote
          </div>
        </div>
      </div>

      {/* Urgent Alerts / Items in Transit Banner */}
      {itemsInTransit.length > 0 && (
        <div className="glass-card" style={{
          padding: '20px',
          borderLeft: '4px solid var(--accent-orange)',
          background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.08), transparent)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <AlertCircle size={20} color="var(--accent-orange)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Lotes em Trânsito / Chegada Iminente ({itemsInTransit.length})
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {itemsInTransit.map((item) => {
              const itemReservations = reservations.filter((r) => r.itemId === item.id);
              const totalUnits = itemReservations.reduce((acc, r) => acc + (Number(r.quantity) || 1), 0);

              return (
                <div key={item.id} style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=150&q=80'; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      SKU: {item.sku} • Chegada: <span style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>{item.releaseQuarter}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {totalUnits} reservadas
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Brands & Recent Reservations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Brand Summary */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Distribuição por Marca
            </h3>
            <button onClick={() => onNavigate('catalog')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              Ver Catálogo <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {brandStats.map((brand) => (
              <div key={brand.id} style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: brand.color }} />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{brand.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {brand.itemCount} modelos
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', background: brand.badgeBg, padding: '2px 8px', borderRadius: '6px' }}>
                    {brand.unitsReserved} un
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Client Reservations */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Últimas Reservas Registradas
            </h3>
            <button onClick={() => onNavigate('reservations')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              Todas as Reservas <ChevronRight size={14} />
            </button>
          </div>

          {recentReservations.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhuma reserva registrada ainda.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentReservations.map((res) => {
                const customer = customers.find((c) => c.id === res.customerId);
                const item = items.find((i) => i.id === res.itemId);
                const resStatus = RESERVATION_STATUSES[res.status] || RESERVATION_STATUSES.deposit_paid;

                return (
                  <div key={res.id} style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {customer?.name || 'Cliente'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item?.name || 'Item'} ({res.quantity} un)
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatBRL(res.totalPrice)}
                      </div>
                      <span className="badge" style={{ color: resStatus.color, backgroundColor: resStatus.bg, marginTop: '2px' }}>
                        {resStatus.label}
                      </span>
                    </div>

                    {customer && item && (
                      <button
                        onClick={() => onOpenWhatsApp(res, customer, item)}
                        className="btn btn-icon"
                        title="Enviar WhatsApp"
                        style={{ color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)' }}
                      >
                        <MessageCircle size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
