/* eslint-disable */
import React from 'react';
import { Sun, Moon, Clock, Coffee } from 'lucide-react';

/**
 * Reconoce y clasifica el turno según el horario y texto:
 * - Formato Partido: Dos franjas de horario separadas por '/' (ej. "10:00-14:00 / 16:00-20:00")
 * - Formato Mañanas: Franja matinal (números más bajos, ej. 09:00, 09:30, 10:00, 11:00)
 * - Formato Tardes: Franja más tardía (números más altos, ej. 14:30, 15:00, 15:30, 16:00, 17:00)
 * - Casos especiales: Day off, Sábado calidad, Vacaciones, Baja, Festivo, Permiso
 */
export function detectTurno(horas, turnoOriginal) {
  const rawH = (horas || '').trim();
  const rawT = (turnoOriginal || '').trim();
  const lowerH = rawH.toLowerCase();
  const lowerT = rawT.toLowerCase();

  // 1. Casos especiales prioritarios
  if (lowerH.includes('sábado calidad') || lowerH.includes('sabado calidad') || lowerT.includes('sábado calidad') || lowerT.includes('sabado calidad')) {
    return 'Sábado calidad';
  }
  if (lowerH.includes('vacaciones') || lowerT.includes('vacaciones')) {
    return 'Vacaciones';
  }
  if (lowerH.includes('baja') || lowerT.includes('baja')) {
    return 'Baja';
  }
  if (lowerH.includes('festivo') || lowerT.includes('festivo')) {
    return 'Festivo';
  }
  if (lowerH.includes('permiso') || lowerT.includes('permiso')) {
    return 'Permiso';
  }
  if (
    rawH === '-' || 
    rawH === '' || 
    lowerH.includes('day off') || 
    lowerH.includes('descanso') || 
    lowerH.includes('libre') ||
    lowerT.includes('day off') || 
    lowerT.includes('descanso') || 
    lowerT.includes('libre')
  ) {
    return 'Day off';
  }

  // 2. Formato partido: dos franjas separadas por '/' o más de 2 horas
  // Ejemplos: "10:00-14:00 / 16:00-20:00", "10:00-14:00/17:00-21:00"
  if (rawH.includes('/') || lowerH.includes('partido') || lowerT.includes('partido')) {
    return 'Partido';
  }

  // 3. Reconocimiento por franjas horarias numéricas (00:00-00:00)
  const timeMatches = rawH.match(/(\d{1,2}):(\d{2})/g);
  if (timeMatches && timeMatches.length >= 1) {
    // Si contiene 3 o más horas (ej: 10:00 14:00 17:00 21:00), es partido
    if (timeMatches.length >= 3) {
      return 'Partido';
    }

    const [startHour, startMin] = timeMatches[0].split(':').map(Number);
    const startDecimal = startHour + (startMin / 60);

    let endDecimal = startDecimal;
    if (timeMatches.length >= 2) {
      const [endHour, endMin] = timeMatches[1].split(':').map(Number);
      endDecimal = endHour + (endMin / 60);
    }

    // Regla de umbral matinal / vespertino:
    // Los turnos matinales inician en números bajos (habitualmente entre 08:00 y 13:30).
    // Los turnos de tarde inician en números más altos (habitualmente a partir de 14:15 - 16:00).
    // En caso de empezar a las 14:00 pero terminar tarde (>= 21:00), es turno de tarde.
    if (startDecimal < 14.15) {
      if (startDecimal >= 13.5 && endDecimal >= 21.0) {
        return 'Tardes';
      }
      return 'Mañanas';
    } else {
      return 'Tardes';
    }
  }

  // 4. Si no tiene números, usar turno original si está definido
  if (lowerT.includes('mañana') || lowerT.includes('manana')) return 'Mañanas';
  if (lowerT.includes('tarde')) return 'Tardes';
  if (lowerT.includes('partido')) return 'Partido';

  return 'Mañanas';
}

/**
 * Determina si una asignación cuenta como turno efectivo de trabajo para cobertura.
 * - Con horario (ej. 09:00-17:00, 10:00-14:00 / 17:00-21:00, 15:00-21:00) => true (hay cobertura)
 * - Day off, Kickoff, Descanso, Vacaciones, Baja, Permiso, libre o sin horario => false (no hay cobertura)
 */
export function hasWorkingShift(horas, turno) {
  if (!horas) return false;
  const h = String(horas).trim().toLowerCase();
  const t = String(turno || '').trim().toLowerCase();

  if (
    h === '' ||
    h === '-' ||
    h.includes('day off') ||
    h.includes('dayoff') ||
    h.includes('descanso') ||
    h.includes('libre') ||
    h.includes('kickoff') ||
    h.includes('kick off') ||
    h.includes('vacaciones') ||
    h.includes('baja') ||
    h.includes('permiso') ||
    h.includes('sin turno') ||
    t.includes('day off') ||
    t.includes('kickoff') ||
    t.includes('vacaciones') ||
    t.includes('baja') ||
    t.includes('permiso')
  ) {
    return false;
  }

  // Comprueba que contenga un formato de horario con dígitos (ej: 09:00 o 15:00-21:00)
  return /\d{1,2}:\d{2}/.test(h);
}

export const shiftConfig = {
  'Mañanas': { 
    label: 'Mañanas',
    icon: <Sun size={15} />, 
    color: '#f97316', 
    bg: 'rgba(249, 115, 22, 0.15)' 
  },
  'Tardes': { 
    label: 'Tardes',
    icon: <Moon size={15} />, 
    color: '#3b82f6', 
    bg: 'rgba(59, 130, 246, 0.15)' 
  },
  'Partido': { 
    label: 'Partido',
    icon: <Clock size={15} />, 
    color: '#a855f7', 
    bg: 'rgba(168, 85, 247, 0.15)' 
  },
  'Day off': { 
    label: 'Day off',
    icon: <Coffee size={15} />, 
    color: '#22c55e', 
    bg: 'rgba(34, 197, 94, 0.15)' 
  },
  'Sábado calidad': { 
    label: 'Sábado calidad',
    icon: <Coffee size={15} />, 
    color: 'var(--accent-primary)', 
    bg: 'var(--accent-light)' 
  },
  'Vacaciones': { 
    label: 'Vacaciones',
    icon: <Sun size={15} />, 
    color: '#7c3aed', 
    bg: 'rgba(124, 58, 237, 0.15)' 
  }
};

export const shiftIconMap = {
  'Mañanas': <Sun size={14} color="#f97316" />,
  'Tardes':  <Moon size={14} color="#3b82f6" />,
  'Partido': <Clock size={14} color="#a855f7" />,
  'Day off': <Coffee size={14} color="#22c55e" />,
  'Sábado calidad': <Coffee size={14} color="var(--accent-primary)" />,
  'Vacaciones': <Sun size={14} color="#7c3aed" />
};

