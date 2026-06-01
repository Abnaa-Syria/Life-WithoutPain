export default function StatsCard({ title, value, icon: Icon, color = 'primary', subtitle }) {
  const colors = {
    primary: 'bg-[var(--bg-sidebar-active)] text-[var(--primary)]',
    green: 'bg-[var(--success-bg)] text-[var(--success)]',
    yellow: 'bg-[var(--warning-bg)] text-[var(--warning)]',
    red: 'bg-[var(--danger-bg)] text-[var(--danger)]',
    purple: 'bg-[var(--info-bg)] text-[var(--secondary)]',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-body text-[var(--text-muted)]">{title}</p>
          <p className="text-[28px] font-semibold mt-1.5 text-[var(--text-primary)]">{value}</p>
          {subtitle && <p className="text-helper mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-2xl ${colors[color] || colors.primary}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
