import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: <CheckCircle size={18} className="text-green-400 shrink-0" />,
  error: <XCircle size={18} className="text-red-400 shrink-0" />,
  info: <Info size={18} className="text-blue-400 shrink-0" />,
};

const BG = {
  success: "bg-gray-900 border-green-700",
  error: "bg-gray-900 border-red-700",
  info: "bg-gray-900 border-blue-700",
};

function ToastItem({ item, onClose }: { item: ToastItem; onClose: (id: number) => void }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium min-w-64 max-w-80 animate-slide-in ${BG[item.type]}`}
    >
      {ICONS[item.type]}
      <span className="flex-1">{item.message}</span>
      <button onClick={() => onClose(item.id)} className="text-gray-500 hover:text-gray-300 ml-1">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const close = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[100]">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onClose={close} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
