import React, { useState } from 'react';
import { UserPlus, MessageCircle, Edit2, Trash2, Phone, AtSign, FileText } from 'lucide-react';
import { formatBRL, buildWhatsAppUrl } from '../utils/helpers';

export const CustomersView = ({
  customers,
  reservations,
  onNewCustomer,
  onEditCustomer,
  onDeleteCustomer,
}) => {
  const [customerSearch, setCustomerSearch] = useState('');

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch) ||
    (c.instagram && c.instagram.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Base de Colecionadores (Clientes)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '4px' }}>
            Gerencie o cadastro de clientes, dados de contato e histórico de reservas.
          </p>
        </div>

        <button onClick={onNewCustomer} className="btn btn-primary">
          <UserPlus size={18} />
          Cadastrar Novo Colecionador
        </button>
      </div>

      {/* Grid of Customers */}
      {filteredCustomers.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Nenhum cliente cadastrado.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredCustomers.map((cust) => {
            const clientReservations = reservations.filter((r) => r.customerId === cust.id);
            const totalSpent = clientReservations.reduce((acc, r) => acc + (Number(r.totalPrice) || 0), 0);
            const totalDeposits = clientReservations.reduce((acc, r) => acc + (Number(r.depositPaid) || 0), 0);

            const whatsappUrl = buildWhatsAppUrl(
              cust.phone,
              `Olá ${cust.name}! Entrando em contato da loja de miniaturas diecast.`
            );

            return (
              <div key={cust.id} className="glass-card glass-card-interactive" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {cust.name}
                    </h3>
                    <span className="badge" style={{ color: 'var(--accent-purple)', backgroundColor: 'rgba(168, 85, 247, 0.15)' }}>
                      {clientReservations.length} reservas
                    </span>
                  </div>

                  {/* Contacts */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} color="var(--accent-cyan)" />
                      <span>{cust.phone || 'Sem telefone'}</span>
                    </div>

                    {cust.instagram && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AtSign size={14} color="var(--accent-orange)" />
                        <span>{cust.instagram}</span>
                      </div>
                    )}

                    {cust.notes && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                        <FileText size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{cust.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL EM RESERVAS</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatBRL(totalSpent)}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>SINAIS PAGO</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                      {formatBRL(totalDeposits)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.8125rem', textDecoration: 'none' }}
                  >
                    <MessageCircle size={16} /> Abrir WhatsApp
                  </a>

                  <button
                    onClick={() => onEditCustomer(cust)}
                    className="btn btn-icon"
                    title="Editar Cliente"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => onDeleteCustomer(cust.id)}
                    className="btn btn-icon"
                    title="Excluir Cliente"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
