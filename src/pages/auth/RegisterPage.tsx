import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, clearError } from '../../store/slices/authSlice';
import type { AuthState } from '../../store/types';
import RegisterForm from '../../components/forms/RegisterForm';
import type { RegisterFormData } from '../../types';

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth) as AuthState;

  const handleRegister = async (data: RegisterFormData) => {
    await dispatch(registerUser(data));
  };

  // Clear error when component unmounts
  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <RegisterForm
      onSubmit={handleRegister}
      isLoading={isLoading}
      error={error || undefined}
    />
  );
};

export default RegisterPage;
