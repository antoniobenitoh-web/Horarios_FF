/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDays, 
  CalendarClock, 
  Clock, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { detectTurno, shiftConfig, hasWorkingShift } from '../../utils/turnoUtils';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const GAS_URL = import.meta.env.VITE_GAS_URL;

  const [nextShift, setNextShift] = useState({ data: null, loading: true });
  const [managerStats, setManagerStats] = useState({ teamSize: 0, loading: true });
  const [todayCoverage, setTodayCoverage] = useState({ pct: 0, cubiertos: 0, total: 0, loading: true, color: 'var(--text-primary)' });

  useEffect(() => {
    const fetchNextShift = async () => {
      if (user.role !== 'promotor' || !GAS_URL) return;
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getSchedule', name: user.name })
        });
        const data = await res.json();

        // Calculamos la fecha de mañana (día siguiente al actual)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        const tomorrowIso = `${yyyy}-${mm}-${dd}`;

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaNombreManana = `${diasSemana[tomorrow.getDay()]} ${tomorrow.getDate()}`;

        const normalizeDateStr = (f) => {
          if (!f) return '';
          if (typeof f === 'string') {
            const isoMatch = f.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
            if (isoMatch) return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
            const dmyMatch = f.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (dmyMatch) return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
          }
          try {
            const dt = new Date(f);
            if (!isNaN(dt.getTime())) {
              const y = dt.getFullYear();
              const m = String(dt.getMonth() + 1).padStart(2, '0');
              const d = String(dt.getDate()).padStart(2, '0');
              return `${y}-${m}-${d}`;
            }
          } catch (e) {}
          return String(f).trim();
        };

        if (data.success && data.schedule && data.schedule.length > 0) {
          // Buscamos específicamente el turno del día siguiente
          let found = null;
          for (const m of data.schedule) {
            for (const s of (m.semanas || [])) {
              for (const d of (s.detalle || [])) {
                if (normalizeDateStr(d.fecha) === tomorrowIso) {
                  found = { ...d };
                  break;
                }
              }
              if (found) break;
            }
            if (found) break;
          }

          if (found) {
            const detected = detectTurno(found.horas, found.turno);
            found = {
              ...found,
              turno: detected,
              config: shiftConfig[detected] || {
                label: detected,
                color: 'var(--accent-primary)',
                bg: 'var(--accent-light)'
              }
            };
          } else {
            found = {
              dia: diaNombreManana,
              fecha: tomorrowIso,
              horas: 'Sin turno programado',
              turno: 'Day off',
              config: shiftConfig['Day off']
            };
          }
          setNextShift({ data: found, loading: false });
        } else {
          setNextShift({ 
            data: {
              dia: diaNombreManana,
              fecha: tomorrowIso,
              horas: 'Sin turno programado',
              turno: 'Day off',
              config: shiftConfig['Day off']
            }, 
            loading: false 
          });
        }
      } catch (err) {
        setNextShift({ data: null, loading: false });
      }
    };

    const fetchManagerData = async () => {
      if ((user.role !== 'gpv' && user.role !== 'am' && user.role !== 'coordinadora' && user.role !== 'trainer' && user.role !== 'administradora') || !GAS_URL) return;
      try {
        const roleToSend = user.role === 'administradora' ? 'project' : user.role;

        // Fetch usuarios
        const resUsers = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getUsers' })
        });
        const dataUsers = await resUsers.json();
        let tSize = 0;
        if (dataUsers.success) {
          tSize = dataUsers.users.filter(u => 
            u.role === 'promotor' && 
            (user.role === 'administradora' ||
             String(u.manager?.gpv || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() || 
             String(u.manager?.am || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() || 
             String(u.manager?.coordinadora || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() || 
             String(u.manager?.administradora || u.manager?.project || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() || 
             String(u.manager?.trainer || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase())
          ).length;
        }

        setManagerStats({ teamSize: tSize, loading: false });

        // Cobertura del día en curso (Hoy) para roles de gestión
        if (user.role === 'gpv' || user.role === 'am' || user.role === 'coordinadora' || user.role === 'administradora') {
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const dd = String(today.getDate()).padStart(2, '0');
          const todayIso = `${yyyy}-${mm}-${dd}`;

          const dUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
          const dayNum = dUtc.getUTCDay() || 7;
          dUtc.setUTCDate(dUtc.getUTCDate() + 4 - dayNum);
          const yearStart = new Date(Date.UTC(dUtc.getUTCFullYear(), 0, 1));
          const currentWeekNum = Math.ceil((((dUtc - yearStart) / 86400000) + 1) / 7);

          const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
          const currentMonthStr = `${mesesNombres[today.getMonth()]} ${yyyy}`;

          const resWeekly = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify({
              action: 'getEquipoWeekly',
              month: currentMonthStr,
              weekNum: currentWeekNum.toString(),
              role: roleToSend,
              name: user.name
            })
          });
          const dataWeekly = await resWeekly.json();

          if (dataWeekly.success && Array.isArray(dataWeekly.equipo)) {
            const centrosMap = {};
            for (const p of dataWeekly.equipo) {
              if (!p.centro || p.centro === 'Sin asignar') continue;
              if (!centrosMap[p.centro]) {
                centrosMap[p.centro] = [];
              }
              centrosMap[p.centro].push(p);
            }

            const centros = Object.keys(centrosMap);
            let cubiertos = 0;

            for (const c of centros) {
              const promos = centrosMap[c];
              const isCovered = promos.some(pr => {
                const dayShift = pr.semana?.find(s => s.fecha === todayIso);
                return hasWorkingShift(dayShift?.horas, dayShift?.turno || dayShift?.iconTurno);
              });
              if (isCovered) cubiertos++;
            }

            const total = centros.length;
            const pct = total > 0 ? Math.round((cubiertos / total) * 100) : 0;
            const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';

            setTodayCoverage({
              pct,
              cubiertos,
              total,
              loading: false,
              color
            });
          } else {
            setTodayCoverage(prev => ({ ...prev, loading: false }));
          }
        }
      } catch (err) {
        setManagerStats(prev => ({ ...prev, loading: false }));
        setTodayCoverage(prev => ({ ...prev, loading: false }));
      }
    };

    fetchNextShift();
    fetchManagerData();
  }, [user, GAS_URL]);

  return (
    <div>
      {/* Saludo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--salesland-primary)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.2rem' }}>Hola, {user.name} 👋</h2>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Bienvenido a Horarios Equipo FF. Aquí tienes el resumen de tu actividad.</span>
        </div>
      </div>

      {/* Panel de Coordinación - siempre primero para promotores */}
      {user.role === 'promotor' && user.manager && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', fontSize: '1rem', color: 'var(--salesland-primary)', fontWeight: '600' }}>
            👥 Mi Equipo de Coordinación
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {[
              { rol: 'GPV', nombre: user.manager.gpv },
              { rol: 'Area Manager', nombre: user.manager.am },
              { rol: 'Coordinadora', nombre: user.manager.coordinadora },
              { rol: 'Trainer', nombre: user.manager.trainer },
              { rol: 'Administradora', nombre: user.manager.administradora || user.manager.project },
            ].map(({ rol, nombre }) => (
              <div key={rol} style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderRadius: '10px', padding: '1rem' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{rol}</p>
                <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{nombre || 'Sin asignar'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tarjetas de acceso rápido para Promotor */}
      {user.role === 'promotor' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {/* Próximo turno */}
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/horario')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--accent-light)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                <CalendarDays size={28} />
              </div>
              <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Próximo Turno (Mañana)</p>
            {nextShift.loading ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Cargando turno...</p>
            ) : nextShift.data ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                  <p style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {nextShift.data.dia} · {nextShift.data.horas}
                  </p>
                  {nextShift.data.config && (
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: '700',
                      background: nextShift.data.config.bg, 
                      color: nextShift.data.config.color,
                      border: `1px solid ${nextShift.data.config.color}33`
                    }}>
                      {nextShift.data.config.icon}
                      {nextShift.data.config.label}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Sin turnos programados</p>
            )}
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              📍 {nextShift.data?.centroAsignado || user.centro || 'Centro no asignado'}
            </p>
          </div>

          {/* Balance de horas */}
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/horas')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(34,197,94,0.12)', borderRadius: '10px', color: 'var(--success)' }}>
                <Clock size={28} />
              </div>
              <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Control Horario</p>
            <p style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Consultar balance</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Ver horas planificadas vs contrato</p>
          </div>
        </div>
      )}

      {/* Dashboard para GPV/AM/Coordinadora/Trainer/Administradora */}
      {(user.role === 'gpv' || user.role === 'am' || user.role === 'coordinadora' || user.role === 'trainer' || user.role === 'administradora') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/equipo')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--accent-light)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                <Users size={28} />
              </div>
              <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Mi Equipo</p>
            <p style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {managerStats.loading ? '...' : managerStats.teamSize}
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Promotores asignados</p>
          </div>

          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/horas')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(59,130,246,0.12)', borderRadius: '10px', color: 'var(--info)' }}>
                <Clock size={28} />
              </div>
              <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Control Horas</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem', textTransform: 'capitalize' }}>
              {new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Balance y cuadrante por promotor</p>
          </div>

          {(user.role === 'gpv' || user.role === 'am' || user.role === 'coordinadora' || user.role === 'administradora') && (
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/cobertura')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.12)', borderRadius: '10px', color: '#10b981' }}>
                  <ShieldCheck size={28} />
                </div>
                <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Cobertura Hoy</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <p style={{ fontSize: '1.6rem', fontWeight: '800', color: todayCoverage.color, margin: 0 }}>
                  {todayCoverage.loading ? '...' : `${todayCoverage.pct}%`}
                </p>
                {!todayCoverage.loading && todayCoverage.total > 0 && (
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    ({todayCoverage.cubiertos}/{todayCoverage.total} centros)
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                {todayCoverage.loading ? 'Calculando cobertura del día...' : `${todayCoverage.cubiertos} centros cubiertos hoy en tu zona`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
