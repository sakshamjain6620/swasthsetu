'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Stethoscope, Loader2, Play, Users, Clock, AlertTriangle, ClipboardList, CheckCircle2, Activity, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function DoctorDashboard() {
    const router = useRouter();
    const { user, token, logout } = useAppStore();
    const [queue, setQueue] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadDoctorQueue = async () => {
        try {
            const res = await API.get('/appointments/today');
            setQueue(res.data.data);
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to load doctor patient queue.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token || !user || user.role !== 'doctor') {
            toast.error('Unauthorized access. Doctor access only.');
            router.push('/login');
            return;
        }

        loadDoctorQueue();
    }, [user, token]);

    const getUrgencyBadge = (level: string) => {
        switch (level) {
            case 'emergency':
                return <Badge className="bg-rose-500 hover:bg-rose-500 text-white font-bold text-[10px] uppercase tracking-wider">Emergency</Badge>;
            case 'high':
                return <Badge className="bg-orange-500 hover:bg-orange-500 text-white font-bold text-[10px] uppercase tracking-wider">High</Badge>;
            default:
                return <Badge variant="secondary" className="font-semibold text-[10px] uppercase tracking-wider">{level}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                        <Loader2 className="h-7 w-7 text-emerald-500 animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-emerald-200/30 animate-ping" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Loading token queue...</p>
            </div>
        );
    }

    // Filter queue to show pending vs finished consultations
    const activeQueue = queue.filter(q => q.appointment_status !== 'completed');
    const completedConsultations = queue.filter(q => q.appointment_status === 'completed');

    return (
        <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-6">
            {/* Header info card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 p-6 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="absolute top-12 right-12 w-6 h-6 bg-white/10 rounded-full" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            <Stethoscope className="h-8 w-8" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-[2px] font-bold text-white/60 block">Clinician Portal</span>
                            <h1 className="text-2xl font-bold leading-tight">Dr. {user?.name}</h1>
                            <p className="text-xs text-teal-100/80 font-medium mt-0.5">Department of {user?.specialization}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="text-center bg-white/15 backdrop-blur-sm p-3 rounded-2xl min-w-[90px] border border-white/10">
                            <span className="text-[9px] text-white/60 font-bold uppercase tracking-wider block">Queue</span>
                            <span className="text-2xl font-black">{activeQueue.length}</span>
                        </div>
                        <div className="text-center bg-white/15 backdrop-blur-sm p-3 rounded-2xl min-w-[90px] border border-white/10">
                            <span className="text-[9px] text-white/60 font-bold uppercase tracking-wider block">Done</span>
                            <span className="text-2xl font-black">{completedConsultations.length}</span>
                        </div>
                        <Button
                            onClick={() => { logout(); router.push('/login'); }}
                            variant="ghost"
                            size="icon"
                            className="bg-white/10 hover:bg-white/20 text-white rounded-2xl h-[62px] w-[62px] cursor-pointer border border-white/10"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* In Cabin Patient Alert */}
            {activeQueue.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3 text-center sm:text-left">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-md">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block leading-none mb-1">Next In Cabin</span>
                            <h3 className="font-bold text-base text-slate-800 leading-tight">
                                Token #{activeQueue[0].token_no}: {activeQueue[0].patient_name} ({activeQueue[0].patient_age} yo {activeQueue[0].patient_gender})
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Symptoms: {activeQueue[0].symptoms}</p>
                        </div>
                    </div>
                    <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold cursor-pointer rounded-2xl shadow-lg shadow-emerald-200/50 h-11 px-5">
                        <Link href={`/doctor-dashboard/patient/${activeQueue[0].patient_id}?appId=${activeQueue[0].id}`}>
                            <Play className="h-4 w-4 mr-1.5 fill-white" />
                            Start Consultation
                        </Link>
                    </Button>
                </div>
            )}

            {/* Tab/Table Queue list */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Active Patients Queue */}
                <Card className="md:col-span-2 border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                <ClipboardList className="h-4 w-4 text-blue-500" />
                            </div>
                            Active Queue
                        </CardTitle>
                        <CardDescription className="text-xs">Click to start diagnosing scheduled patients</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {activeQueue.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                                </div>
                                <p className="text-sm font-medium text-slate-500">All consultations completed!</p>
                                <p className="text-xs text-slate-400 mt-0.5">Great work for today.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-slate-50/80">
                                    <TableRow>
                                        <TableHead className="w-16 text-center font-bold text-xs">Token</TableHead>
                                        <TableHead className="font-bold text-xs">Patient Details</TableHead>
                                        <TableHead className="font-bold text-xs">Urgency</TableHead>
                                        <TableHead className="text-right font-bold text-xs">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="text-xs">
                                    {activeQueue.map((app) => (
                                        <TableRow key={app.id} className="hover:bg-slate-50/50">
                                            <TableCell className="text-center">
                                                <span className="inline-flex h-8 w-8 rounded-xl bg-blue-50 items-center justify-center font-black text-blue-600 text-sm">
                                                    {app.token_no}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-bold text-slate-800 block">{app.patient_name}</span>
                                                <span className="text-[10px] text-slate-400 font-semibold">{app.patient_age} Yrs · {app.patient_gender}</span>
                                            </TableCell>
                                            <TableCell>{getUrgencyBadge(app.urgency_level)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white cursor-pointer rounded-xl shadow-sm text-xs h-8">
                                                    <Link href={`/doctor-dashboard/patient/${app.patient_id}?appId=${app.id}`}>
                                                        Diagnose
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Finished list */}
                <Card className="border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </div>
                            Completed
                        </CardTitle>
                        <CardDescription className="text-xs">Today's finished evaluations</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        {completedConsultations.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-8">No patients evaluated yet.</p>
                        ) : (
                            completedConsultations.map((app) => (
                                <div key={app.id} className="p-3.5 border border-slate-100 bg-white rounded-2xl flex items-center justify-between shadow-xs hover:shadow-sm transition-shadow">
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Token #{app.token_no}</span>
                                        <h4 className="font-bold text-xs text-slate-800 mt-0.5">{app.patient_name}</h4>
                                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{app.patient_age} yo {app.patient_gender}</p>
                                    </div>
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] rounded-xl">
                                        ✓ Done
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
