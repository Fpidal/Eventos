// Funciones utilitarias - Extraídas de App.jsx

// Formatear montos con signo $ y puntos como separador de miles
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '$0';
  return '$' + Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Alias para compatibilidad
export const formatMoney = formatCurrency;

// Formatear números sin signo $ con puntos como separador de miles
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Formatear número con puntos de miles para inputs
export const formatNumberInput = (value) => {
  if (!value && value !== 0) return '';
  const num = String(value).replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Parsear número (quitar puntos) para guardar
export const parseNumberInput = (value) => {
  if (!value) return '';
  return String(value).replace(/\./g, '');
};

// Formatear fecha a formato legible
export const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Formato DD/MM/AAAA
export const formatDateDMY = (dateStr) => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

// Fecha local actual en formato YYYY-MM-DD (para inputs type="date")
export const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
