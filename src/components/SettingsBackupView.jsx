import React, { useState } from 'react';
import {
  Save,
  Download,
  Upload,
  RefreshCw,
  Store,
  Check,
  Palette,
  Image as ImageIcon,
  Globe,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'Cyber Neon', primary: '#38bdf8', secondary: '#a855f7', labelBg: 'linear-gradient(135deg, #38bdf8, #a855f7)' },
  { name: 'Kaido Orange', primary: '#f97316', secondary: '#eab308', labelBg: 'linear-gradient(135deg, #f97316, #eab308)' },
  { name: 'Racing Red', primary: '#ef4444', secondary: '#38bdf8', labelBg: 'linear-gradient(135deg, #ef4444, #38bdf8)' },
  { name: 'Emerald Luxury', primary: '#10b981', secondary: '#a855f7', labelBg: 'linear-gradient(135deg, #10b981, #a855f7)' },
  { name: 'Royal Violet', primary: '#a855f7', secondary: '#ec4899', labelBg: 'linear-gradient(135deg, #a855f7, #ec4899)' },
  { name: 'HotWheels Gold', primary: '#eab308', secondary: '#f97316', labelBg: 'linear-gradient(135deg, #eab308, #f97316)' },
];

export const SettingsBackupView = ({
  settings,
  onSaveSettings,
  onExportData,
  onImportData,
  onResetDemoData,
}) => {
  const [storeName, setStoreName] = useState(settings.storeName || '');
  const [pixKey, setPixKey] = useState(settings.pixKey || '');
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || '#38bdf8');
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor || '#a855f7');
  const [themeMode, setThemeMode] = useState(settings.themeMode || 'dark');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e?.preventDefault();
    onSaveSettings({
      ...settings,
      storeName,
      pixKey,
      primaryColor,
      secondaryColor,
      themeMode,
      logoUrl,
      faviconUrl,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSelectPreset = (preset) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
  };

  // Image Upload Handler (resizes & compresses to lightweight data URL)
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 200; // 200px max dimension for fast icon
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL('image/png', 0.85);
          setLogoUrl(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFaviconUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackupFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          onImportData(parsed);
        } catch {
          alert('Erro ao carregar o arquivo JSON. Certifique-se de que é um backup válido.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
          Personalização & Configurações da Loja
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '4px' }}>
          Personalize as cores, logotipo, favicon e dados bancários da sua loja de pré-vendas.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* SECTION 1: IDENTIDADE DA LOJA */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Store size={22} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
              Identidade Visual & Nome da Loja
            </h3>
          </div>

          <div className="form-group">
            <label className="form-label">Nome da Loja</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="input-field"
              placeholder="Ex: Diecast Garage Pré-Vendas"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Aparece no topo do menu lateral, no cabeçalho e na aba do navegador.
            </span>
          </div>

          {/* LOGO DO PROJETO */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ImageIcon size={16} /> Logo da Loja (Ícone Principal)
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="input-field"
                placeholder="https://exemplo.com/logo.png ou carregue do PC"
              />
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px', cursor: 'pointer' }}>
                  <Upload size={14} /> Carregar Imagem
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Remover Logo
                  </button>
                )}
              </div>
            </div>

            {/* PREVIEW DO LOGO */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Preview Logo"
                  style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                />
              ) : (
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 16px ${primaryColor}40`,
                }}>
                  <Sparkles size={24} color="#ffffff" />
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pré-visualização do Ícone</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                  {storeName || 'Sua Loja'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PALETA DE CORES / TEMAS DA LOJA */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Palette size={22} color={primaryColor} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Cores & Tema da Loja
            </h3>
          </div>
          {/* Modo do Tema (Claro / Escuro) */}
          <div>
            <label className="form-label" style={{ marginBottom: '10px' }}>Modo do Tema</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className="btn"
                style={{
                  flex: 1,
                  background: themeMode === 'dark' ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  border: themeMode === 'dark' ? 'none' : '1px solid var(--border-color)',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 600,
                }}
              >
                <Moon size={18} /> Modo Escuro (Dark)
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className="btn"
                style={{
                  flex: 1,
                  background: themeMode === 'light' ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  border: themeMode === 'light' ? 'none' : '1px solid var(--border-color)',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 600,
                }}
              >
                <Sun size={18} /> Modo Claro (Light)
              </button>
            </div>
          </div>

          <div>
            <label className="form-label" style={{ marginBottom: '10px' }}>Temas Prontos (Clique para aplicar)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
              {COLOR_PRESETS.map((preset) => {
                const isSelected = primaryColor === preset.primary && secondaryColor === preset.secondary;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: isSelected ? `2px solid ${preset.primary}` : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '24px',
                      borderRadius: '6px',
                      background: preset.labelBg,
                    }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isSelected ? preset.primary : 'var(--text-primary)' }}>
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '6px' }}>
            <div className="form-group">
              <label className="form-label">Cor Principal (Destaques, Botões e Bordas)</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{ width: '42px', height: '42px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="input-field"
                  placeholder="#38bdf8"
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Cor Secundária (Gradientes e Badges)</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  style={{ width: '42px', height: '42px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="input-field"
                  placeholder="#a855f7"
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: PAGAMENTOS & PIX */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
            Dados de Pagamento & WhatsApp
          </h3>

          <div className="form-group">
            <label className="form-label">Chave PIX (Para mensagens de cobrança no WhatsApp)</label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="input-field"
              placeholder="Ex: pix@minhaloja.com.br ou (11) 99999-8888"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Esta chave é inserida automaticamente nas mensagens geradas para os clientes.
            </span>
          </div>
        </div>

        {/* BOTÃO SALVAR */}
        <button
          type="submit"
          className="btn btn-primary"
          style={{
            alignSelf: 'flex-start',
            gap: '8px',
            padding: '12px 24px',
            fontSize: '0.95rem',
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            border: 'none',
          }}
        >
          {savedSuccess ? <Check size={20} /> : <Save size={20} />}
          {savedSuccess ? 'Configurações Salvas com Sucesso!' : 'Salvar Alterações da Loja'}
        </button>
      </form>

      {/* SECTION 4: BACKUP & EXPORTAÇÃO */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
          Backup & Segurança de Dados
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Faça um backup em arquivo JSON com todos os seus modelos, reservas, clientes e configurações.
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
              onChange={handleBackupFileChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.04)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fca5a5' }}>
          Recarregar Dados de Demonstração
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Restaura os modelos de exemplo iniciais no sistema.
        </p>

        <button
          type="button"
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
