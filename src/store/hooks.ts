import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Used throughout the app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector<RootState>;
