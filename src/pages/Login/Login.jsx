/* eslint-disable */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { CalendarDays, KeyRound, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.glassCard}>
        <div className={styles.header}>
          <div className={styles.logo} style={{ padding: '0', background: 'transparent', boxShadow: 'none', marginBottom: '1rem' }}>
            <img src={import.meta.env.BASE_URL + "icon-192.png"} alt="Horarios Equipo FF" style={{ width: '80px', height: '80px', borderRadius: '18px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }} />
          </div>
          <h1 style={{ color: 'var(--salesland-primary)', fontWeight: '700', fontSize: '1.6rem', marginBottom: '0.25rem' }}>Horarios Equipo FF</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Inicia sesión en tu cuenta</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="input-group">
            <label className="input-label" htmlFor="username">Usuario</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                id="username"
                className="input-field"
                type="text"
                placeholder="ej: juan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Contraseña</label>
            <div className={styles.inputWrapper}>
              <KeyRound size={18} className={styles.inputIcon} />
              <input
                id="password"
                className="input-field"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
            Acceder
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: '0.6rem', textAlign: 'center', fontWeight: '500' }}>
            Acceso Rápido Demo (Contraseña: 123)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.5rem', borderRadius: '8px' }}
              onClick={() => { setUsername('juan'); setPassword('123'); }}
            >
              👤 Promotor (juan)
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.5rem', borderRadius: '8px' }}
              onClick={() => { setUsername('maria'); setPassword('123'); }}
            >
              👔 GPV (maria)
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.5rem', borderRadius: '8px' }}
              onClick={() => { setUsername('carlos'); setPassword('123'); }}
            >
              📊 AM (carlos)
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.5rem', borderRadius: '8px' }}
              onClick={() => { setUsername('ana'); setPassword('123'); }}
            >
              ⭐ Coordinadora (ana)
            </button>
          </div>
        </div>

        <div className={styles.footer} style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>¿Problemas para iniciar sesión? Contacta a tu responsable.</p>
        </div>
      </div>
    </div>
  );
}
