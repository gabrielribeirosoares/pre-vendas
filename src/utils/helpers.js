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

export const buildTrackingUrl = (code) => {
  if (!code) return '';
  const cleanCode = code.trim().toUpperCase();
  return `https://rastreamento.correios.com.br/app/index.php?codigo=${cleanCode}`;
};

export const compressImageFile = (file, maxWidth = 600, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const generateWhatsAppMessage = ({
  type,
  customerName,
  itemName,
  sku,
  depositPaid,
  totalPrice,
  pixKey,
  releaseQuarter,
  trackingCode,
}) => {
  const balance = Math.max(0, totalPrice - depositPaid);

  if (type === 'deposit_reminder') {
    return `Olá ${customerName}! 🚘\n\nConfirmando sua reserva da miniatura em pré-venda:\n📌 *${itemName}* (SKU: ${sku})\n\n💰 Valor Total: ${formatBRL(totalPrice)}\n💵 Sinal Mínimo para Garantia: ${formatBRL(depositPaid > 0 ? depositPaid : 30)}\n\nChave PIX para confirmação: *${pixKey || 'Consulte chave'}*\n\nPor favor, envie o comprovante por aqui assim que efetuar o pagamento. Obrigado!`;
  }

  if (type === 'item_arrived') {
    return `Olá ${customerName}! 🎉 Notícia excelente!\n\nSua miniatura em pré-venda chegou em nosso estoque:\n🏎️ *${itemName}* (SKU: ${sku})\n\n📊 Resumo da Reserva:\n- Valor Total: ${formatBRL(totalPrice)}\n- Sinal Pago: ${formatBRL(depositPaid)}\n- *Saldo Restante A Pagar*: ${formatBRL(balance)}\n\nChave PIX para quitação: *${pixKey || 'Consulte chave'}*\n\nAssim que quitado o saldo, providenciaremos o envio/retirada imediata!`;
  }

  if (type === 'tracking_info') {
    const trackingLink = buildTrackingUrl(trackingCode);
    return `Olá ${customerName}! 📦 Seu pedido foi enviado!\n\nModelo: *${itemName}* (${sku})\nCódigo de Rastreamento: *${trackingCode || 'Solicitar via chat'}*\n\nAcompanhe seu envio aqui:\n${trackingLink || 'Rastreie pelo site dos Correios'}\n\nQualquer dúvida estamos à disposição!`;
  }

  if (type === 'general_status') {
    let msg = `Olá ${customerName}! 📦 Atualização sobre sua pré-venda:\n\nModelo: *${itemName}* (${sku})\nChegada Prevista: *${releaseQuarter || 'Em breve'}*\nStatus da Reserva: Sinal Pago (${formatBRL(depositPaid)} de ${formatBRL(totalPrice)}).`;
    if (trackingCode) {
      msg += `\nRastreio: ${trackingCode}`;
    }
    msg += `\n\nQualquer dúvida estamos à disposição!`;
    return msg;
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
