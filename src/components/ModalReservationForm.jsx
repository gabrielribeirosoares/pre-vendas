import React, { useState, useEffect } from 'react';
import { X, Save, User, Car, DollarSign } from 'lucide-react';
import { RESERVATION_STATUSES } from '../data/initialData';
import { formatBRL } from '../utils/helpers';

export const ModalReservationForm = ({
  isOpen,
  onClose,
  onSave,
  reservationToEdit,
  items,
  customers,
  preselectedItem,
}) => {
  const [formData, setFormData] = useState({
    customerId: '',
    itemId: '',
    quantity: 1,
    depositPaid: '',
    totalPrice: '',
    status: 'deposit_paid',
    notes: '',
  });

  useEffect(() => {
    if (reservationToEdit) {
      setFormData({
        ...reservationToEdit,
        depositPaid: reservationToEdit.depositPaid || '',
        totalPrice: reservationToEdit.totalPrice || '',
      });
    } else {
      const initialItemId = preselectedItem ? preselectedItem.id : (items[0]?.id || '');
      const initialCustId = customers[0]?.id || '';
      const selectedItemObj = items.find((i) => i.id === initialItemId);

      setFormData({
        customerId: initialCustId,
        itemId: initialItemId,
        quantity: 1,
        depositPaid: selectedItemObj ? selectedItemObj.minDeposit : '',
        totalPrice: selectedItemObj ? selectedItemObj.retailPrice : '',
        status: 'deposit_paid',
        notes: '',
      });
    }
  }, [reservationToEdit, preselectedItem, isOpen]);

  // Recalculate price when item or quantity changes
  const handleItemChange = (newItemId) => {
    const selectedItemObj = items.find((i) => i.id === newItemId);
    const qty = Number(formData.quantity) || 1;
    if (selectedItemObj) {
      setFormData({
        ...formData,
        itemId: newItemId,
        totalPrice: selectedItemObj.retailPrice * qty,
        depositPaid: selectedItemObj.minDeposit * qty,
      });
    } else {
      setFormData({ ...formData, itemId: newItemId });
    }
  };

  const handleQtyChange = (newQty) => {
    const qty = Math.max(1, Number(newQty) || 1);
    const selectedItemObj = items.find((i) => i.id === formData.itemId);
    if (selectedItemObj) {
      setFormData({
        ...formData,
        quantity: qty,
        totalPrice: selectedItemObj.retailPrice * qty,
        depositPaid: selectedItemObj.minDeposit * qty,
      });
    } else {
      setFormData({ ...formData, quantity: qty });
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.itemId) {
      alert('Selecione o Cliente e o Modelo para efetuar a reserva.');
      return;
    }

    onSave({
      ...formData,
      id: reservationToEdit ? reservationToEdit.id : `res-${Date.now()}`,
      quantity: Number(formData.quantity) || 1,
      totalPrice: Number(formData.totalPrice) || 0,
      depositPaid: Number(formData.depositPaid) || 0,
      createdAt: reservationToEdit ? reservationToEdit.createdAt : new Date().toISOString().slice(0, 10),
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {reservationToEdit ? 'Editar Reserva de Cliente' : 'Nova Reserva de Pré-Venda'}
          </h3>
          <button onClick={onClose} className="btn btn-icon">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Selecionar Cliente */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Cliente / Colecionador</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="select-field"
                required
              >
                {customers.length === 0 ? (
                  <option value="" style={{ backgroundColor: '#131b2e', color: '#f8fafc' }}>
                    Nenhum cliente cadastrado ainda
                  </option>
                ) : (
                  <>
                    <option value="" style={{ backgroundColor: '#131b2e', color: '#f8fafc' }}>
                      -- Selecione o Cliente --
                    </option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id} style={{ backgroundColor: '#131b2e', color: '#f8fafc' }}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Selecionar Modelo */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Modelo de Miniatura em Pré-Venda</label>
              <select
                value={formData.itemId}
                onChange={(e) => handleItemChange(e.target.value)}
                className="select-field"
                required
              >
                {items.length === 0 ? (
                  <option value="" style={{ backgroundColor: '#131b2e', color: '#f8fafc' }}>
                    Nenhum modelo cadastrado no catálogo
                  </option>
                ) : (
                  <>
                    <option value="" style={{ backgroundColor: '#131b2e', color: '#f8fafc' }}>
                      -- Selecione o Modelo --
                    </option>
                    {items.map((i) => (
                      <option key={i.id} value={i.id} style={{ backgroundColor: '#131b2e', color: '#f8fafc' }}>
                        {i.sku} - {i.name} (Venda: {formatBRL(i.retailPrice)} | Sinal: {formatBRL(i.minDeposit)})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Quantidade */}
            <div className="form-group">
              <label className="form-label">Quantidade de Unidades</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleQtyChange(e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* Status da Reserva */}
            <div className="form-group">
              <label className="form-label">Status da Reserva</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="select-field"
              >
                {Object.entries(RESERVATION_STATUSES).map(([key, st]) => (
                  <option key={key} value={key}>{st.label}</option>
                ))}
              </select>
            </div>

            {/* Preço Total */}
            <div className="form-group">
              <label className="form-label">Valor Total da Reserva (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.totalPrice}
                onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {/* Sinal Pago */}
            <div className="form-group">
              <label className="form-label">Valor do Sinal Recebido (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.depositPaid}
                onChange={(e) => setFormData({ ...formData, depositPaid: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {/* Código de Rastreamento */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Código de Rastreamento (Correios / Envio)</label>
              <input
                type="text"
                placeholder="Ex: AA123456789BR ou NL987654321BR"
                value={formData.trackingCode || ''}
                onChange={(e) => setFormData({ ...formData, trackingCode: e.target.value.toUpperCase() })}
                className="input-field"
              />
            </div>

            {/* Observações */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Observações do Pedido</label>
              <textarea
                rows={2}
                placeholder="Ex: Sinal de R$ 40 pago em 10/07 via PIX. Cliente optou por retirada em mãos."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="textarea-field"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              {reservationToEdit ? 'Salvar Reserva' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
