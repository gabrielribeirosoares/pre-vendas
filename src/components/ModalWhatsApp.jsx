import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { generateWhatsAppMessage, buildWhatsAppUrl } from '../utils/helpers';

export const ModalWhatsApp = ({
  isOpen,
  onClose,
  reservation,
  customer,
  item,
  settings,
}) => {
  const [msgType, setMsgType] = useState('item_arrived');
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (reservation && customer && item) {
      const generated = generateWhatsAppMessage({
        type: msgType,
        customerName: customer.name,
        itemName: item.name,
        sku: item.sku,
        depositPaid: reservation.depositPaid,
        totalPrice: reservation.totalPrice,
        pixKey: settings.pixKey,
        releaseQuarter: item.releaseQuarter,
      });
      setCustomText(generated);
    }
  }, [msgType, reservation, customer, item, settings]);

  if (!isOpen || !reservation || !customer || !item) return null;

  const whatsappUrl = buildWhatsAppUrl(customer.phone, customText);

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
              <MessageCircle size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Notificação WhatsApp • {customer.name}
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-icon">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tipo de Mensagem */}
          <div className="form-group">
            <label className="form-label">Modelo de Mensagem</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setMsgType('item_arrived')}
                className={`btn ${msgType === 'item_arrived' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                🎉 Miniatura Chegou (Quitação)
              </button>

              <button
                type="button"
                onClick={() => setMsgType('deposit_reminder')}
                className={`btn ${msgType === 'deposit_reminder' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                💵 Cobrança de Sinal
              </button>

              <button
                type="button"
                onClick={() => setMsgType('general_status')}
                className={`btn ${msgType === 'general_status' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                📦 Previsão / Status Geral
              </button>
            </div>
          </div>

          {/* Textarea Preview & Edit */}
          <div className="form-group">
            <label className="form-label">Texto da Mensagem (Editável)</label>
            <textarea
              rows={8}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="textarea-field"
              style={{ fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.4 }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={handleCopy} className="btn btn-secondary">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado!' : 'Copiar Texto'}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={16} /> Enviar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};
