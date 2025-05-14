/**
 * Module declarations for packages without type definitions
 */

declare module 'react-hot-toast' {
  import { ReactNode } from 'react';

  export interface ToastOptions {
    id?: string;
    icon?: string | JSX.Element;
    duration?: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    style?: React.CSSProperties;
    className?: string;
  }

  export interface Toast {
    id: string;
    type: 'success' | 'error' | 'loading' | 'blank';
    message: React.ReactNode;
    icon?: React.ReactNode;
    duration: number;
    position: string;
    style: React.CSSProperties;
    className?: string;
  }

  export interface ToasterProps {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    toastOptions?: ToastOptions;
    reverseOrder?: boolean;
    gutter?: number;
    containerStyle?: React.CSSProperties;
    containerClassName?: string;
    children?: (toast: Toast) => ReactNode;
  }

  export const Toaster: React.FC<ToasterProps>;

  const toast: {
    (message: React.ReactNode, options?: ToastOptions): string;
    success: (message: React.ReactNode, options?: ToastOptions) => string;
    error: (message: React.ReactNode, options?: ToastOptions) => string;
    loading: (message: React.ReactNode, options?: ToastOptions) => string;
    dismiss: (toastId?: string) => void;
    remove: (toastId?: string) => void;
    custom: (message: React.ReactNode, options?: ToastOptions) => string;
  };

  export default toast;
} 