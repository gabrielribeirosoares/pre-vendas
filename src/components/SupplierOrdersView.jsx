import React, { useState, useMemo } from 'react';
import {
  Boxes,
  ShoppingCart,
  Download,
  Filter,
  Search,
  Copy,
  Check,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { formatBRL } from '../utils/helpers';
import { BRANDS, ITEM_STATUSES } from '../data/initialData';

export const SupplierOrdersView = ({ items = [], reservations = [], onSaveItem }) => {
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedOrderText, setCopiedOrderText] = useState(false);

  // Calculate aggregated supplier report per item
  const supplierReport = useMemo(() => {
    return items.map((item) => {
      const brand = BRANDS.find((b) => b.id === item.brandId);
      const itemReservations = reservations.filter((r) => r.itemId === item.id);
      const clientUnits = itemReservations.reduce((acc, r) => acc + (Number(r.quantity) || 1), 0);
      const storeBuffer = Number(item.storeBufferUnits) || 0;
      const totalOrderQty = clientUnits + storeBuffer;

      const wholesaleCost = Number(item.wholesaleCost) || 0;
      const retailPrice = Number(item.retailPrice) || 0;

      const totalCost = totalOrderQty * wholesaleCost;
      const totalRevenue = totalOrderQty * retailPrice;
      const projectedProfit = totalRevenue - totalCost;
      const profitMarginPct = totalCost > 0 ? (projectedProfit / totalCost) * 100 : 0;

      return {
        item,
        brand,
        clientUnits,
        storeBuffer,
        totalOrderQty,
        wholesaleCost,
        retailPrice,
        totalCost,
        totalRevenue,
        projectedProfit,
        profitMarginPct,
      };
    });
  }, [items, reservations]);

  // Filtered Items for Display
  const filteredReport = useMemo(() => {
    return supplierReport.filter((row) => {
      const matchBrand = selectedBrand === 'all' || row.item.brandId === selectedBrand;
      const matchStatus = selectedStatus === 'all' || row.item.status === selectedStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        row.item.name?.toLowerCase().includes(q) ||
        row.item.sku?.toLowerCase().includes(q) ||
        row.brand?.name?.toLowerCase().includes(q);

      return matchBrand && matchStatus && matchSearch;
    });
  }, [supplierReport, selectedBrand, selectedStatus, searchQuery]);

  // Totals calculations
  const grandTotalClientUnits = filteredReport.reduce((acc, r) => acc + r.clientUnits, 0);
  const grandTotalBufferUnits = filteredReport.reduce((acc, r) => acc + r.storeBuffer, 0);
  const grandTotalUnits = filteredReport.reduce((acc, r) => acc + r.totalOrderQty, 0);
  const grandTotalCost = filteredReport.reduce((acc, r) => acc + r.totalCost, 0);
  const grandTotalRevenue = filteredReport.reduce((acc, r) => acc + r.totalRevenue, 0);
  const grandTotalProfit = filteredReport.reduce((acc, r) => acc + r.projectedProfit, 0);

  // Handle Buffer Quantity Direct Edit
  const handleBufferChange = (item, newBuffer) => {
    const qty = Math.max(0, parseInt(newBuffer, 10) || 0);
    if (onSaveItem) {
      onSaveItem({
        ...item,
        storeBufferUnits: qty,
      });
    }
  };

  // Handle Wholesale Cost Direct Edit
  const handleWholesaleCostChange = (item, newCost) => {
    const cost = Math.max(0, parseFloat(newCost) || 0);
    if (onSaveItem) {
      onSaveItem({
        ...item,
        wholesaleCost: cost,
      });
    }
  };

  // Handle Retail Price Direct Edit
  const handleRetailPriceChange = (item, newPrice) => {
    const price = Math.max(0, parseFloat(newPrice) || 0);
    if (onSaveItem) {
      onSaveItem({
        ...item,
        retailPrice: price,
      });
    }
  };

  // Copy Order List formatted for WhatsApp / Email
  const handleCopyOrderList = () => {
    let text = `📦 *PEDIDO DE ATACADO - FORNECEDOR*\n`;
    text += `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    text += `------------------------------------\n\n`;

    filteredReport.forEach((r, idx) => {
      text += `${idx + 1}. *[${r.item.sku}]* ${r.item.name}\n`;
      text += `   • Marca: ${r.brand?.name || 'Mini GT'}\n`;
      text += `   • Qtd Total: *${r.totalOrderQty} un* (${r.clientUnits} reservas + ${r.storeBuffer} estoque)\n`;
      text += `   • Custo Atacado: R$ ${r.wholesaleCost.toFixed(2)} | Venda: R$ ${r.retailPrice.toFixed(2)}\n`;
      text += `   • Previsão: ${r.item.releaseQuarter || 'Q3 2026'}\n\n`;
    });

    text += `------------------------------------\n`;
    text += `📊 *TOTAL DE UNIDADES:* ${grandTotalUnits} un\n`;
    text += `💰 *VALOR ESTIMADO FATURA:* ${formatBRL(grandTotalCost)}\n`;

    navigator.clipboard.writeText(text);
    setCopiedOrderText(true);
    setTimeout(() => setCopiedOrderText(false), 2500);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'SKU',
      'Modelo',
      'Marca',
      'Status',
      'Previsao',
      'Reservas Clientes',
      'Buffer Estoque Loja',
      'Qtd Total Pedido',
      'Custo Un Atacado',
      'Preco Venda Un',
      'Custo Total Fatura',
      'Faturamento Total',
      'Lucro Projetado',
    ];

    const rows = filteredReport.map((r) => [
      `"${r.item.sku}"`,
      `"${r.item.name}"`,
      `"${r.brand ? r.brand.name : ''}"`,
      `"${ITEM_STATUSES[r.item.status]?.label || r.item.status}"`,
      `"${r.item.releaseQuarter || ''}"`,
      r.clientUnits,
      r.storeBuffer,
      r.totalOrderQty,
      r.wholesaleCost,
      r.retailPrice,
      r.totalCost,
      r.totalRevenue,
      r.projectedProfit,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pedido_fornecedor_diecast_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Consolidação de Encomendas para Fornecedor
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '4px' }}>
            Ajuste em tempo real os preços de custo, venda e estoque da loja para calcular lucros e pedidos.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleCopyOrderList} className="btn btn-secondary" style={{ gap: '6px' }}>
            {copiedOrderText ? <Check size={16} color="var(--accent-green)" /> : <Copy size={16} />}
            {copiedOrderText ? 'Copiado!' : 'Copiar Texto WhatsApp'}
          </button>

          <button onClick={handleExportCSV} className="btn btn-primary" style={{ gap: '6px' }}>
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Qtd Total Pedido
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent-cyan)' }}>
              <Boxes size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '6px' }}>
            {grandTotalUnits} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>un</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {grandTotalClientUnits} clientes + {grandTotalBufferUnits} estoque
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Custo Total Fatura
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(249, 115, 22, 0.12)', color: 'var(--accent-orange)' }}>
              <ShoppingCart size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
            {formatBRL(grandTotalCost)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Custo total com distribuidor
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Faturamento Estimado
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.12)', color: 'var(--accent-purple)' }}>
              <Layers size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
            {formatBRL(grandTotalRevenue)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', marginTop: '2px', fontWeight: 600 }}>
            Vendas varejo total
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Lucro Projetado
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-green)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '6px' }}>
            {formatBRL(grandTotalProfit)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)', marginTop: '2px', fontWeight: 600 }}>
            {grandTotalCost > 0 ? `+${((grandTotalProfit / grandTotalCost) * 100).toFixed(0)}% margem` : '0%'}
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar modelo ou SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '32px', height: '36px', fontSize: '0.8125rem' }}
          />
        </div>

        {/* Filter Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={15} color="var(--text-muted)" />
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="select-field"
            style={{ height: '36px', fontSize: '0.8125rem', minWidth: '140px' }}
          >
            <option value="all">Todas as Marcas</option>
            {BRANDS.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="select-field"
            style={{ height: '36px', fontSize: '0.8125rem', minWidth: '150px' }}
          >
            <option value="all">Todos os Status</option>
            {Object.entries(ITEM_STATUSES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Supplier Order Table (Compact Layout without Horizontal Scrollbar) */}
      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ width: '100%', minWidth: '100%', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px 12px', fontSize: '0.72rem' }}>Modelo Miniatura</th>
              <th style={{ padding: '10px 10px', fontSize: '0.72rem', width: '85px' }}>Previsão</th>
              <th style={{ padding: '10px 8px', fontSize: '0.72rem', textAlign: 'center', width: '110px' }}>Reservas</th>
              <th style={{ padding: '10px 8px', fontSize: '0.72rem', textAlign: 'center', width: '130px' }}>Estoque Loja (Buffer)</th>
              <th style={{ padding: '10px 8px', fontSize: '0.72rem', textAlign: 'center', width: '100px' }}>Qtd Total</th>
              <th style={{ padding: '10px 8px', fontSize: '0.72rem', textAlign: 'right', width: '105px' }}>Custo Un. (Atacado)</th>
              <th style={{ padding: '10px 8px', fontSize: '0.72rem', textAlign: 'right', width: '105px' }}>Preço Venda (Varejo)</th>
              <th style={{ padding: '10px 10px', fontSize: '0.72rem', textAlign: 'right', width: '120px' }}>Custo Fatura</th>
              <th style={{ padding: '10px 12px', fontSize: '0.72rem', textAlign: 'right', width: '125px' }}>Lucro Projetado</th>
            </tr>
          </thead>
          <tbody>
            {filteredReport.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                  Nenhum modelo encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredReport.map((row) => {
                const statusBadge = ITEM_STATUSES[row.item.status] || ITEM_STATUSES.pre_order_open;
                return (
                  <tr key={row.item.id}>
                    {/* Model Name & SKU */}
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25, fontSize: '0.85rem' }}>
                        {row.item.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          {row.item.sku}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: row.brand?.color || '#3b82f6' }} />
                          {row.brand?.name || 'Mini GT'}
                        </span>
                        <span className="badge" style={{ color: statusBadge.color, backgroundColor: statusBadge.bg, fontSize: '0.62rem', padding: '1px 6px' }}>
                          {statusBadge.label}
                        </span>
                      </div>
                    </td>

                    {/* Release Quarter */}
                    <td style={{ padding: '10px 10px', fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {row.item.releaseQuarter || '-'}
                    </td>

                    {/* Client Reservations */}
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700 }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.8rem',
                      }}>
                        {row.clientUnits} un
                      </span>
                    </td>

                    {/* Editable Store Buffer */}
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>+</span>
                        <input
                          type="number"
                          min="0"
                          value={row.storeBuffer}
                          onChange={(e) => handleBufferChange(row.item, e.target.value)}
                          className="input-field"
                          style={{
                            width: '46px',
                            height: '30px',
                            padding: '2px 4px',
                            textAlign: 'center',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                          }}
                          title="Quantidade de reserva para estoque da loja"
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>un</span>
                      </div>
                    </td>

                    {/* Total Order Quantity */}
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                      }}>
                        {row.totalOrderQty} un
                      </span>
                    </td>

                    {/* Editable Wholesale Unit Cost */}
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.wholesaleCost}
                          onChange={(e) => handleWholesaleCostChange(row.item, e.target.value)}
                          className="input-field"
                          style={{
                            width: '68px',
                            height: '30px',
                            padding: '2px 4px',
                            textAlign: 'right',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                          }}
                          title="Custo Unitário de Atacado"
                        />
                      </div>
                    </td>

                    {/* Editable Retail Sale Price */}
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.retailPrice}
                          onChange={(e) => handleRetailPriceChange(row.item, e.target.value)}
                          className="input-field"
                          style={{
                            width: '68px',
                            height: '30px',
                            padding: '2px 4px',
                            textAlign: 'right',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            color: 'var(--accent-cyan)',
                          }}
                          title="Preço de Venda Varejo"
                        />
                      </div>
                    </td>

                    {/* Total Invoice Cost */}
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {formatBRL(row.totalCost)}
                    </td>

                    {/* Projected Profit */}
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-green)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {formatBRL(row.projectedProfit)}
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {row.profitMarginPct.toFixed(0)}% margem
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {filteredReport.length > 0 && (
            <tfoot>
              <tr style={{ background: 'var(--table-header-bg)', fontWeight: 800 }}>
                <td colSpan="2" style={{ padding: '10px 12px', color: 'var(--text-primary)', fontSize: '0.8125rem' }}>
                  TOTAL GERAL ({filteredReport.length} modelos)
                </td>
                <td style={{ textAlign: 'center', color: 'var(--accent-cyan)', fontSize: '0.8125rem' }}>
                  {grandTotalClientUnits} un
                </td>
                <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                  {grandTotalBufferUnits} un
                </td>
                <td style={{ textAlign: 'center', color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
                  {grandTotalUnits} un
                </td>
                <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>-</td>
                <td style={{ textAlign: 'right', color: 'var(--accent-cyan)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                  {formatBRL(grandTotalRevenue)} (venda)
                </td>
                <td style={{ textAlign: 'right', color: 'var(--text-primary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  {formatBRL(grandTotalCost)}
                </td>
                <td style={{ textAlign: 'right', color: 'var(--accent-green)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  {formatBRL(grandTotalProfit)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
