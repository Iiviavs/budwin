import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ProcessItem } from '../types';

interface EndProcessModalProps {
  process: ProcessItem | null;
  onClose: () => void;
  onConfirm: (pid: number) => void;
}

export const EndProcessModal: React.FC<EndProcessModalProps> = ({
  process,
  onClose,
  onConfirm,
}) => {
  if (!process) return null;

  const isProtected = process.category === 'protected';
  const isBackground = process.category === 'background';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        {/* Header Icon */}
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isProtected
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : isBackground
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
            }`}
          >
            {isProtected ? (
              <ShieldAlert className="w-6 h-6" />
            ) : isBackground ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isProtected ? 'Protected System Process' : 'End Process Confirmation'}
            </h3>
            <p className="text-xs text-gray-400">PID: {process.pid}</p>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-background/80 border border-border/80 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Process Name:</span>
            <span className="font-semibold text-white">{process.name}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Memory Used:</span>
            <span className="font-semibold text-white">{process.memoryMb} MB</span>
          </div>
          <div className="flex justify-between items-start text-xs pt-1 border-t border-border/40">
            <span className="text-gray-400">Description:</span>
            <span className="text-gray-300 font-medium text-right max-w-[200px] truncate">
              {process.description || 'Standard Windows Task'}
            </span>
          </div>
        </div>

        {/* Warning message */}
        {isProtected ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-300">
            <strong>⚠️ System Protection Notice:</strong> This process is a core Windows component. Terminating it may cause Windows to restart or freeze. budwin blocks terminating protected processes for your safety.
          </div>
        ) : isBackground ? (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300">
            <strong>Notice:</strong> This is a background service or driver helper. Terminating it may disable peripheral features or background sync until restarted.
          </div>
        ) : (
          <p className="text-xs text-gray-300">
            Are you sure you want to terminate <strong>{process.name}</strong>? Any unsaved data in this app may be lost.
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surfaceHover hover:bg-border text-xs font-semibold text-gray-200 transition-colors"
          >
            {isProtected ? 'Close' : 'Cancel'}
          </button>

          {!isProtected && (
            <button
              onClick={() => {
                onConfirm(process.pid);
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition-all"
            >
              End Process
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
