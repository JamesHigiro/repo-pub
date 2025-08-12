import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import RegistrationTest from '../components/RegistrationTest';
import LoginTest from '../components/LoginTest';

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  protected?: boolean;
}

export const publicRoutes: RouteConfig[] = [
  {
    path: '/login',
    element: LoginPage,
  },
  {
    path: '/register',
    element: RegisterPage,
  }
];

export const protectedRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    element: DashboardPage,
    protected: true,
  },
];

export const routes = {
  public: publicRoutes,
  protected: protectedRoutes,
};
