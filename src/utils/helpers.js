// Utilitários de Formatação e Helpers

export const formatBRL = (val) => {
  const number = Number(val) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
};

export const formatDateBR = (dateString) => {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
};

export const sanitizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

export const buildWhatsAppUrl = (phone, text) => {
  const cleanPhone = sanitizePhone(phone);
  const encodedText = encodeURIComponent(text);
  if (!cleanPhone) {
    return `https://wa.me/?text=${encodedText}`;
  }
  // Adiciona 55 se o DDD do Brasil não foi incluído
  const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
  return `https://wa.me/${fullPhone}?text=${encodedText}`;
};

export const generateWhatsAppMessage = ({ type, customerName, itemName, sku, depositPaid, totalPrice, pixKey, releaseQuarter }) => {
  const balance = totalPrice - depositPaid;

  if (type === 'deposit_reminder') {
    return `Olá ${customerName}! 🚘\n\nConfirmando sua reserva da miniatura em pré-venda:\n📌 *${itemName}* (SKU: ${sku})\n\n💰 Valor Total: ${formatBRL(totalPrice)}\n💵 Sinal Mínimo para Garantia: ${formatBRL(depositPaid > 0 ? depositPaid : 30)}\n\nChave PIX para confirmação: *${pixKey || 'Consulte chave'}*\n\nPor favor, envie o comprovante por aqui assim que efetuar o pagamento. Obrigado!`;
  }

  if (type === 'item_arrived') {
    return `Olá ${customerName}! 🎉 Notícia excelente!\n\nSua miniatura em pré-venda chegou em nosso estoque:\n🏎️ *${itemName}* (SKU: ${sku})\n\n📊 Resumo da Reserva:\n- Valor Total: ${formatBRL(totalPrice)}\n- Sinal Pago: ${formatBRL(depositPaid)}\n- *Saldo Restante A Pagar*: ${formatBRL(balance)}\n\nChave PIX para quitação: *${pixKey || 'Consulte chave'}*\n\nAssim que quitado o saldo, providenciaremos o envio/retirada imediata!`;
  }

  if (type === 'general_status') {
    return `Olá ${customerName}! 📦 Atualização sobre sua pré-venda:\n\nModelo: *${itemName}* (${sku})\nChegada Prevista: *${releaseQuarter || 'Em breve'}*\nStatus da Reserva: Sinal Pago (${formatBRL(depositPaid)} de ${formatBRL(totalPrice)}).\n\nQualquer dúvida estamos à disposição!`;
  }

  return `Olá ${customerName}! Entrando em contato sobre sua pré-venda da miniatura *${itemName}*.`;
};

// Storage Key Constants
const STORAGE_KEYS = {
  ITEMS: 'minis_prevendas_items_v1',
  CUSTOMERS: 'minis_prevendas_customers_v1',
  RESERVATIONS: 'minis_prevendas_reservations_v1',
  SETTINGS: 'minis_prevendas_settings_v1',
};

export const loadState = (key, defaultData) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error(`Erro ao carregar localStorage ${key}:`, err);
  }
  return defaultData;
};

export const saveState = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Erro ao salvar localStorage ${key}:`, err);
  }
};

export { STORAGE_KEYS };
