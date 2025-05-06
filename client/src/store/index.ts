import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredPaths: [
          'auth.user.lastLogin',
          'auth.user.createdAt',
          'auth.user.updatedAt',
          'auth.user.notifications'
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.user.lastLogin',
          'payload.user.createdAt',
          'payload.user.updatedAt',
          'payload.user.notifications'
        ],
      },
    })
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useReduxDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export { store };
