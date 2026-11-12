/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Cobertura.module.css';
import { 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Store, 
  Users, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { hasWorkingShift } from '../../utils/turnoUtils';

const GAS_URL = import.meta.env.VITE_GAS_URL;

export default function Cobertura() {
  const { user } = useAuth();

  // Estados de datos
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [monthData, setMonthData] = useState([]); // Array de promotores con sus semanas combinadas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filtroRegion, setFiltroRegion] = useState('todas');
  const [filtroTienda, setFiltroTienda] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  // Día seleccionado para desglose
  const [selectedDateIso, setSelectedDateIso] = useState('');
  const [filtroEstadoDetalle, setFiltroEstadoDetalle] = useState('todos'); // 'todos', 'cubierto', 'sin_cobertura'

  const todayIso = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // 1. Cargar meses disponibles
  useEffect(() => {
    const fetchMonths = async () => {
      if (!GAS_URL) {
        setError('No se ha configurado la URL del backend');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const roleToSend = user.role === 'administradora' ? 'project' : user.role;
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getAvailableMonths', role: roleToSend, name: user.name })
        });
        const data = await res.json();
        if (data.success && data.meses && data.meses.length > 0) {
          setMesesDisponibles(data.meses);

          // Buscar mes actual
          const todayDate = new Date();
          const mesesNombres = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ];
          const currentMonthStr = `${mesesNombres[todayDate.getMonth()]} ${todayDate.getFullYear()}`;
          const foundMonth = data.meses.find(m => m.mes.toLowerCase() === currentMonthStr.toLowerCase()) || data.meses[0];
          setSelectedMonth(foundMonth.mes);
        } else {
          setError('No hay meses planificados disponibles');
        }
      } catch (err) {
        setError(err.message || 'Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };
    fetchMonths();
  }, [user]);

  // 2. Cargar todas las semanas del mes seleccionado
  useEffect(() => {
    const fetchMonthCoverage = async () => {
      if (!GAS_URL || !selectedMonth) return;
      const targetMonthObj = mesesDisponibles.find(m => m.mes === selectedMonth);
      if (!targetMonthObj || !targetMonthObj.semanas || targetMonthObj.semanas.length === 0) return;

      setLoading(true);
      setError(null);
      try {
        const roleToSend = user.role === 'administradora' ? 'project' : user.role;
        
        // Consultar en paralelo todas las semanas del mes
        const weeklyPromises = targetMonthObj.semanas.map(weekNum =>
          fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify({
              action: 'getEquipoWeekly',
              month: selectedMonth,
              weekNum: weekNum.toString(),
              role: roleToSend,
              name: user.name
            })
          }).then(r => r.json())
        );

        const weeklyResults = await Promise.all(weeklyPromises);

        // Combinar datos por promotor
        const promotoresMap = {};
        for (const res of weeklyResults) {
          if (res.success && Array.isArray(res.equipo)) {
            for (const p of res.equipo) {
              if (!promotoresMap[p.name]) {
                promotoresMap[p.name] = {
                  name: p.name,
                  centro: p.centro || 'Sin asignar',
                  region: p.region || 'Sin asignar',
                  diasMap: {}
                };
              }
              if (Array.isArray(p.semana)) {
                for (const d of p.semana) {
                  if (d.fecha) {
                    promotoresMap[p.name].diasMap[d.fecha] = {
                      fecha: d.fecha,
                      horas: d.horas || '-',
                      turno: d.turno || d.iconTurno || '',
                      isWorking: hasWorkingShift(d.horas, d.turno || d.iconTurno)
                    };
                  }
                }
              }
            }
          }
        }

        const promotoresArray = Object.values(promotoresMap);
        setMonthData(promotoresArray);

        // Establecer fecha por defecto para desglose (hoy o primera fecha del mes)
        const allDates = new Set();
        for (const p of promotoresArray) {
          Object.keys(p.diasMap).forEach(dt => allDates.add(dt));
        }
        const sortedDates = Array.from(allDates).sort();
        if (sortedDates.includes(todayIso)) {
          setSelectedDateIso(todayIso);
        } else if (sortedDates.length > 0) {
          setSelectedDateIso(sortedDates[0]);
        }
      } catch (err) {
        setError('Error al procesar la cobertura del mes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthCoverage();
  }, [selectedMonth, mesesDisponibles, user]);

  // Lista de regiones y tiendas disponibles según el rol
  const regionesDisponibles = useMemo(() => {
    const setR = new Set(monthData.map(p => p.region).filter(Boolean));
    return Array.from(setR).sort();
  }, [monthData]);

  const tiendasDisponibles = useMemo(() => {
    const filteredByRegion = filtroRegion === 'todas'
      ? monthData
      : monthData.filter(p => p.region === filtroRegion);
    const setT = new Set(filteredByRegion.map(p => p.centro).filter(c => c && c !== 'Sin asignar'));
    return Array.from(setT).sort();
  }, [monthData, filtroRegion]);

  // Datos filtrados por región y tienda
  const promotoresFiltrados = useMemo(() => {
    return monthData.filter(p => {
      if (filtroRegion !== 'todas' && p.region !== filtroRegion) return false;
      if (filtroTienda !== 'todas' && p.centro !== filtroTienda) return false;
      return true;
    });
  }, [monthData, filtroRegion, filtroTienda]);

  // Centros únicos en alcance
  const centrosUnicos = useMemo(() => {
    const cMap = {};
    for (const p of promotoresFiltrados) {
      if (!p.centro || p.centro === 'Sin asignar') continue;
      if (!cMap[p.centro]) {
        cMap[p.centro] = {
          centro: p.centro,
          region: p.region,
          promotores: []
        };
      }
      cMap[p.centro].promotores.push(p);
    }
    return Object.values(cMap).sort((a, b) => a.centro.localeCompare(b.centro));
  }, [promotoresFiltrados]);

  // Colección de todos los días del mes y su cálculo de cobertura
  const dailyCoverageMap = useMemo(() => {
    const datesSet = new Set();
    for (const p of monthData) {
      Object.keys(p.diasMap).forEach(dt => datesSet.add(dt));
    }
    const dates = Array.from(datesSet).sort();

    const map = {};
    for (const dt of dates) {
      let cubiertos = 0;
      const centrosDetalle = [];

      for (const c of centrosUnicos) {
        const promosEnCentro = [];
        for (const p of c.promotores) {
          const shift = p.diasMap[dt];
          const isWorking = shift ? shift.isWorking : false;
          promosEnCentro.push({
            name: p.name,
            horas: shift ? shift.horas : '-',
            turno: shift ? shift.turno : '',
            isWorking
          });
        }
        // Un centro tiene cobertura si AL MENOS UNO de sus promotores asignados tiene horario
        const isCovered = promosEnCentro.some(pr => pr.isWorking);
        if (isCovered) cubiertos++;

        centrosDetalle.push({
          centro: c.centro,
          region: c.region,
          isCovered,
          promotores: promosEnCentro
        });
      }

      const total = centrosUnicos.length;
      const pct = total > 0 ? Math.round((cubiertos / total) * 100) : 0;

      map[dt] = {
        fecha: dt,
        cubiertos,
        total,
        pct,
        centrosDetalle
      };
    }

    return map;
  }, [monthData, centrosUnicos]);

  // Días del mes organizados en semanas (Lunes a Domingo)
  const calendarWeeks = useMemo(() => {
    const dates = Object.keys(dailyCoverageMap).sort();
    if (dates.length === 0) return [];

    const firstDate = new Date(dates[0]);
    // 0=Dom, 1=Lun ... convertir a 0=Lun, 6=Dom
    const startDayIndex = (firstDate.getDay() + 6) % 7;

    const cells = [];
    // Espacios vacíos antes del primer día
    for (let i = 0; i < startDayIndex; i++) {
      cells.push({ isEmpty: true, key: `empty-${i}` });
    }

    for (const dt of dates) {
      cells.push({
        isEmpty: false,
        fecha: dt,
        data: dailyCoverageMap[dt],
        key: dt
      });
    }

    // Completar hasta múltiplo de 7
    while (cells.length % 7 !== 0) {
      cells.push({ isEmpty: true, key: `trailing-${cells.length}` });
    }

    // Dividir en filas de 7
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [dailyCoverageMap]);

  // Estadísticas globales del mes
  const monthStats = useMemo(() => {
    const allDays = Object.values(dailyCoverageMap);
    if (allDays.length === 0) return { avgPct: 0, totalCentros: centrosUnicos.length, fullDays: 0, partialDays: 0 };
    const sumPct = allDays.reduce((acc, d) => acc + d.pct, 0);
    const avgPct = Math.round(sumPct / allDays.length);
    const fullDays = allDays.filter(d => d.pct === 100).length;
    const partialDays = allDays.length - fullDays;
    return {
      avgPct,
      totalCentros: centrosUnicos.length,
      fullDays,
      partialDays
    };
  }, [dailyCoverageMap, centrosUnicos]);

  // Detalle del día seleccionado
  const selectedDayInfo = useMemo(() => {
    if (!selectedDateIso || !dailyCoverageMap[selectedDateIso]) return null;
    const base = dailyCoverageMap[selectedDateIso];

    let list = base.centrosDetalle;

    // Filtro por estado
    if (filtroEstadoDetalle === 'cubierto') {
      list = list.filter(c => c.isCovered);
    } else if (filtroEstadoDetalle === 'sin_cobertura') {
      list = list.filter(c => !c.isCovered);
    }

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      list = list.filter(c => 
        c.centro.toLowerCase().includes(q) || 
        c.promotores.some(p => p.name.toLowerCase().includes(q))
      );
    }

    return {
      ...base,
      centrosFiltrados: list
    };
  }, [selectedDateIso, dailyCoverageMap, filtroEstadoDetalle, busqueda]);

  // Navegación de mes
  const currentMonthIdx = mesesDisponibles.findIndex(m => m.mes === selectedMonth);
  const handlePrevMonth = () => {
    if (currentMonthIdx > 0) setSelectedMonth(mesesDisponibles[currentMonthIdx - 1].mes);
  };
  const handleNextMonth = () => {
    if (currentMonthIdx < mesesDisponibles.length - 1) setSelectedMonth(mesesDisponibles[currentMonthIdx + 1].mes);
  };

  // Helper para formato de badge de cobertura
  const getBadgeClass = (pct) => {
    if (pct === 100) return styles.cov100;
    if (pct >= 80) return styles.covHigh;
    if (pct >= 50) return styles.covMed;
    return styles.covLow;
  };

  return (
    <div className={styles.container}>
      {/* Cabecera */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.pageTitle}>
            <ShieldCheck size={26} color="var(--salesland-primary)" /> Cobertura de Centros
          </h2>
          <span className={styles.pageSub}>
            Supervisión diaria de presencia en los centros asignados a tu equipo
          </span>
        </div>
      </div>

      {/* Barra de Controles: Selector de Mes y Filtros */}
      <div className={styles.controlBar}>
        <div className={styles.monthPill}>
          <button 
            type="button" 
            onClick={handlePrevMonth} 
            disabled={currentMonthIdx <= 0} 
            className={styles.navArrowBtn}
            title="Mes anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <span className={styles.monthPillText}>{selectedMonth || 'Cargando...'}</span>
          <button 
            type="button" 
            onClick={handleNextMonth} 
            disabled={currentMonthIdx >= mesesDisponibles.length - 1} 
            className={styles.navArrowBtn}
            title="Mes siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className={styles.filtersGroup}>
          {regionesDisponibles.length > 1 && (
            <select 
              value={filtroRegion} 
              onChange={(e) => {
                setFiltroRegion(e.target.value);
                setFiltroTienda('todas');
              }}
              className={styles.filterSelect}
            >
              <option value="todas">🌍 Todas las regiones ({regionesDisponibles.length})</option>
              {regionesDisponibles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          )}

          {tiendasDisponibles.length > 1 && (
            <select 
              value={filtroTienda} 
              onChange={(e) => setFiltroTienda(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="todas">🏬 Todos los centros ({tiendasDisponibles.length})</option>
              {tiendasDisponibles.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          <div className={styles.searchInputWrapper}>
            <Search size={15} className={styles.searchIcon} />
            <input 
              type="text"
              placeholder="Buscar tienda o promotor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {loading && <div className="card">Cargando métricas de cobertura del equipo...</div>}
      {error && <div className="card" style={{ color: 'var(--danger)' }}>{error}</div>}

      {!loading && !error && (
        <>
          {/* Métricas Globales del Mes */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Cobertura Media Mensual</span>
              <span className={styles.statValue} style={{ color: monthStats.avgPct >= 80 ? '#15803d' : '#b45309' }}>
                {monthStats.avgPct}%
              </span>
              <span className={styles.statSub}>Promedio de días del mes</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Centros Supervisados</span>
              <span className={styles.statValue}>{monthStats.totalCentros}</span>
              <span className={styles.statSub}>En tu zona / filtros activos</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Días Cobertura 100%</span>
              <span className={styles.statValue} style={{ color: '#15803d' }}>
                {monthStats.fullDays} días
              </span>
              <span className={styles.statSub}>Sin ningún centro descubierto</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Días Cobertura Incompleta</span>
              <span className={styles.statValue} style={{ color: monthStats.partialDays > 0 ? '#b91c1c' : '#15803d' }}>
                {monthStats.partialDays} días
              </span>
              <span className={styles.statSub}>Con al menos 1 centro sin cubrir</span>
            </div>
          </div>

          {/* Calendario Mensual de Cobertura */}
          <div className={styles.calendarContainer}>
            <div className={styles.calendarHeader}>
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                <div key={d} className={styles.calendarHeaderDay}>{d}</div>
              ))}
            </div>

            <div className={styles.calendarGrid}>
              {calendarWeeks.map((week, wIdx) => (
                <div key={wIdx} className={styles.calendarRow}>
                  {week.map(cell => {
                    if (cell.isEmpty) {
                      return <div key={cell.key} className={`${styles.calendarCell} ${styles.emptyCell}`} />;
                    }

                    const isToday = cell.fecha === todayIso;
                    const isSelected = cell.fecha === selectedDateIso;
                    const dayNum = parseInt(cell.fecha.split('-')[2], 10);
                    const cov = cell.data;

                    return (
                      <div 
                        key={cell.key} 
                        onClick={() => setSelectedDateIso(cell.fecha)}
                        className={`${styles.calendarCell} ${isSelected ? styles.calendarCellActive : ''}`}
                      >
                        <div className={styles.cellTop}>
                          <span className={styles.cellDate}>{dayNum}</span>
                          {isToday && <span className={styles.todayBadge}>Hoy</span>}
                        </div>

                        {cov && cov.total > 0 ? (
                          <div className={`${styles.coverageBadge} ${getBadgeClass(cov.pct)}`}>
                            <span className={styles.coveragePct}>{cov.pct}%</span>
                            <span className={styles.coverageRatio}>{cov.cubiertos}/{cov.total} centros</span>
                          </div>
                        ) : (
                          <div className={styles.coverageBadge} style={{ background: 'rgba(0,0,0,0.04)', color: 'var(--text-tertiary)' }}>
                            <span className={styles.coverageRatio}>Sin centros</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Desglose Detallado del Día Seleccionado */}
          {selectedDayInfo && (
            <div className={styles.detailSection}>
              <div className={styles.detailHeader}>
                <div>
                  <h3 className={styles.detailTitle}>
                    <Store size={20} /> 
                    Detalle del día: {new Date(selectedDayInfo.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Cobertura de este día: <strong>{selectedDayInfo.pct}%</strong> ({selectedDayInfo.cubiertos} de {selectedDayInfo.total} centros cubiertos)
                  </span>
                </div>

                <div className={styles.detailPills}>
                  <button 
                    type="button" 
                    className={`${styles.detailTabBtn} ${filtroEstadoDetalle === 'todos' ? styles.detailTabBtnActive : ''}`}
                    onClick={() => setFiltroEstadoDetalle('todos')}
                  >
                    Todos ({selectedDayInfo.centrosDetalle.length})
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.detailTabBtn} ${filtroEstadoDetalle === 'cubierto' ? styles.detailTabBtnActive : ''}`}
                    onClick={() => setFiltroEstadoDetalle('cubierto')}
                  >
                    🟢 Cubiertos ({selectedDayInfo.cubiertos})
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.detailTabBtn} ${filtroEstadoDetalle === 'sin_cobertura' ? styles.detailTabBtnActive : ''}`}
                    onClick={() => setFiltroEstadoDetalle('sin_cobertura')}
                  >
                    🔴 Sin Cobertura ({selectedDayInfo.total - selectedDayInfo.cubiertos})
                  </button>
                </div>
              </div>

              {selectedDayInfo.centrosFiltrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                  No hay centros que coincidan con los filtros seleccionados para este día.
                </div>
              ) : (
                <div className={styles.centerCardsGrid}>
                  {selectedDayInfo.centrosFiltrados.map(c => (
                    <div 
                      key={c.centro} 
                      className={`${styles.centerCard} ${c.isCovered ? styles.centerCardCovered : styles.centerCardUncovered}`}
                    >
                      <div className={styles.centerTopRow}>
                        <div>
                          <h4 className={styles.centerName}>{c.centro}</h4>
                          <span className={styles.centerRegion}>📍 Región: {c.region}</span>
                        </div>
                        <span className={`${styles.statusPill} ${c.isCovered ? styles.statusCovered : styles.statusUncovered}`}>
                          {c.isCovered ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          {c.isCovered ? 'CUBIERTO' : 'SIN COBERTURA'}
                        </span>
                      </div>

                      <div className={styles.promotoresList}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                          Promotores asignados ({c.promotores.length}):
                        </span>
                        {c.promotores.map((p, pIdx) => (
                          <div key={pIdx} className={styles.promotorRow}>
                            <span className={styles.promotorName} title={p.name}>
                              <Users size={12} color="var(--text-tertiary)" />
                              {p.name}
                            </span>
                            <span className={`${styles.promotorShiftBadge} ${p.isWorking ? styles.shiftWorking : styles.shiftOff}`}>
                              {p.isWorking ? `🕒 ${p.horas}` : p.horas}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
