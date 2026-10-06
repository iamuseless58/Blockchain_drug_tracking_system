import React from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useBlockchain();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-teal-500/40 bg-slate-900/95';
        let Icon = CheckCircle2;
        let iconClass = 'text-teal-400';

        if (toast.type === 'error') {
          borderClass = 'border-red-500/50 bg-slate-950/95 text-red-200';
          Icon = AlertCircle;
          iconClass = 'text-red-400';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/50 bg-slate-950/95 text-amber-200';
          Icon = AlertTriangle;
          iconClass = 'text-amber-400';
        } else if (toast.type === 'info') {
          borderClass = 'border-cyan-500/50 bg-slate-950/95 text-cyan-200';
          Icon = Info;
          iconClass = 'text-cyan-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl shadow-slate-950/80 backdrop-blur-md transition-all animate-in slide-in-from-right duration-300 ${borderClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconClass}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white tracking-wide">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
