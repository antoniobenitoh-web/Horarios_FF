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
  FileCheck
} from 'lucide-react';
import { detectTurno } from '../../utils/turnoUtils';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const GAS_URL = import.meta.env.VITE_GAS_URL;

  const [nextShift, setNextShift] = useState({ data: null, loading: true });
  const [managerStats, setManagerStats] = useState({ teamSize: 0, loading: true });

  useEffect(() => {
    const fetchNextShift = async () => {
      if (user.role !== 'promotor' || !GAS_URL) return;
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getSchedule', name: user.name })
        });
        const data = await res.json();
        if (data.success && data.schedule && data.schedule.length > 0) {
          // Buscamos el primer turno con horas válidas
          let found = null;
          for (const m of data.schedule) {
            for (const s of m.semanas) {
              for (const d of s.detalle) {
                if (d.horas && d.horas !== '-' && !d.horas.toLowerCase().includes('descanso') && !d.horas.toLowerCase().includes('day off')) {
                  found = d;
                  break;
                }
              }
              if (found) break;
            }
            if (found) break;
          }
          if (found) {
            found = { ...found, turno: detectTurno(found.horas, found.turno) };
          }
          setNextShift({ data: found, loading: false });
        } else {
          setNextShift({ data: null, loading: false });
        }
      } catch (err) {
        setNextShift({ data: null, loading: false });
      }
    };

    const fetchManagerData = async () => {
      if ((user.role !== 'gpv' && user.role !== 'am' && user.role !== 'coordinadora' && user.role !== 'trainer' && user.role !== 'administradora') || !GAS_URL) return;
      try {
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
             String(u.manager?.administradora || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() || 
             String(u.manager?.trainer || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase())
          ).length;
        }

        setManagerStats({ teamSize: tSize, loading: false });
      } catch (err) {
        setManagerStats(prev => ({ ...prev, loading: false }));
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
              { rol: 'Administradora', nombre: user.manager.administradora },
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
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Próximo Turno</p>
            {nextShift.loading ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Cargando turno...</p>
            ) : nextShift.data ? (
              <p style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{nextShift.data.dia}, {nextShift.data.horas}</p>
            ) : (
              <p style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Sin turnos programados</p>
            )}
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>📍 {user.centro || 'Centro no asignado'}</p>
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
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/control-equipo')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(168,85,247,0.12)', borderRadius: '10px', color: '#a855f7' }}>
                  <TrendingUp size={28} />
                </div>
                <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Control Equipo</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Métricas Generales
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Filtros por zona, tienda y estadísticas</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
