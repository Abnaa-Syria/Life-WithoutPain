import React, { useState } from 'react';

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const sizeMap = {
    sm: 'w-8 h-8 text-helper',
    md: 'w-10 h-10 text-body',
    lg: 'w-12 h-12 text-body',
    xl: 'w-16 h-16 text-card-title',
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
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-xl object-cover border border-[var(--border-color)]"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full rounded-xl bg-[var(--bg-sidebar-active)] text-[var(--primary)] flex items-center justify-center font-semibold border border-[rgba(var(--primary-rgb),0.25)]">
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar;
