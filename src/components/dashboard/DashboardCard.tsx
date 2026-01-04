import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  children, 
  className = '', 
  title, 
  action 
}) => {
  return (
    <div className={cn(
      'bg-card rounded-xl shadow-sm border border-border p-6 animate-fade-in',
      className
    )}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-6">
          {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default DashboardCard;
