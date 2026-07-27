import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = () => {
      const storageUser = localStorage.getItem('@MVP:user');
      const storageToken = localStorage.getItem('@MVP:token');

      if (storageUser && storageToken) {
        setUser(JSON.parse(storageUser));
      }
      setLoading(false);
    };

    loadStorageData();
  }, []);

  // Agora recebe username em vez de email
  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login/', { username, password });
      
      const { access, refresh, tipo_usuario } = response.data;

      // Guarda o username no estado global do usuário
      const loggedUser = { username, tipo_usuario };

      localStorage.setItem('@MVP:user', JSON.stringify(loggedUser));
      localStorage.setItem('@MVP:token', access);
      localStorage.setItem('@MVP:refreshToken', refresh);

      setUser(loggedUser);
      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('@MVP:user');
    localStorage.removeItem('@MVP:token');
    localStorage.removeItem('@MVP:refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}