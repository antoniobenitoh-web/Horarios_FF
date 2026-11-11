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
      coordinadora: 'Ana Martínez'
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
  }
];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const GAS_URL = import.meta.env.VITE_GAS_URL;

  const login = async (username, password) => {
    // Si tenemos configurada la URL del backend, intentamos con Google Apps Script
    if (GAS_URL) {
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'login', username, password }),
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          return { success: true };
        }
      } catch (err) {
        console.warn('Aviso: No se pudo conectar con el backend remoto, comprobando usuarios locales.', err);
      }
    }

    // Fallback: Si no hay backend o las credenciales remotas no coinciden, probamos usuarios mock locales
    const found = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem('user', JSON.stringify(found));
      return { success: true };
    }
    return { success: false, error: 'Credenciales inválidas' };
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
    <AuthContext.Provider value={{ user, login, logout, updateUserPassword, mockUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
