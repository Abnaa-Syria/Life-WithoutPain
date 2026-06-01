import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Activity, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success(t('messages.login_success') || 'Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.login_error') || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute top-0 end-0 w-96 h-96 bg-primary-200/40 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 start-0 w-96 h-96 bg-secondary-200/40 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="fixed top-8 end-8 flex gap-4 z-10">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg">
        <div className="card shadow-[var(--shadow-dropdown)] p-8 md:p-12">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="logo-tile w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Activity size={32} className="text-white" />
            </div>
            <h1 className="text-page-title">
              Life<span className="text-[var(--primary)]">Pain</span>
            </h1>
            <p className="text-body text-[var(--text-muted)] mt-2">
              {t('login.subtitle') || 'Enter your credentials to access the admin panel'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="label">{t('login.email') || 'Email Address'}</label>
              <div className="relative group">
                <Mail className="absolute start-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--primary)]" size={18} />
                <input
                  {...register('email', { 
                    required: t('validation.email_required') || 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: t('validation.invalid_email') || 'Invalid email address' }
                  })}
                  type="email"
                  className={`input ps-12 ${errors.email ? 'border-[var(--danger)] bg-[var(--danger-bg)]' : ''}`}
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && <p className="text-helper text-[var(--danger)] mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="label">{t('login.password') || 'Password'}</label>
                <a href="#" className="text-helper font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
                  {t('login.forgot_password') || 'Forgot password?'}
                </a>
              </div>
              <div className="relative group">
                <Lock className="absolute start-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--primary)]" size={18} />
                <input
                  {...register('password', { required: t('validation.password_required') || 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  className={`input ps-12 pe-12 ${errors.password ? 'border-[var(--danger)] bg-[var(--danger-bg)]' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-helper text-[var(--danger)] mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t('login.submit') || 'Sign In'}
                  <ArrowRight size={18} className="ms-1 group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-[var(--divider)] text-center">
            <p className="text-body text-[var(--text-muted)]">
              {t('login.footer') || 'Advanced Healthcare Admin'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
