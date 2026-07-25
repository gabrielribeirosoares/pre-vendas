import React from 'react';
import { X, Printer, Copy, Check, ShieldCheck, Car, Calendar, DollarSign } from 'lucide-react';
import { formatBRL, formatDateBR, buildTrackingUrl } from '../utils/helpers';

export const ModalReceipt = ({ isOpen, onClose, reservation, customer, item, settings }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !reservation || !customer || !item) return null;

  const totalPrice = Number(reservation.totalPrice) || 0;
  const depositPaid = Number(reservation.depositPaid) || 0;
  const balance = Math.max(0, totalPrice - depositPaid);

  const handlePrint = () => {
    window.print();
  };

  const receiptText = `
========================================
📜 RECIBO DE RESERVA / PRÉ-VENDA
${settings?.storeName || 'Loja de Miniaturas Diecast'}
========================================

Data da Reserva: ${formatDateBR(reservation.createdAt || new Date().toISOString().slice(0, 10))}
Código da Reserva: #${reservation.id.toUpperCase()}

👤 CLIENTE:
Nome: ${customer.name}
Contato: ${customer.phone} ${customer.instagram ? `(${customer.instagram})` : ''}

🏎️ ITEM RESERVADO:
Modelo: ${item.name}
SKU: ${item.sku} | Marca: ${item.brandId || 'Diecast'}
Previsão de Chegada: ${item.releaseQuarter || 'A definir'}
Quantidade: ${reservation.quantity} un

💰 FINANCEIRO:
Valor Total: ${formatBRL(totalPrice)}
Sinal Pago: ${formatBRL(depositPaid)}
Saldo Restante: ${balance > 0 ? formatBRL(balance) : 'QUITADO ✓'}

${reservation.trackingCode ? `📦 Código de Rastreio: ${reservation.trackingCode}\n` : ''}
----------------------------------------
Chave PIX: ${settings?.pixKey || 'Consulte chave da loja'}
Obrigado por sua preferência!
========================================
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Comprovante de Reserva
            </h3>
          </div>

          <button onClick={onClose} className="btn btn-icon" style={{ minWidth: '32px', minHeight: '32px', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Receipt Printable Card */}
        <div className="modal-body">
          <div className="printable-receipt glass-card" style={{
            padding: '24px',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(0, 0, 0, 0.2))',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Receipt Header */}
            <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '14px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {settings?.storeName || 'Miniatures Pre-Orders'}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                COMPROVANTE OFICIAL DE PRÉ-VENDA
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                Cod: #{reservation.id.slice(0, 8).toUpperCase()} • {formatDateBR(reservation.createdAt || new Date().toISOString().slice(0, 10))}
              </span>
            </div>

            {/* Customer Details */}
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                COLECIONADOR
              </span>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                {customer.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {customer.phone} {customer.instagram ? `• ${customer.instagram}` : ''}
              </div>
            </div>

            {/* Item Details */}
            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt=""
                  style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                  SKU: {item.sku} • Qtd: {reservation.quantity} un
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Previsão: {item.releaseQuarter || 'Em breve'}
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              textAlign: 'center',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>VALOR TOTAL</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatBRL(totalPrice)}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>SINAL PAGO</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{formatBRL(depositPaid)}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>SALDO PENDENTE</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: balance > 0 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                  {balance > 0 ? formatBRL(balance) : 'QUITADO ✓'}
                </span>
              </div>
            </div>

            {/* Tracking Code if Present */}
            {reservation.trackingCode && (
              <div style={{ padding: '10px 12px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Código de Rastreio: </span>
                <a
                  href={buildTrackingUrl(reservation.trackingCode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-cyan)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  {reservation.trackingCode}
                </a>
              </div>
            )}

            {/* Footer PIX */}
            <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
              <div>Chave PIX Oficial: <strong style={{ color: 'var(--text-primary)' }}>{settings?.pixKey || 'Consulte a loja'}</strong></div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Guardar este comprovante para futuras consultas.</div>
            </div>
          </div>
        </div>

        {/* Modal Footer Buttons */}
        <div className="modal-footer">
          <button onClick={handleCopy} className="btn btn-secondary" style={{ gap: '6px' }}>
            {copied ? <Check size={16} color="var(--accent-green)" /> : <Copy size={16} />}
            {copied ? 'Copiado!' : 'Copiar Texto'}
          </button>

          <button onClick={handlePrint} className="btn btn-primary" style={{ gap: '6px' }}>
            <Printer size={16} /> Imprimir / PDF
          </button>
        </div>
      </div>
    </div>
  );
};
