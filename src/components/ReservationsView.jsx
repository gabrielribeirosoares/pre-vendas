import React, { useState } from 'react';
import {
  Plus,
  MessageCircle,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';
import { formatBRL } from '../utils/helpers';
import { RESERVATION_STATUSES } from '../data/initialData';

export const ReservationsView = ({
  reservations,
  items,
  customers,
  searchQuery,
  onNewReservation,
  onEditReservation,
  onDeleteReservation,
  onUpdateReservationStatus,
  onOpenWhatsApp,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredReservations = reservations.filter((res) => {
    const customer = customers.find((c) => c.id === res.customerId);
    const item = items.find((i) => i.id === res.itemId);

    const matchesSearch =
      !searchQuery ||
      (customer && customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer && customer.phone.includes(searchQuery)) ||
      (item && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item && item.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'all' || res.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Reservas de Clientes
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '4px' }}>
            Gestão de pedidos individuais, controle de sinal pago e envio de avisos via WhatsApp.
          </p>
        </div>

        <button onClick={onNewReservation} className="btn btn-primary">
          <Plus size={18} />
          Nova Reserva de Cliente
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
          <Filter size={16} />
          <span>Status da Reserva:</span>
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="select-field"
          style={{ width: 'auto', minWidth: '220px', height: '38px', fontSize: '0.875rem' }}
        >
          <option value="all">Todos os Status ({reservations.length})</option>
          {Object.entries(RESERVATION_STATUSES).map(([key, st]) => (
            <option key={key} value={key}>{st.label}</option>
          ))}
        </select>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente / Colecionador</th>
              <th>Modelo Miniatura & SKU</th>
              <th>Qtd</th>
              <th>Valor Total</th>
              <th>Sinal Pago</th>
              <th>Saldo Pendente</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ações & WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Nenhuma reserva encontrada com os critérios informados.
                </td>
              </tr>
            ) : (
              filteredReservations.map((res) => {
                const customer = customers.find((c) => c.id === res.customerId);
                const item = items.find((i) => i.id === res.itemId);
                const statusConfig = RESERVATION_STATUSES[res.status] || RESERVATION_STATUSES.deposit_paid;
                const balance = Math.max(0, (Number(res.totalPrice) || 0) - (Number(res.depositPaid) || 0));

                return (
                  <tr key={res.id}>
                    {/* Customer */}
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {customer ? customer.name : 'Cliente Removido'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {customer?.phone} {customer?.instagram ? `• ${customer.instagram}` : ''}
                      </div>
                    </td>

                    {/* Item */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item?.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt=""
                            style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=100&q=80'; }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item ? item.name : 'Modelo Indefinido'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                            SKU: {item?.sku} • Chegada: {item?.releaseQuarter}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Qtd */}
                    <td style={{ fontWeight: 700 }}>{res.quantity} un</td>

                    {/* Total Price */}
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatBRL(res.totalPrice)}
                    </td>

                    {/* Deposit Paid */}
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {formatBRL(res.depositPaid)}
                    </td>

                    {/* Balance */}
                    <td style={{ fontWeight: 700, color: balance > 0 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                      {balance > 0 ? formatBRL(balance) : 'Quitado ✓'}
                    </td>

                    {/* Status Selector */}
                    <td>
                      <select
                        value={res.status}
                        onChange={(e) => onUpdateReservationStatus(res.id, e.target.value)}
                        className="select-field"
                        style={{
                          height: '32px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: statusConfig.color,
                          backgroundColor: statusConfig.bg,
                          border: `1px solid ${statusConfig.color}40`,
                        }}
                      >
                        {Object.entries(RESERVATION_STATUSES).map(([key, st]) => (
                          <option key={key} value={key}>{st.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        {customer && item && (
                          <button
                            onClick={() => onOpenWhatsApp(res, customer, item)}
                            className="btn btn-whatsapp"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            title="Notificar no WhatsApp"
                          >
                            <MessageCircle size={14} /> WhatsApp
                          </button>
                        )}

                        <button
                          onClick={() => onEditReservation(res)}
                          className="btn btn-icon"
                          title="Editar Reserva"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() => onDeleteReservation(res.id)}
                          className="btn btn-icon"
                          title="Excluir Reserva"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
