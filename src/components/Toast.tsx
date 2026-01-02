"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  txSignature?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, txSignature?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, title: string, message?: string, txSignature?: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message, txSignature }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
  };

  const colors = {
    success: "border-green-500/50 bg-green-500/10",
    error: "border-red-500/50 bg-red-500/10",
    warning: "border-yellow-500/50 bg-yellow-500/10",
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${colors[toast.type]} backdrop-blur-sm min-w-[300px] max-w-[400px] animate-slide-in`}
    >
      {icons[toast.type]}
      <div className="flex-1">
        <div className="font-bold text-white">{toast.title}</div>
        {toast.message && (
          <div className="text-gray-400 text-sm mt-1">{toast.message}</div>
        )}
        {toast.txSignature && (
          <a
            href={`https://explorer.solana.com/tx/${toast.txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 text-sm mt-2 inline-block hover:underline"
          >
            View Transaction →
          </a>
        )}
      </div>
      <button onClick={onClose} className="text-gray-500 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
