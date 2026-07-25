import React, { useState } from 'react';
import { X, MessageCircle, Send, CheckCircle, Users } from 'lucide-react';
import { formatBRL, buildWhatsAppUrl, generateWhatsAppMessage } from '../utils/helpers';

export const ModalBatchWhatsApp = ({ isOpen, onClose, item, reservations = [], customers = [], settings }) => {
  const [sentMap, setSentMap] = useState({});

  if (!isOpen || !item) return null;

  const itemReservations = reservations.filter((r) => r.itemId === item.id);

  const handleOpenSingleWhatsApp = (res, customer) => {
    const message = generateWhatsAppMessage({
      type: 'item_arrived',
      customerName: customer.name,
      itemName: item.name,
      sku: item.sku,
      depositPaid: res.depositPaid,
      totalPrice: res.totalPrice,
      pixKey: settings?.pixKey,
      releaseQuarter: item.releaseQuarter,
      trackingCode: res.trackingCode,
    });

    const url = buildWhatsAppUrl(customer.phone, message);
    window.open(url, '_blank');

    setSentMap((prev) => ({ ...prev, [res.id]: true }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Aviso de Chegada por Lote (WhatsApp)
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Notifique individualmente cada colecionador que reservou este item.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-icon" style={{ minWidth: '32px', minHeight: '32px', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Item Card */}
          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {item.imageUrl && (
              <img src={item.imageUrl} alt="" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{item.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                SKU: {item.sku} • {itemReservations.length} reservas registradas
              </div>
            </div>
          </div>

          {/* Buyers List */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              LISTA DE COLECIONADORES A NOTIFICAR ({itemReservations.length})
            </span>

            {itemReservations.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Nenhuma reserva encontrada para este modelo.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {itemReservations.map((res) => {
                  const customer = customers.find((c) => c.id === res.customerId);
                  const isSent = !!sentMap[res.id];
                  const balance = Math.max(0, (Number(res.totalPrice) || 0) - (Number(res.depositPaid) || 0));

                  if (!customer) return null;

                  return (
                    <div
                      key={res.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {customer.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {customer.phone} • {res.quantity} un • Saldo: <strong style={{ color: balance > 0 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>{balance > 0 ? formatBRL(balance) : 'Quitado'}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenSingleWhatsApp(res, customer)}
                        className={`btn ${isSent ? 'btn-secondary' : 'btn-whatsapp'}`}
                        style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '6px' }}
                      >
                        {isSent ? <CheckCircle size={14} color="var(--accent-green)" /> : <Send size={14} />}
                        {isSent ? 'Enviado!' : 'Enviar WhatsApp'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Concluir / Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
