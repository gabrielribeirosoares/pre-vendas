import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, AtSign } from 'lucide-react';

export const ModalCustomerForm = ({ isOpen, onClose, onSave, customerToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    instagram: '',
    notes: '',
  });

  useEffect(() => {
    if (customerToEdit) {
      setFormData({ ...customerToEdit });
    } else {
      setFormData({
        name: '',
        phone: '',
        instagram: '',
        notes: '',
      });
    }
  }, [customerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Por favor informe o Nome do Cliente.');
      return;
    }

    onSave({
      ...formData,
      id: customerToEdit ? customerToEdit.id : `cust-${Date.now()}`,
      createdAt: customerToEdit ? customerToEdit.createdAt : new Date().toISOString().slice(0, 10),
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {customerToEdit ? 'Editar Colecionador' : 'Cadastrar Novo Colecionador'}
          </h3>
          <button onClick={onClose} className="btn btn-icon">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Nome */}
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input
                type="text"
                placeholder="Ex: Carlos Eduardo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {/* Telefone / WhatsApp */}
            <div className="form-group">
              <label className="form-label">Telefone / WhatsApp</label>
              <input
                type="text"
                placeholder="Ex: (11) 98877-6655"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {/* Instagram */}
            <div className="form-group">
              <label className="form-label">Perfil Instagram (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: @carlosedu_diecast"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="input-field"
              />
            </div>

            {/* Observações */}
            <div className="form-group">
              <label className="form-label">Notas & Preferências de Frete</label>
              <textarea
                rows={3}
                placeholder="Ex: Prefere envio via Correios SEDEX. Coleciona apenas Nissan e Datsun."
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
              {customerToEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
