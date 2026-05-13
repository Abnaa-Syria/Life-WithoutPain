import React from 'react';

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '?';

  return (
    <div className={`relative shrink-0 ${sizeMap[size]} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-xl object-cover border border-[var(--border-color)]"
        />
      ) : (
        <div className="w-full h-full rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-200 dark:border-indigo-800">
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar;
