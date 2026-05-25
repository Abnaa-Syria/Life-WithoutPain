import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { Shield, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function RoleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { can } = useAuth();
  const canManage = can('roles.manage');

  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ['rbac-role', id],
    queryFn: () => api.get(`/admin/rbac/roles/${id}`).then((r) => r.data.data),
    enabled: canManage && !!id,
  });

  const { data: allPermissions, isLoading: permsLoading } = useQuery({
    queryKey: ['rbac-permissions'],
    queryFn: () => api.get('/admin/rbac/permissions').then((r) => r.data.data),
    enabled: canManage,
  });

  const [selected, setSelected] = useState(null);

  React.useEffect(() => {
    if (role?.permissions) {
      setSelected(new Set(role.permissions.map((rp) => rp.permissionId)));
    }
  }, [role]);

  const grouped = useMemo(() => {
    if (!allPermissions) return {};
    return allPermissions.reduce((acc, p) => {
      const mod = p.module || 'other';
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(p);
      return acc;
    }, {});
  }, [allPermissions]);

  const saveMutation = useMutation({
    mutationFn: (permissionIds) =>
      api.put(`/admin/rbac/roles/${id}/permissions`, { permissionIds }),
    onSuccess: () => {
      toast.success(t('rbac.permissions_saved'));
      qc.invalidateQueries(['rbac-role', id]);
      qc.invalidateQueries(['rbac-roles']);
    },
    onError: (err) => toast.error(err.response?.data?.message || t('messages.error')),
  });

  const toggle = (permId) => {
    if (role?.name === 'SUPER_ADMIN') return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const toggleModule = (perms, checked) => {
    if (role?.name === 'SUPER_ADMIN') return;
    setSelected((prev) => {
      const next = new Set(prev);
      perms.forEach((p) => {
        if (checked) next.add(p.id);
        else next.delete(p.id);
      });
      return next;
    });
  };

  if (!canManage) {
    return <div className="p-8 text-center text-slate-500">{t('rbac.no_access')}</div>;
  }

  if (roleLoading || permsLoading || selected === null) {
    return <LoadingSpinner size="lg" />;
  }

  const isSuperAdmin = role?.name === 'SUPER_ADMIN';

  return (
    <div className="space-y-8">
      <PageHeader
        title={role.displayName || role.name}
        breadcrumbs={[
          { label: t('sidebar.dashboard'), path: '/' },
          { label: t('sidebar.roles'), path: '/roles' },
          { label: role.name },
        ]}
      />

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Shield className="text-indigo-500" size={28} />
          <div>
            <h2 className="text-xl font-semibold">{role.displayName}</h2>
            <p className="font-mono text-sm text-slate-500">{role.name}</p>
          </div>
          <Badge variant={role.isSystem ? 'primary' : 'secondary'}>
            {role.isSystem ? t('rbac.system_role') : t('rbac.custom_role')}
          </Badge>
          {isSuperAdmin && (
            <Badge variant="warning">{t('rbac.super_admin_locked')}</Badge>
          )}
        </div>
        {role.description && (
          <p className="text-slate-600 mb-6">{role.description}</p>
        )}
        {!role.isSystem && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            {t('rbac.custom_role_assign_hint')}
          </p>
        )}

        {isSuperAdmin ? (
          <p className="text-slate-500">{t('rbac.super_admin_permissions_note')}</p>
        ) : (
          <>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([module, perms]) => {
                const allChecked = perms.every((p) => selected.has(p.id));
                const someChecked = perms.some((p) => selected.has(p.id));
                return (
                  <div key={module} className="border border-slate-200 rounded-xl p-4">
                    <label className="flex items-center gap-2 font-semibold text-slate-800 mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        ref={(el) => {
                          if (el) el.indeterminate = someChecked && !allChecked;
                        }}
                        onChange={(e) => toggleModule(perms, e.target.checked)}
                      />
                      <span className="capitalize">{module.replace(/\./g, ' / ')}</span>
                      <span className="text-xs font-normal text-slate-400">
                        ({perms.filter((p) => selected.has(p.id)).length}/{perms.length})
                      </span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                      {perms.map((p) => (
                        <label
                          key={p.id}
                          className="flex items-start gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selected.has(p.id)}
                            onChange={() => toggle(p.id)}
                          />
                          <span>
                            <span className="font-mono text-xs text-slate-600">{p.name}</span>
                            {p.description && (
                              <span className="block text-xs text-slate-400">{p.description}</span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t">
              <button
                type="button"
                className="btn btn-primary"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate(Array.from(selected))}
              >
                <Save size={18} />
                {saveMutation.isPending ? t('common.saving') : t('rbac.save_permissions')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/roles')}>
                {t('common.back')}
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
