import React, { useState } from 'react';
import {
  Plus,
  MessageCircle,
  Edit2,
  Trash2,
  Filter,
  FileText,
  Package,
} from 'lucide-react';
import { formatBRL, buildTrackingUrl } from '../utils/helpers';
import { RESERVATION_STATUSES } from '../data/initialData';
import { ModalReceipt } from './ModalReceipt';

export const ReservationsView = ({
  reservations,
  items,
  customers,
  searchQuery,
  settings,
  onNewReservation,
  onEditReservation,
  onDeleteReservation,
  onUpdateReservationStatus,
  onOpenWhatsApp,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [receiptReservation, setReceiptReservation] = useState(null);

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

      {/* Desktop Table View */}
      <div className="table-container desktop-only-table">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-customer">Cliente / Colecionador</th>
              <th className="col-item">Modelo Miniatura & SKU</th>
              <th className="col-qty">Qtd</th>
              <th className="col-price">Valor Total</th>
              <th className="col-deposit">Sinal Pago</th>
              <th className="col-balance">Saldo Pendente</th>
              <th className="col-status">Status</th>
              <th className="col-actions" style={{ textAlign: 'right' }}>Ações & WhatsApp</th>
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
                    <td className="col-customer">
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {customer ? customer.name : 'Cliente Removido'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {customer?.phone} {customer?.instagram ? `• ${customer.instagram}` : ''}
                      </div>
                    </td>

                    {/* Item */}
                    <td className="col-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item?.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt=""
                            style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=100&q=80'; }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                            {item ? item.name : 'Modelo Indefinido'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                            SKU: {item?.sku} • Chegada: {item?.releaseQuarter}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Qtd */}
                    <td className="col-qty" style={{ fontWeight: 700 }}>{res.quantity} un</td>

                    {/* Total Price */}
                    <td className="col-price" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatBRL(res.totalPrice)}
                    </td>

                    {/* Deposit Paid */}
                    <td className="col-deposit" style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {formatBRL(res.depositPaid)}
                    </td>

                    {/* Balance */}
                    <td className="col-balance" style={{ fontWeight: 700, color: balance > 0 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                      {balance > 0 ? formatBRL(balance) : 'Quitado ✓'}
                    </td>

                    {/* Status Selector */}
                    <td className="col-status">
                      <select
                        value={res.status}
                        onChange={(e) => onUpdateReservationStatus(res.id, e.target.value)}
                        className="status-select"
                        style={{
                          color: statusConfig.color,
                          backgroundColor: statusConfig.bg,
                          border: `1px solid ${statusConfig.color}40`,
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(statusConfig.color)}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        }}
                      >
                        {Object.entries(RESERVATION_STATUSES).map(([key, st]) => (
                          <option key={key} value={key} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="col-actions" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        {customer && item && (
                          <button
                            onClick={() => onOpenWhatsApp(res, customer, item)}
                            className="btn btn-whatsapp"
                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                            title="Notificar no WhatsApp"
                          >
                            <MessageCircle size={14} /> WhatsApp
                          </button>
                        )}

                        <button
                          onClick={() => setReceiptReservation(res)}
                          className="btn btn-icon"
                          title="Ver Recibo / Comprovante"
                          style={{ minWidth: '34px', minHeight: '34px', padding: '6px', color: 'var(--accent-cyan)' }}
                        >
                          <FileText size={14} />
                        </button>

                        <button
                          onClick={() => onEditReservation(res)}
                          className="btn btn-icon"
                          title="Editar Reserva"
                          style={{ minWidth: '34px', minHeight: '34px', padding: '6px' }}
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => onDeleteReservation(res.id)}
                          className="btn btn-icon"
                          title="Excluir Reserva"
                          style={{ color: '#ef4444', minWidth: '34px', minHeight: '34px', padding: '6px' }}
                        >
                          <Trash2 size={14} />
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

      {/* Mobile Cards View */}
      <div className="mobile-only-cards">
        {filteredReservations.length === 0 ? (
          <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhuma reserva encontrada.
          </div>
        ) : (
          filteredReservations.map((res) => {
            const customer = customers.find((c) => c.id === res.customerId);
            const item = items.find((i) => i.id === res.itemId);
            const statusConfig = RESERVATION_STATUSES[res.status] || RESERVATION_STATUSES.deposit_paid;
            const balance = Math.max(0, (Number(res.totalPrice) || 0) - (Number(res.depositPaid) || 0));

            return (
              <div key={res.id} className="mobile-reservation-card">
                {/* Header: Customer Name + Status Dropdown */}
                <div className="mobile-card-header">
                  <div>
                    <div className="customer-name">{customer ? customer.name : 'Cliente Removido'}</div>
                    <div className="customer-sub">
                      {customer?.phone} {customer?.instagram ? `• ${customer.instagram}` : ''}
                    </div>
                  </div>

                  <select
                    value={res.status}
                    onChange={(e) => onUpdateReservationStatus(res.id, e.target.value)}
                    className="status-select"
                    style={{
                      color: statusConfig.color,
                      backgroundColor: statusConfig.bg,
                      border: `1px solid ${statusConfig.color}40`,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(statusConfig.color)}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    }}
                  >
                    {Object.entries(RESERVATION_STATUSES).map(([key, st]) => (
                      <option key={key} value={key} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Item Details */}
                <div className="mobile-card-item">
                  {item?.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="item-img"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=100&q=80'; }}
                    />
                  )}
                  <div>
                    <div className="item-name">{item ? item.name : 'Modelo Indefinido'}</div>
                    <div className="item-sku">
                      SKU: {item?.sku} • Chegada: {item?.releaseQuarter}
                    </div>
                    {res.trackingCode && (
                      <div style={{ fontSize: '0.72rem', marginTop: '2px' }}>
                        📦 Rastreio:{' '}
                        <a
                          href={buildTrackingUrl(res.trackingCode)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--accent-cyan)', fontWeight: 700, textDecoration: 'underline' }}
                        >
                          {res.trackingCode}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="mobile-card-values">
                  <div>
                    <span className="label">Qtd</span>
                    <span className="value">{res.quantity} un</span>
                  </div>
                  <div>
                    <span className="label">Total</span>
                    <span className="value">{formatBRL(res.totalPrice)}</span>
                  </div>
                  <div>
                    <span className="label">Sinal</span>
                    <span className="value cyan">{formatBRL(res.depositPaid)}</span>
                  </div>
                  <div>
                    <span className="label">Saldo</span>
                    <span className={`value ${balance > 0 ? 'orange' : 'green'}`}>
                      {balance > 0 ? formatBRL(balance) : 'Quitado ✓'}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mobile-card-actions">
                  {customer && item && (
                    <button
                      onClick={() => onOpenWhatsApp(res, customer, item)}
                      className="btn btn-whatsapp"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.8125rem' }}
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </button>
                  )}

                  <button
                    onClick={() => setReceiptReservation(res)}
                    className="btn btn-icon"
                    title="Ver Recibo / Comprovante"
                    style={{ color: 'var(--accent-cyan)' }}
                  >
                    <FileText size={16} />
                  </button>

                  <button
                    onClick={() => onEditReservation(res)}
                    className="btn btn-icon"
                    title="Editar Reserva"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => onDeleteReservation(res.id)}
                    className="btn btn-icon"
                    title="Excluir Reserva"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Digital Receipt Modal */}
      {receiptReservation && (
        <ModalReceipt
          isOpen={!!receiptReservation}
          onClose={() => setReceiptReservation(null)}
          reservation={receiptReservation}
          customer={customers.find((c) => c.id === receiptReservation.customerId)}
          item={items.find((i) => i.id === receiptReservation.itemId)}
          settings={settings}
        />
      )}
    </div>
  );
};
