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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="bg-surface rounded-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-surfaceSubtle flex items-center justify-center text-textSecondary shrink-0">
            {isProtected ? (
              <ShieldAlert className="w-5 h-5 text-textPrimary" />
            ) : isBackground ? (
              <AlertTriangle className="w-5 h-5 text-textSecondary" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-textPrimary" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-textPrimary tracking-tight">
              {isProtected ? 'Protected System Process' : 'Terminate Process'}
            </h3>
            <p className="text-[11px] font-mono text-textTertiary">Process ID: #{process.pid}</p>
          </div>
        </div>

        <div className="bg-surfaceSubtle rounded-xl p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-textSecondary">Binary Name:</span>
            <span className="font-medium text-textPrimary font-mono">{process.name}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-textSecondary">Working Set:</span>
            <span className="font-medium text-textPrimary font-mono tabular-nums">{process.memoryMb.toFixed(0)} MB</span>
          </div>
          <div className="flex justify-between items-start text-xs pt-2">
            <span className="text-textSecondary">Description:</span>
            <span className="text-textPrimary font-normal text-right max-w-[200px] truncate">
              {process.description || 'Application Task'}
            </span>
          </div>
        </div>

        {isProtected ? (
          <div className="bg-surfaceSubtle rounded-xl p-3 text-xs text-textPrimary font-mono">
            This process is an essential operating system component. Protected tasks cannot be terminated to preserve system integrity.
          </div>
        ) : isBackground ? (
          <div className="bg-surfaceSubtle rounded-xl p-3 text-xs text-textSecondary">
            This is a background service. Terminating it may interrupt dependent features until restarted.
          </div>
        ) : (
          <p className="text-xs text-textSecondary leading-relaxed">
            Are you sure you want to end <strong className="text-textPrimary font-medium">{process.name}</strong>? Any unsaved state within this process will be discarded.
          </p>
        )}

        <div className="flex justify-end space-x-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-xs font-medium text-textPrimary transition-all active:scale-[0.96]"
          >
            {isProtected ? 'Dismiss' : 'Cancel'}
          </button>

          {!isProtected && (
            <button
              onClick={() => {
                onConfirm(process.pid);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-textPrimary text-background text-xs font-medium transition-all active:scale-[0.96] hover:opacity-90"
            >
              End Process
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
