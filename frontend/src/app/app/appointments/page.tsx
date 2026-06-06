'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import AppointmentCard from '@/components/AppointmentCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Calendar, Clock, Loader2, MessageSquare, Plus, Stethoscope, CheckCircle2, XCircle,
    CalendarCheck, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function AppAppointmentsPage() {
    const router = useRouter();
    const { user, token } = useAppStore();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token || !user) {
            router.push('/login');
            return;
        }
        loadAppointments();
    }, [user, token]);

    const loadAppointments = async () => {
        if (!user) return;
        try {
            const res = await API.get(`/patients/${user.id}/file`);
            setAppointments(res.data.data.appointments || []);
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to load appointments.');
        } finally {
            setIsLoading(false);
        }
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = appointments.filter((a) =>
        a.appointment_date >= todayStr &&
        (a.appointment_status === 'confirmed' || a.appointment_status === 'pending')
    );
    const completed = appointments.filter((a) => a.appointment_status === 'completed');
    const cancelled = appointments.filter((a) => a.appointment_status === 'cancelled');

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                        <Loader2 className="h-7 w-7 text-blue-500 animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-blue-200/30 animate-ping" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Loading appointments...</p>
            </div>
        );
    }

    const renderEmpty = (icon: React.ReactNode, message: string, sub: string) => (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center mb-4 shadow-sm">
                {icon}
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">{message}</p>
            <p className="text-xs text-slate-400 max-w-[240px]">{sub}</p>
        </div>
    );

    return (
        <div className="space-y-5 pb-6">
            {/* Gradient Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-teal-500 p-5 text-white shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <CalendarCheck className="h-5 w-5 text-white/80" />
                            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">My Appointments</span>
                        </div>
                        <h2 className="text-xl font-bold">Your Visits</h2>
                        <p className="text-xs text-white/70 mt-1">{appointments.length} total · {upcoming.length} upcoming</p>
                    </div>
                    <Button asChild size="sm" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-xs border border-white/20 rounded-2xl shadow-md cursor-pointer">
                        <Link href="/app/chat">
                            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                            Book via AI
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                    <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-1.5">
                        <Clock className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-lg font-bold text-slate-800">{upcoming.length}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Upcoming</p>
                </div>
                <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                    <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-lg font-bold text-slate-800">{completed.length}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Completed</p>
                </div>
                <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                    <div className="h-8 w-8 rounded-xl bg-rose-50 flex items-center justify-center mx-auto mb-1.5">
                        <XCircle className="h-4 w-4 text-rose-400" />
                    </div>
                    <p className="text-lg font-bold text-slate-800">{cancelled.length}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Cancelled</p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid grid-cols-3 h-11 bg-slate-100/80 p-1 rounded-2xl">
                    <TabsTrigger value="upcoming" className="rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Clock className="h-3 w-3" />
                        Upcoming
                        {upcoming.length > 0 && (
                            <Badge className="h-4 min-w-4 px-1 text-[9px] bg-blue-500 text-white border-0 ml-0.5">{upcoming.length}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <CheckCircle2 className="h-3 w-3" />
                        Done
                    </TabsTrigger>
                    <TabsTrigger value="cancelled" className="rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <XCircle className="h-3 w-3" />
                        Cancelled
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-4 space-y-3">
                    {upcoming.length === 0
                        ? renderEmpty(
                              <Stethoscope className="h-9 w-9 text-blue-300" />,
                              'No upcoming appointments',
                              'Use our AI Chat to book your next consultation with a specialist.'
                          )
                        : upcoming.map((app) => <AppointmentCard key={app.id} app={app} />)
                    }
                </TabsContent>

                <TabsContent value="completed" className="mt-4 space-y-3">
                    {completed.length === 0
                        ? renderEmpty(
                              <CheckCircle2 className="h-9 w-9 text-emerald-300" />,
                              'No completed visits yet',
                              'Your finished consultations and visit summaries will appear here.'
                          )
                        : completed.map((app) => <AppointmentCard key={app.id} app={app} />)
                    }
                </TabsContent>

                <TabsContent value="cancelled" className="mt-4 space-y-3">
                    {cancelled.length === 0
                        ? renderEmpty(
                              <XCircle className="h-9 w-9 text-rose-300" />,
                              'No cancelled appointments',
                              'Good news! You haven\'t cancelled any appointments.'
                          )
                        : cancelled.map((app) => <AppointmentCard key={app.id} app={app} />)
                    }
                </TabsContent>
            </Tabs>
        </div>
    );
}
