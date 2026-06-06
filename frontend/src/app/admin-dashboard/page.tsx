'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Calendar, CreditCard, Stethoscope, Users, 
    AlertTriangle, Bell, TrendingUp, Loader2, IndianRupee, LogOut, ShieldCheck, BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';

export default function AdminOverview() {
    const router = useRouter();
    const { user, token, logout } = useAppStore();
    const [stats, setStats] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadDashboardData = async () => {
        try {
            const [statsRes, revRes] = await Promise.all([
                API.get('/admin/stats'),
                API.get('/admin/revenue')
            ]);
            setStats(statsRes.data.data);
            setRevenueData(revRes.data.data);
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to load dashboard statistics.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token || !user || user.role !== 'admin') {
            toast.error('Unauthorized. Admin access only.');
            router.push('/login');
            return;
        }
        loadDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                        <Loader2 className="h-7 w-7 text-indigo-500 animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-indigo-200/30 animate-ping" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Compiling dashboard metrics...</p>
            </div>
        );
    }

    if (!stats) return null;

    const cardsData = [
        {
            title: "Total Appointments",
            value: stats.totalAppointments,
            desc: "All-time bookings",
            icon: Calendar,
            gradient: "from-blue-500 to-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Total Revenue",
            value: `₹${stats.totalRevenue}`,
            desc: "Collected payments",
            icon: IndianRupee,
            gradient: "from-emerald-500 to-teal-500",
            bg: "bg-emerald-50"
        },
        {
            title: "Active Doctors",
            value: stats.activeDoctors,
            desc: "On-duty clinicians",
            icon: Stethoscope,
            gradient: "from-indigo-500 to-violet-500",
            bg: "bg-indigo-50"
        },
        {
            title: "Emergency Cases",
            value: stats.emergencyCases,
            desc: "Urgent red alerts",
            icon: AlertTriangle,
            gradient: "from-rose-500 to-red-500",
            bg: "bg-rose-50"
        },
        {
            title: "Pending Bills",
            value: stats.pendingPayments,
            desc: "Awaiting checkout",
            icon: CreditCard,
            gradient: "from-amber-500 to-orange-500",
            bg: "bg-amber-50"
        },
        {
            title: "Reminders",
            value: stats.medicineReminders,
            desc: "Notification logs",
            icon: Bell,
            gradient: "from-teal-500 to-cyan-500",
            bg: "bg-teal-50"
        }
    ];

    return (
        <div className="flex-1 space-y-6">
            {/* Gradient Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 p-6 text-white shadow-xl mx-6 mt-6">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="absolute top-12 right-20 w-6 h-6 bg-white/10 rounded-full" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <ShieldCheck className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-[2px] font-bold text-white/50 block">Admin Console</span>
                            <h1 className="text-2xl font-bold leading-tight">SwasthSetu Admin</h1>
                            <p className="text-xs text-blue-100/60 font-medium mt-0.5">Clinical operations & financial overview</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => { logout(); router.push('/login'); }}
                        variant="ghost"
                        className="bg-white/10 hover:bg-white/20 text-white rounded-2xl cursor-pointer border border-white/10 text-xs font-semibold"
                    >
                        <LogOut className="h-4 w-4 mr-1.5" />
                        Sign Out
                    </Button>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 px-6">
                {cardsData.map((card, index) => (
                    <div key={index} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm`}>
                                <card.icon className="h-4 w-4 text-white" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{card.value}</h3>
                        <p className="text-[10px] text-slate-400 font-medium">{card.desc}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6 px-6 pb-8">
                
                {/* Revenue line chart */}
                <Card className="lg:col-span-2 border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                            </div>
                            Revenue Trends
                        </CardTitle>
                        <CardDescription className="text-xs">Daily collection data (last 7 days)</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 h-72">
                        {revenueData.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center gap-2">
                                <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <BarChart3 className="h-7 w-7 text-blue-300" />
                                </div>
                                <p className="text-xs text-slate-400 font-medium">No financial data found yet.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} unit="₹" />
                                    <Tooltip 
                                        contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                        labelStyle={{ fontWeight: 'bold', color: '#1E293B' }}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="url(#colorRevenue)" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#3B82F6" />
                                            <stop offset="100%" stopColor="#14B8A6" />
                                        </linearGradient>
                                    </defs>
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Operations Summary */}
                <Card className="border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <BarChart3 className="h-4 w-4 text-indigo-500" />
                            </div>
                            Efficiency
                        </CardTitle>
                        <CardDescription className="text-xs">Today's operational breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5 text-xs">
                        <div className="space-y-2">
                            <div className="flex justify-between font-semibold">
                                <span className="text-slate-500">Confirmed Bookings</span>
                                <span className="text-slate-800">{stats.confirmedAppointments} / {stats.totalAppointments}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-teal-500 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${stats.totalAppointments > 0 ? (stats.confirmedAppointments / stats.totalAppointments) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between font-semibold">
                                <span className="text-slate-500">Pending Billing</span>
                                <span className="text-slate-800">{stats.pendingPayments} / {stats.totalAppointments}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${stats.totalAppointments > 0 ? (stats.pendingPayments / stats.totalAppointments) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between font-semibold">
                                <span className="text-slate-500">Emergency Cases</span>
                                <span className="text-slate-800">{stats.emergencyCases} Cases</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-rose-500 to-red-500 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${stats.totalAppointments > 0 ? (stats.emergencyCases / stats.totalAppointments) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
