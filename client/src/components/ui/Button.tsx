import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyle = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white focus:ring-primary shadow-lg shadow-primary/20',
    secondary: 'bg-surface hover:bg-border text-text focus:ring-border border border-border',
    outline: 'border border-primary text-primary hover:bg-primary/10 focus:ring-primary',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600'
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-8 text-lg'
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
