
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  className?: string;
  asLink?: boolean;
  noLink?: boolean; // Adding the missing noLink prop
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  withText = true,
  className = '',
  asLink = true,
  noLink = false // Adding default value
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16'
  };

  const content = (
    <>
      <img 
        src="/lovable-uploads/bd0c9938-869e-417d-8441-834fe7445b8b.png" 
        alt="MakeMentors.io Logo" 
        className={`${sizeClasses[size]}`}
      />
      {withText && (
        <span className={`font-bold text-lime-400 ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : size === 'lg' ? 'text-2xl' : 'text-3xl'}`}>
          MakeMentors.io
        </span>
      )}
    </>
  );

  // Use noLink prop for backwards compatibility
  return (noLink || !asLink) ? (
    <div className={cn(`flex items-center gap-2`, className)}>
      {content}
    </div>
  ) : (
    <Link to="/" className={cn(`flex items-center gap-2`, className)}>
      {content}
    </Link>
  );
};

export default Logo;
