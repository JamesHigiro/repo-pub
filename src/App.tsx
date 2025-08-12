import React, { useEffect } from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { loadUserFromStorage } from './store/slices/authSlice';
import type { AuthState } from './store/types';
import AppRoutes from './routes/AppRoutes';
import { antdTheme } from './theme';
import './App.css';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth) as AuthState;
  const { isAuthenticated, isLoading } = auth;
  const navigate = useNavigate();

  // Load user from storage on app start
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && window.location.pathname !== '/dashboard') {
      navigate('/dashboard');
    } else if (!isAuthenticated && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return <AppRoutes isAuthenticated={isAuthenticated} />;
};

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <Router>
        <AppContent />
      </Router>
    </ConfigProvider>
  );
}

export default App;