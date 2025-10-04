import { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // If AuthContext is not available, fall back to Redux state
    return useSelector((state) => state.auth);
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const authState = useSelector((state) => state.auth);
  
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;