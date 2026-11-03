import React from 'react';

/**
 * Reusable Button component styled with VideoTube's purple light theme.
 * Variants:
 * - 'primary': Solid purple (#7C3AED) with white text.
 * - 'secondary': Light grey surface (#F8FAFC) with dark text, hover light purple (#EDE9FE).
 * - 'outline': Border with purple text.
 * - 'ghost': Transparent with hover light purple (#EDE9FE).
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
    icon: 'p-2 rounded-full',
  };

  const variantStyles = {
    primary: 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-sm',
    secondary: 'bg-[#F8FAFC] hover:bg-[#EDE9FE] text-[#0F172A] border border-slate-200',
    outline: 'border border-[#7C3AED] text-[#7C3AED] hover:bg-[#EDE9FE]',
    ghost: 'text-[#0F172A] hover:bg-[#EDE9FE] hover:text-[#7C3AED]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />}
      {children}
    </button>
  );
}
