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
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="fixed top-8 right-8 flex gap-4 z-10">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
        <div className="card shadow-2xl p-8 md:p-12">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/30 mb-6 transform hover:rotate-12 transition-transform duration-300">
              <Activity size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Life<span className="text-indigo-600">Pain</span>
            </h1>
            <p className="text-[var(--text-muted)] mt-2">
              {t('login.subtitle') || 'Enter your credentials to access the admin panel'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="label">{t('login.email') || 'Email Address'}</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-indigo-600" size={18} />
                <input
                  {...register('email', { 
                    required: t('validation.email_required') || 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: t('validation.invalid_email') || 'Invalid email address' }
                  })}
                  type="email"
                  className={`input pl-12 h-12 ${errors.email ? 'border-red-500 bg-red-50/10' : ''}`}
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="label">{t('login.password') || 'Password'}</label>
                <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                  {t('login.forgot_password') || 'Forgot password?'}
                </a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-indigo-600" size={18} />
                <input
                  {...register('password', { required: t('validation.password_required') || 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  className={`input pl-12 pr-12 h-12 ${errors.password ? 'border-red-500 bg-red-50/10' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full h-12 text-base shadow-lg shadow-indigo-600/20 group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t('login.submit') || 'Sign In'}
                  <ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-[var(--border-color)] text-center">
            <p className="text-sm text-[var(--text-muted)]">
              {t('login.footer') || 'Orbex Systems • Advanced Healthcare Admin'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
