import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

type Listener = (toast: ToastMessage) => void;
const listeners = new Set<Listener>();
let nextId = 1;

/** Shows a short message at the bottom of the screen. Replaces browser alert() popups. */
export const notify = (text: string, kind: ToastKind = 'info'): void => {
  const toast = { id: nextId++, kind, text };
  listeners.forEach((listener) => listener(toast));
};

const ICONS = { success: CheckCircle, error: AlertCircle, info: Info };
const STYLES: Record<ToastKind, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-white border-gray-200 text-gray-800',
};

/** Mount once near the root of the app. */
const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener: Listener = (toast) => {
      setToasts((prev) => [...prev.slice(-2), toast]);
      window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), 4000);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[min(92vw,420px)]" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.kind];
        return (
          <div key={toast.id} className={`flex items-start gap-3 border rounded-lg shadow-lg px-4 py-3 text-sm ${STYLES[toast.kind]}`} role="status">
            <Icon size={18} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1 whitespace-pre-line">{toast.text}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              aria-label="Dismiss"
              className="opacity-60 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toaster;
