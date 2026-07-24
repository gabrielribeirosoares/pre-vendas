import React from 'react';
import { Boxes, ShoppingCart, DollarSign, Download, ArrowUpRight } from 'lucide-react';
import { formatBRL } from '../utils/helpers';
import { BRANDS } from '../data/initialData';

export const SupplierOrdersView = ({ items, reservations }) => {
  // Aggregate supplier demand per item
  const supplierReport = items.map((item) => {
    const brand = BRANDS.find((b) => b.id === item.brandId);
    const itemReservations = reservations.filter((r) => r.itemId === item.id);
    const clientUnits = itemReservations.reduce((acc, r) => acc + (Number(r.quantity) || 1), 0);
    const storeBuffer = Number(item.storeBufferUnits) || 0;
    const totalOrderQty = clientUnits + storeBuffer;

    const totalCost = totalOrderQty * (Number(item.wholesaleCost) || 0);
    const totalRevenue = clientUnits * (Number(item.retailPrice) || 0) + storeBuffer * (Number(item.retailPrice) || 0);
    const projectedProfit = totalRevenue - totalCost;

    return {
      item,
      brand,
      clientUnits,
      storeBuffer,
      totalOrderQty,
      totalCost,
      totalRevenue,
      projectedProfit,
    };
  });

  const grandTotalUnits = supplierReport.reduce((acc, r) => acc + r.totalOrderQty, 0);
  const grandTotalCost = supplierReport.reduce((acc, r) => acc + r.totalCost, 0);
  const grandTotalProfit = supplierReport.reduce((acc, r) => acc + r.projectedProfit, 0);

  const handleExportCSV = () => {
    const headers = ['SKU', 'Modelo', 'Marca', 'Previsao', 'Reservas Clientes', 'Estoque Buffer', 'Qtd Total Encomendar', 'Custo Atacado Un', 'Custo Total'];
    const rows = supplierReport.map((r) => [
      `"${r.item.sku}"`,
      `"${r.item.name}"`,
      `"${r.brand ? r.brand.name : ''}"`,
      `"${r.item.releaseQuarter || ''}"`,
      r.clientUnits,
      r.storeBuffer,
      r.totalOrderQty,
      r.item.wholesaleCost || 0,
      r.totalCost,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            Consolidação de Encomendas para Fornecedor
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '4px' }}>
            Soma automática de unidades reservadas pelos clientes + buffer de estoque para pedido ao distribuidor.
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-secondary">
          <Download size={16} />
          Exportar Planilha (CSV)
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total de Unidades a Encomendar
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '8px' }}>
            {grandTotalUnits} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>unidades</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Custo Total de Atacado (Fatura)
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
            {formatBRL(grandTotalCost)}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Lucro Bruto Projetado
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '8px' }}>
            {formatBRL(grandTotalProfit)}
          </div>
        </div>
      </div>

      {/* Supplier Order Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU & Marca</th>
              <th>Modelo Miniatura</th>
              <th>Previsão</th>
              <th>Reservas Clientes</th>
              <th>Buffer Loja</th>
              <th>Qtd Total Pedido</th>
              <th>Custo Un. Atacado</th>
              <th>Custo Total Fatura</th>
              <th>Lucro Projetado</th>
            </tr>
          </thead>
          <tbody>
            {supplierReport.map((row) => (
              <tr key={row.item.id}>
                <td>
                  <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{row.item.sku}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {row.brand?.name}
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: '#ffffff' }}>
                  {row.item.name}
                </td>
                <td style={{ fontSize: '0.8125rem' }}>
                  {row.item.releaseQuarter || '-'}
                </td>
                <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {row.clientUnits} un
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  + {row.storeBuffer} un
                </td>
                <td style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>
                  {row.totalOrderQty} un
                </td>
                <td>
                  {formatBRL(row.item.wholesaleCost || 0)}
                </td>
                <td style={{ fontWeight: 700, color: '#ffffff' }}>
                  {formatBRL(row.totalCost)}
                </td>
                <td style={{ fontWeight: 700, color: 'var(--accent-green)' }}>
                  {formatBRL(row.projectedProfit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
