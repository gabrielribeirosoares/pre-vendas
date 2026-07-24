import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Car, Calendar, DollarSign, Filter, Layers, MessageCircle, Search } from 'lucide-react';
import { formatBRL } from '../utils/helpers';
import { BRANDS, ITEM_STATUSES } from '../data/initialData';
import { ModalBatchWhatsApp } from './ModalBatchWhatsApp';

export const CatalogView = ({
  items,
  reservations,
  customers = [],
  settings,
  searchQuery: externalSearchQuery,
  onEditItem,
  onDeleteItem,
  onNewReservationForItem,
  onNewItem,
}) => {
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [localSearch, setLocalSearch] = useState('');
  const [batchWhatsAppItem, setBatchWhatsAppItem] = useState(null);

  const activeSearch = localSearch || externalSearchQuery || '';

  // Filter Items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !activeSearch ||
      item.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
      item.sku.toLowerCase().includes(activeSearch.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(activeSearch.toLowerCase()));

    const matchesBrand = selectedBrand === 'all' || item.brandId === selectedBrand;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesBrand && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Catálogo de Pré-Vendas
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '4px' }}>
            Modelos anunciados pelos fabricantes (Kaido House, Mini GT, Pop Race, etc.).
          </p>
        </div>

        <button onClick={onNewItem} className="btn btn-primary">
          <Plus size={18} />
          Cadastrar Novo Modelo
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
          <Filter size={16} />
          <span>Filtros:</span>
        </div>

        {/* Brand Filter */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="select-field"
          style={{ width: 'auto', minWidth: '180px', height: '38px', fontSize: '0.875rem' }}
        >
          <option value="all">Todas as Marcas ({items.length})</option>
          {BRANDS.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="select-field"
          style={{ width: 'auto', minWidth: '180px', height: '38px', fontSize: '0.875rem' }}
        >
          <option value="all">Todos os Status</option>
          {Object.entries(ITEM_STATUSES).map(([key, st]) => (
            <option key={key} value={key}>{st.label}</option>
          ))}
        </select>

        {/* Search Input inside Section Filter Bar */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Buscar por modelo, fabricante ou SKU..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.84rem' }}
          />
        </div>
      </div>

      {/* Grid of Items */}
      {filteredItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Car size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>Nenhum modelo encontrado</h3>
          <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>Tente alterar os filtros ou cadastrar uma nova miniatura.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {filteredItems.map((item) => {
            const brand = BRANDS.find((b) => b.id === item.brandId) || BRANDS[BRANDS.length - 1];
            const statusConfig = ITEM_STATUSES[item.status] || ITEM_STATUSES.pre_order_open;

            // Total reserved units for this item
            const itemReservations = reservations.filter((r) => r.itemId === item.id);
            const totalReservedUnits = itemReservations.reduce((acc, r) => acc + (Number(r.quantity) || 1), 0);

            return (
              <div
                key={item.id}
                className="glass-card glass-card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Image & Badges Overlay */}
                <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: '#090d16' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  {/* Brand Tag Top Left */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(9, 13, 22, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${brand.color}`,
                    color: brand.color,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                  }}>
                    {brand.name}
                  </div>

                  {/* Status Badge Top Right */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                  }}>
                    <span className="badge" style={{ color: statusConfig.color, backgroundColor: 'rgba(9, 13, 22, 0.9)' }}>
                      <span className="badge-dot" />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
                      SKU: <span style={{ color: 'var(--accent-cyan)' }}>{item.sku}</span> • Escala {item.scale || '1:64'}
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.3 }}>
                      {item.name}
                    </h3>

                    {item.description && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '8px', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Pricing & Quarter Details */}
                  <div style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                  }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>PREÇO FINAL</span>
                      <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {formatBRL(item.retailPrice)}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>SINAL MÍNIMO</span>
                      <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {formatBRL(item.minDeposit)}
                      </span>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} color="var(--accent-orange)" />
                        Chegada: <strong style={{ color: 'var(--text-primary)' }}>{item.releaseQuarter || 'Em breve'}</strong>
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                        {totalReservedUnits} reservadas
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => onNewReservationForItem(item)}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '10px 14px', fontSize: '0.84rem' }}
                    >
                      <Plus size={16} /> Nova Reserva
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {itemReservations.length > 0 && (
                        <button
                          onClick={() => setBatchWhatsAppItem(item)}
                          className="btn btn-whatsapp"
                          style={{ flex: 1, padding: '8px 10px', fontSize: '0.8125rem' }}
                          title="Notificar Chegada aos Colecionadores no WhatsApp"
                        >
                          <MessageCircle size={16} /> Notificar ({itemReservations.length})
                        </button>
                      )}

                      <button
                        onClick={() => onEditItem(item)}
                        className="btn btn-icon"
                        title="Editar Modelo"
                        style={{ flex: itemReservations.length > 0 ? '0 0 auto' : 1, padding: '8px 12px' }}
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="btn btn-icon"
                        title="Excluir Modelo"
                        style={{ color: '#ef4444', flex: itemReservations.length > 0 ? '0 0 auto' : 1, padding: '8px 12px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Batch WhatsApp Modal */}
      {batchWhatsAppItem && (
        <ModalBatchWhatsApp
          isOpen={!!batchWhatsAppItem}
          onClose={() => setBatchWhatsAppItem(null)}
          item={batchWhatsAppItem}
          reservations={reservations}
          customers={customers}
          settings={settings}
        />
      )}
    </div>
  );
};
