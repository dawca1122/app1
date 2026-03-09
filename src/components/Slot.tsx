import React from 'react';
import { cn } from '../lib/utils';

interface SlotProps {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  description?: string;
}

export const Slot: React.FC<SlotProps> = ({ title, icon, onClick, className, description }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "slot-container group text-left w-full",
        className
      )}
    >
      <div className="flex flex-col h-full justify-between gap-4">
        <div className="p-3 rounded-2xl bg-electric-purple/10 w-fit group-hover:bg-electric-purple/20 transition-colors">
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-8 h-8 text-electric-purple" }) : icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold tracking-tight mb-2">{title}</h3>
          {description && <p className="opacity-50 text-sm leading-relaxed">{description}</p>}
        </div>
      </div>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
          <span className="text-gold">→</span>
        </div>
      </div>
    </button>
  );
};
