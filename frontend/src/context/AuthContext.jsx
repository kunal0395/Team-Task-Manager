import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (stored) setUser(JSON.parse(stored));
    setReady(true);
  }, []);

  const login = (data) => {
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);