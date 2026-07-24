import React, { useState } from 'react';
import { Save, Download, Upload, RefreshCw, Key, Store, Check } from 'lucide-react';

export const SettingsBackupView = ({
  settings,
  onSaveSettings,
  onExportData,
  onImportData,
  onResetDemoData,
}) => {
  const [pixKey, setPixKey] = useState(settings.pixKey || '');
  const [storeName, setStoreName] = useState(settings.storeName || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      pixKey,
      storeName,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          onImportData(parsed);
        } catch (err) {
          alert('Erro ao carregar o arquivo JSON. Certifique-se de que é um backup válido.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
          Configurações & Backup de Dados
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '4px' }}>
          Defina sua chave PIX para envio automático aos clientes e gerencie backups do sistema.
        </p>
      </div>

      {/* Store & PIX Form */}
      <form onSubmit={handleSave} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
          Dados da Loja & Pagamentos
        </h3>

        <div className="form-group">
          <label className="form-label">Nome da Loja / Perfil</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="input-field"
              placeholder="Ex: Diecast Garage Pré-Vendas"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Chave PIX (Para mensagens automáticas do WhatsApp)</label>
          <input
            type="text"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            className="input-field"
            placeholder="Ex: pix@minhaloja.com.br ou (11) 99999-8888"
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Essa chave será incluída automaticamente quando você clicar em "Enviar Cobrança WhatsApp".
          </span>
        </div>

        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', gap: '8px' }}>
          {savedSuccess ? <Check size={18} /> : <Save size={18} />}
          {savedSuccess ? 'Configurações Salvas!' : 'Salvar Alterações'}
        </button>
      </form>

      {/* Backup & Import */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
          Backup & Exportação
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Todos os dados (modelos, clientes e reservas) são mantidos com segurança no navegador. Faça um arquivo de backup para segurança extra.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button onClick={onExportData} className="btn btn-secondary">
            <Download size={18} />
            Baixar Backup em JSON
          </button>

          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={18} />
            Restaurar Backup JSON
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Danger Zone: Reset Demo Data */}
      <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.04)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fca5a5' }}>
          Recarregar Dados de Demonstração
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Deseja restaurar os modelos de teste iniciais (Kaido House Datsun 510, Mini GT R34, Pop Race Singer DLS)?
        </p>

        <button
          onClick={() => {
            if (window.confirm('Tem certeza que deseja restaurar os dados de exemplo? Suas alterações locais serão redefinidas.')) {
              onResetDemoData();
            }
          }}
          className="btn btn-danger"
          style={{ marginTop: '14px' }}
        >
          <RefreshCw size={16} /> Restaurar Exemplo Inicial
        </button>
      </div>
    </div>
  );
};
