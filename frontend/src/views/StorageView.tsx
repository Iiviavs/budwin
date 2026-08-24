import React from 'react';
import { HardDrive, CheckCircle2, ShieldCheck } from 'lucide-react';
import { DriveItem } from '../types';

interface StorageViewProps {
  drives: DriveItem[];
}

export const StorageView: React.FC<StorageViewProps> = ({ drives }) => {
  return (
    <div className="p-6 space-y-4 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Mounted Storage Drives</h2>
          <p className="text-xs text-gray-400">Real-time drive space & volume capacities</p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>SMART Health OK</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drives.map((drive) => {
          const isHighUsage = drive.percentUsed > 85;

          return (
            <div
              key={drive.letter}
              className="glass-card rounded-2xl p-5 border border-border space-y-4 hover:border-border/80 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-surfaceHover flex items-center justify-center text-sky-400">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Drive {drive.letter}: {drive.name && `(${drive.name})`}
                    </h3>
                    <span className="text-xs text-gray-400">Fixed NTFS Volume</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-white">{drive.freeGb.toFixed(1)} GB</span>
                  <span className="text-xs text-gray-400 block">Free Space</span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-surfaceHover h-3 rounded-full overflow-hidden p-0.5 border border-border/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHighUsage
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : 'bg-gradient-to-r from-sky-500 to-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, drive.percentUsed))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-medium text-gray-400">
                  <span>{drive.usedGb.toFixed(1)} GB Used ({drive.percentUsed.toFixed(1)}%)</span>
                  <span>{drive.totalGb.toFixed(1)} GB Total</span>
                </div>
              </div>

              {/* Status footer */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Healthy</span>
                </div>
                <span>Fast NVMe / SSD</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
