import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data para exibição
 * @param {Date|string} date - Data a ser formatada
 * @param {string} formatStr - String de formato (padrão: dd/MM/yyyy)
 * @returns {string} Data formatada
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, formatStr, { locale: ptBR });
};

/**
 * Converte minutos em string formatada de horas e minutos
 * @param {number} minutes - Total de minutos
 * @returns {string} Tempo formatado (HH:mm)
 */
export const minutesToTimeString = (minutes) => {
  const hours = Math.floor(Math.abs(minutes) / 60);
  const mins = Math.abs(minutes) % 60;
  const sign = minutes < 0 ? '-' : '';
  
  return `${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Converte string de tempo (HH:mm) para minutos
 * @param {string} timeString - String no formato HH:mm
 * @returns {number} Total de minutos
 */
export const timeStringToMinutes = (timeString) => {
  if (!timeString) return 0;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};
