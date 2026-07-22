import { type HTMLAttributes } from 'react';

export const Card: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`glass rounded-xl ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-4 border-b border-border ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ className = '', children, ...props }) => (
  <h3 className={`text-lg font-semibold text-text ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-4 border-t border-border bg-surface/50 rounded-b-xl ${className}`} {...props}>
    {children}
  </div>
);
