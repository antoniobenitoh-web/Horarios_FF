/* eslint-disable */
import React, { createContext, useState, useContext } from 'react';

const mockUsers = [
  {
    id: 1,
    username: 'juan',
    password: '123',
    name: 'Juan Pérez',
    role: 'promotor',
    manager: {
      gpv: 'María García',
      am: 'Carlos López',
      coordinadora: 'Ana Martínez',
      administradora: 'Alicia Muruzabal',
      project: 'Alicia Muruzabal'
    }
  },
  {
    id: 2,
    username: 'maria',
    password: '123',
    name: 'María García',
    role: 'gpv'
  },
  {
    id: 3,
    username: 'carlos',
    password: '123',
    name: 'Carlos López',
    role: 'am'
  },
  {
    id: 4,
    username: 'ana',
    password: '123',
    name: 'Ana Martínez',
    role: 'coordinadora'
  },
  {
    id: 5,
    username: 'alicia',
    password: '123',
    name: 'Alicia Admin',
    role: 'administradora'
  }
];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.manager) {
        parsed.manager.administradora = parsed.manager.administradora || parsed.manager.project || '';
        parsed.manager.project = parsed.manager.project || parsed.manager.administradora || '';
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const GAS_URL = import.meta.env.VITE_GAS_URL;

  const login = async (username, password) => {
    // Si tenemos configurada la URL del backend, llamamos a Google Apps Script
    if (GAS_URL) {
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'login', username, password }),
        });
        const data = await res.json();
        if (data.success) {
          if (data.user && data.user.role) {
            data.user.role = String(data.user.role).toLowerCase().trim();
          }
          if (data.user && data.user.manager) {
            data.user.manager.administradora = data.user.manager.administradora || data.user.manager.project || '';
            data.user.manager.project = data.user.manager.project || data.user.manager.administradora || '';
          }
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          return { success: true };
        }
        return { success: false, error: data.error || 'Credenciales inválidas' };
      } catch (err) {
        console.warn('Aviso: Backend remoto inaccesible, comprobando usuarios locales.', err);
      }
    }

    // Fallback: Si no hay URL o backend falla, usamos datos locales
    const found = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem('user', JSON.stringify(found));
      return { success: true };
    }
    return { success: false, error: 'Credenciales inválidas (Modo Local)' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUserPassword = (newPassword) => {
    if (user) {
      const updatedUser = { ...user, password: newPassword };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
