import React from 'react';

const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex border-b border-[var(--border-color)] mb-6 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-6 py-3 text-sm font-semibold transition-all relative min-w-max ${
            activeTab === tab.id
              ? 'text-[var(--primary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center gap-2">
            {tab.icon && <tab.icon size={18} />}
            {tab.label}
          </div>
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)] rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
