import React from 'react';

const skeletonBase = 'bg-[var(--surface-secondary)] rounded-xl';

const LoadingSkeleton = ({ type = 'card', rows = 1 }) => {
  if (type === 'table') {
    return (
      <div className={`w-full animate-pulse space-y-4`}>
        <div className={`h-12 ${skeletonBase}`} />
        {[...Array(rows)].map((_, i) => (
          <div key={i} className={`h-16 ${skeletonBase} opacity-80`} />
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="card animate-pulse space-y-4">
        <div className={`w-1/3 h-6 ${skeletonBase}`} />
        <div className={`w-full h-24 ${skeletonBase} opacity-80`} />
        <div className={`w-1/2 h-4 ${skeletonBase} opacity-80`} />
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`card animate-pulse h-36 ${skeletonBase}`} />
        ))}
      </div>
    );
  }

  return <div className={`animate-pulse ${skeletonBase} h-20 w-full`} />;
};

export default LoadingSkeleton;
