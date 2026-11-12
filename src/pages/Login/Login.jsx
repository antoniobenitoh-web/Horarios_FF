/* eslint-disable */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const cleanUser = username.trim();
    if (!cleanUser) {
      setError('Por favor introduce tu usuario o email');
      return;
    }

    const result = await login(cleanUser, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Credenciales incorrectas');
    }
  };

  return (
    <div className={styles.loginWrapper}>
      {/* Contenedor Adaptativo: En móvil pantalla completa (100dvh), en PC tarjeta elegante */}
      <div className={styles.loginCard}>
        
        {/* Ondas decorativas de fondo vectoriales */}
        <div className={styles.wavesContainer}>
          <svg viewBox="0 0 360 640" className={styles.waveSvg} preserveAspectRatio="none">
            <path d="M-50 490 Q 90 420 240 470 T 420 450 L 420 640 L -50 640 Z" fill="#00808b" opacity="0.45" />
            <path d="M-50 540 Q 120 470 260 530 T 420 510 L 420 640 L -50 640 Z" fill="#009ca6" opacity="0.5" />
            <path d="M-50 590 Q 140 530 280 580 T 420 570 L 420 640 L -50 640 Z" fill="#00b8c4" opacity="0.35" />
          </svg>
        </div>

        {/* 1. CABECERA: LOGO SALESLAND Y LOGO XIAOMI */}
        <div className={styles.headerLogos}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={import.meta.env.BASE_URL + "images/salesland_logo_transparent.png"}
              alt="Salesland"
              className={styles.saleslandLogoImg}
              loading="eager"
            />
          </div>

          <div className={styles.logoRightGroup}>
            <div className={styles.logoDivider} />
            <div className={styles.xiaomiLogoBox}>
              <img
                src={import.meta.env.BASE_URL + "images/xiaomi_logo.png"}
                alt="Xiaomi"
                className={styles.xiaomiLogoImg}
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* 2. TEXTO INFORMATIVO CENTRAL */}
        <div className={styles.centerContent}>
          <h1 className={styles.title}>
            Horarios<br />Equipo FF
          </h1>
          <p className={styles.subtitle}>
            Controla, consulta y confirma los turnos y horarios de tu equipo.
          </p>
        </div>

        {/* 3. FORMULARIO DE ACCESO */}
        <form onSubmit={handleSubmit} className={styles.form}>
          
          {/* Campo Usuario con icono Google oficial */}
          <div className={styles.inputGroup}>
            <div className={styles.inputInner}>
              <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="usuario@salesland.net"
                className={styles.inputField}
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Campo Contraseña con icono candado y botón de mostrar/ocultar */}
          <div className={styles.inputGroup}>
            <div className={styles.inputInner}>
              <Lock style={{ width: '18px', height: '18px', color: '#94a3b8', flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Contraseña"
                className={styles.inputField}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.eyeButton}
              title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Mensaje de error si falla la autenticación */}
          {error && (
            <div className={styles.errorAlert}>
              {error}
            </div>
          )}

          {/* Botón de Acceso Corporativo en Turquesa */}
          <button type="submit" className={styles.submitBtn}>
            Comenzar
          </button>
        </form>

      </div>
    </div>
  );
}
