'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import { toast } from 'sonner';
import { Activity, ShieldCheck, UserCheck, Stethoscope, Loader2, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = zod.object({
    email: zod.string().email('Please enter a valid email address'),
    password: zod.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { setUser, setToken } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    
    // Default mode is Patient
    const [loginRole, setLoginRole] = useState<'patient' | 'doctor' | 'admin'>('patient');

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (values: LoginFormValues) => {
        setIsLoading(true);
        try {
            const res = await API.post('/auth/login', values);
            const { token, user } = res.data.data;
            
            setToken(token);
            setUser(user);
            
            toast.success(`Welcome back, ${user.name}!`);

            // Redirect based on role
            if (user.role === 'admin') {
                router.push('/admin');
            } else if (user.role === 'doctor') {
                router.push('/doctor');
            } else {
                router.push('/app/chat');
            }
        } catch (err: any) {
            console.error(err);
            const errMsg = err.response?.data?.message || 'Invalid email or password.';
            toast.error(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto fill credentials helper for demo
    const handleQuickFill = (role: 'patient' | 'doctor' | 'admin') => {
        setLoginRole(role);
        let fillEmail = '';
        if (role === 'patient') fillEmail = 'patient@swasthsetu.health';
        else if (role === 'doctor') fillEmail = 'rajesh@swasthsetu.health';
        else fillEmail = 'admin@swasthsetu.health';

        toast.info(`Demo credentials: Email: ${fillEmail} | Password: ${role === 'admin' ? 'admin123' : role === 'doctor' ? 'doctor123' : 'patient123'}`);
    };

    const roleConfig = {
        patient: { icon: UserCheck, label: 'Patient', color: 'from-blue-500 to-blue-600', activeBg: 'bg-blue-50 border-blue-400 text-blue-600', activeRing: 'ring-blue-200' },
        doctor: { icon: Stethoscope, label: 'Doctor', color: 'from-emerald-500 to-emerald-600', activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-600', activeRing: 'ring-emerald-200' },
        admin: { icon: ShieldCheck, label: 'Admin', color: 'from-indigo-500 to-indigo-600', activeBg: 'bg-indigo-50 border-indigo-400 text-indigo-600', activeRing: 'ring-indigo-200' }
    };

    return (
        <div className="flex-1 flex items-center justify-center py-8 px-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-teal-400/15 rounded-full filter blur-3xl -translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full filter blur-3xl translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-purple-300/10 rounded-full filter blur-2xl -translate-x-1/2 -translate-y-1/2" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo and title */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-gradient-to-br from-blue-500 to-teal-500 shadow-lg shadow-blue-200/50 mb-4">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
                    <p className="text-sm text-slate-500 mt-1">Sign in to your SwasthSetu account</p>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6">
                    {/* Role toggle panel */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {(['patient', 'doctor', 'admin'] as const).map(role => {
                            const cfg = roleConfig[role];
                            const isActive = loginRole === role;
                            return (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => handleQuickFill(role)}
                                    className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                                        isActive
                                            ? `${cfg.activeBg} ring-2 ${cfg.activeRing} border-transparent shadow-sm`
                                            : 'border-slate-200 text-slate-500 bg-slate-50/50 hover:bg-slate-100/80'
                                    }`}
                                >
                                    <cfg.icon className="h-4.5 w-4.5" />
                                    {cfg.label}
                                </button>
                            );
                        })}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold text-slate-600">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                {...register('email')}
                                className="bg-slate-50/80 border-slate-200 rounded-xl h-11 text-sm focus:ring-2 focus:ring-blue-200"
                            />
                            {errors.email && (
                                <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold text-slate-600">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                {...register('password')}
                                className="bg-slate-50/80 border-slate-200 rounded-xl h-11 text-sm focus:ring-2 focus:ring-blue-200"
                            />
                            {errors.password && (
                                <p className="text-xs text-rose-500 font-medium">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold rounded-2xl h-12 shadow-lg shadow-blue-200/50 cursor-pointer mt-2 transition-all active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Verifying Account...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Sign In
                                </span>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-5 text-xs text-slate-500">
                    <span>
                        Don't have a patient account?{' '}
                        <Link href="/register" className="font-semibold text-blue-600 hover:underline">
                            Register now
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
}
