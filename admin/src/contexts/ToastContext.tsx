'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface ToastMessage {
  message: string;
  severity: AlertColor;
  id: number;
}

interface ToastContextType {
  showToast: (message: string, severity?: AlertColor) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  showSuccess: () => {},
  showError: () => {},
  showWarning: () => {},
});

export const useToast = () => useContext(ToastContext);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const showToast = useCallback((message: string, severity: AlertColor = 'info') => {
    const id = nextId++;
    setToasts(prev => [...prev, { message, severity, id }]);
  }, []);

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);

  const handleClose = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning }}>
      {children}
      {mounted && toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open
          autoHideDuration={4000}
          onClose={() => handleClose(toast.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ bottom: { xs: 24 + index * 60 } }}
        >
          <Alert
            onClose={() => handleClose(toast.id)}
            severity={toast.severity}
            variant="filled"
            sx={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
}
