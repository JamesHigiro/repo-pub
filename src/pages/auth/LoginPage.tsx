import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearError } from '../../store/slices/authSlice';
import type { AuthState } from '../../store/types';
import LoginForm from '../../components/forms/LoginForm';
import type { LoginFormData } from '../../types';

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth) as AuthState;

  const handleLogin = async (data: LoginFormData) => {
    await dispatch(loginUser(data));
  };

  // Clear error when component unmounts
  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <LoginForm
      onSubmit={handleLogin}
      isLoading={isLoading}
      error={error || undefined}
    />
  );
};

export default LoginPage;
