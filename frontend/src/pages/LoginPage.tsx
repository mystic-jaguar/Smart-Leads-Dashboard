import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Shield, Lock, HelpCircle } from 'lucide-react';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.data.user, res.data.data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] dark:bg-gray-950 flex flex-col items-center justify-center p-4"
      style={{ backgroundImage: 'linear-gradient(#d8e0ec 1px, transparent 1px), linear-gradient(90deg, #d8e0ec 1px, transparent 1px)', backgroundSize: '40px 40px' }}>

      {/* Logo + Title */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">SmartLeads CRM</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enterprise Lead Management Portal</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Sign in to your account</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              className={`w-full rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition px-3.5 py-2.5 text-sm ${errors.email ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <button type="button" onClick={() => toast('Password reset: contact your administrator.', { icon: 'ℹ️' })} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition px-3.5 py-2.5 text-sm pr-11 ${errors.password ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" {...register('remember')} />
            <span className="text-sm text-gray-600 dark:text-gray-400">Remember Me</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="border-t border-gray-100 dark:border-gray-700 mt-6 pt-5 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Create an account</Link>
          </p>
        </div>
      </div>

      {/* Footer badges */}
      <div className="flex items-center gap-6 mt-8 text-xs text-gray-400">
        <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Secure SSO</span>
        <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> 256-bit Encrypted</span>
        <span className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> IT Support</span>
      </div>
    </div>
  );
};

export default LoginPage;
