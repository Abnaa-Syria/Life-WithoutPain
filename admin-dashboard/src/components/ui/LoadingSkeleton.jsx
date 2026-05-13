import React from 'react';

const LoadingSkeleton = ({ type = 'card', rows = 1 }) => {
  if (type === 'table') {
    return (
      <div className="w-full animate-pulse space-y-4">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="card animate-pulse space-y-4">
        <div className="w-1/3 h-6 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="w-full h-24 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
        <div className="w-1/2 h-4 bg-slate-100 dark:bg-slate-800/50 rounded-md" />
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse h-32" />
        ))}
      </div>
    );
  }

  return <div className="animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl h-20 w-full" />;
};

export default LoadingSkeleton;
