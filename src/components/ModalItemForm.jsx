import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Upload } from 'lucide-react';
import { BRANDS, ITEM_STATUSES } from '../data/initialData';
import { compressImageFile } from '../utils/helpers';

export const ModalItemForm = ({ isOpen, onClose, onSave, itemToEdit }) => {
  const [formData, setFormData] = useState({
    brandId: 'mini_gt',
    sku: '',
    name: '',
    scale: '1:64',
    retailPrice: '',
    minDeposit: '',
    wholesaleCost: '',
    releaseQuarter: 'Q3 2026',
    status: 'pre_order_open',
    imageUrl: '',
    description: '',
    storeBufferUnits: 3,
  });

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        ...itemToEdit,
        retailPrice: itemToEdit.retailPrice || '',
        minDeposit: itemToEdit.minDeposit || '',
        wholesaleCost: itemToEdit.wholesaleCost || '',
      });
    } else {
      setFormData({
        brandId: 'mini_gt',
        sku: '',
        name: '',
        scale: '1:64',
        retailPrice: '',
        minDeposit: '',
        wholesaleCost: '',
        releaseQuarter: 'Q3 2026',
        status: 'pre_order_open',
        imageUrl: '/images/minigt_r34.png',
        description: '',
        storeBufferUnits: 3,
      });
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      alert('Por favor informe o Nome do Modelo e o SKU.');
      return;
    }

    onSave({
      ...formData,
      id: itemToEdit ? itemToEdit.id : `item-${Date.now()}`,
      retailPrice: Number(formData.retailPrice) || 0,
      minDeposit: Number(formData.minDeposit) || 0,
      wholesaleCost: Number(formData.wholesaleCost) || 0,
      storeBufferUnits: Number(formData.storeBufferUnits) || 0,
      createdAt: itemToEdit ? itemToEdit.createdAt : new Date().toISOString().slice(0, 10),
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {itemToEdit ? 'Editar Modelo Miniatura' : 'Cadastrar Novo Modelo em Pré-Venda'}
          </h3>
          <button onClick={onClose} className="btn btn-icon">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Marca */}
            <div className="form-group">
              <label className="form-label">Fabricante / Marca</label>
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className="select-field"
              >
                {BRANDS.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* SKU */}
            <div className="form-group">
              <label className="form-label">SKU / Código do Fabricante</label>
              <input
                type="text"
                placeholder="Ex: MGT00450-L ou KHMG012"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {/* Nome */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Nome do Modelo e Variação</label>
              <input
                type="text"
                placeholder="Ex: Nissan Skyline GT-R R34 Bayside Blue"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {/* Preço de Venda Final */}
            <div className="form-group">
              <label className="form-label">Preço Final Venda (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 120.00"
                value={formData.retailPrice}
                onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {/* Sinal Mínimo */}
            <div className="form-group">
              <label className="form-label">Sinal Mínimo p/ Reserva (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 30.00"
                value={formData.minDeposit}
                onChange={(e) => setFormData({ ...formData, minDeposit: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {/* Preço de Custo / Atacado */}
            <div className="form-group">
              <label className="form-label">Custo Atacado / Importer (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 75.00"
                value={formData.wholesaleCost}
                onChange={(e) => setFormData({ ...formData, wholesaleCost: e.target.value })}
                className="input-field"
              />
            </div>

            {/* Previsão de Chegada */}
            <div className="form-group">
              <label className="form-label">Previsão de Chegada (Mês/Qtr)</label>
              <input
                type="text"
                placeholder="Ex: Q3 2026 ou Ago/2026"
                value={formData.releaseQuarter}
                onChange={(e) => setFormData({ ...formData, releaseQuarter: e.target.value })}
                className="input-field"
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status da Pré-Venda</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="select-field"
              >
                {Object.entries(ITEM_STATUSES).map(([key, st]) => (
                  <option key={key} value={key}>{st.label}</option>
                ))}
              </select>
            </div>

            {/* Store Buffer Units */}
            <div className="form-group">
              <label className="form-label">Buffer de Estoque da Loja (Qtd)</label>
              <input
                type="number"
                placeholder="Ex: 5"
                value={formData.storeBufferUnits}
                onChange={(e) => setFormData({ ...formData, storeBufferUnits: e.target.value })}
                className="input-field"
              />
            </div>

            {/* Upload & URL da Imagem */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Foto / Imagem do Modelo</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Link HTTP ou digite a URL da imagem..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="input-field"
                  style={{ flex: 1 }}
                />

                <label
                  className="btn btn-secondary"
                  style={{ cursor: 'pointer', whiteSpace: 'nowrap', padding: '0 14px', height: '44px', gap: '6px' }}
                >
                  <Upload size={16} />
                  Enviar Foto
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const base64 = await compressImageFile(file);
                          setFormData((prev) => ({ ...prev, imageUrl: base64 }));
                        } catch (err) {
                          alert('Erro ao carregar a foto.');
                        }
                      }
                    }}
                  />
                </label>
              </div>

              {formData.imageUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pré-visualização da Imagem</span>
                </div>
              )}
            </div>

            {/* Descrição */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Detalhes & Observações do Modelo</label>
              <textarea
                rows={2}
                placeholder="Ex: Edição limitada com base acrílica, detalhes cromados..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {itemToEdit ? 'Salvar Alterações' : 'Cadastrar Modelo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
