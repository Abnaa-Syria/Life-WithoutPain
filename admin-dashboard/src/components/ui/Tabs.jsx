import React from 'react';

const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex border-b border-[var(--divider)] mb-8 overflow-x-auto scrollbar-hide gap-1 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-6 py-3.5 text-sidebar font-medium transition-all duration-220 relative min-w-max rounded-xl ${
            activeTab === tab.id
              ? 'text-[var(--primary)] bg-[var(--gradient-nav-active)] shadow-sm border border-[rgba(var(--primary-rgb),0.15)]'
              : 'text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--gradient-soft)]'
          }`}
        >
          <div className="flex items-center gap-2">
            {tab.icon && <tab.icon size={18} />}
            {tab.label}
          </div>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
