'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import AppointmentCard from '@/components/AppointmentCard';
import MedicalFileCard from '@/components/MedicalFileCard';
import PrescriptionCard from '@/components/PrescriptionCard';
import MedicineRoutineTable from '@/components/MedicineRoutineTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
    Calendar, Clipboard, FileSpreadsheet, Activity, Pill, CreditCard, 
    MessageSquare, User, Loader2, Phone, UserCheck 
} from 'lucide-react';
import { toast } from 'sonner';

export default function PatientDashboard() {
    const router = useRouter();
    const { user, token } = useAppStore();
    const [patientFile, setPatientFile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadPatientFile = async () => {
        if (!user) return;
        try {
            const res = await API.get(`/patients/${user.id}/file`);
            setPatientFile(res.data.data);
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to load patient medical file.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token || !user) {
            toast.error('Unauthorized access. Please login first.');
            router.push('/login');
            return;
        }

        loadPatientFile();
    }, [user, token]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-sm text-slate-500">Retrieving patient digital folder...</p>
            </div>
        );
    }

    if (!patientFile) {
        return (
            <div className="flex-grow flex items-center justify-center">
                <p className="text-rose-500 font-bold">Failed to load dashboard profile.</p>
            </div>
        );
    }

    const { patient, appointments, medicalRecords, prescriptions, medicineRoutines, payments, reminders } = patientFile;

    // Filter upcoming vs past appointments
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingApps = appointments.filter((app: any) => 
        app.appointment_date >= todayStr && 
        (app.appointment_status === 'confirmed' || app.appointment_status === 'pending')
    );
    const pastApps = appointments.filter((app: any) => 
        app.appointment_date < todayStr || app.appointment_status === 'completed' || app.appointment_status === 'cancelled'
    );

    return (
        <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-8">
            {/* Patient Greeting & Details */}
            <div className="p-6 rounded-2xl border bg-white/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-xl font-bold font-sans">
                        {patient.name.split(' ').map((n: any) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Patient Folder</span>
                        <h1 className="text-2xl font-bold text-slate-800 leading-tight">{patient.name}</h1>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5 text-slate-400" />
                                {patient.age} Yrs old • {patient.gender}
                            </span>
                            <span className="flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                {patient.phone}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 flex gap-3">
                    <Button asChild className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-medium shadow-md cursor-pointer select-none">
                        <Link href="/chat" className="flex items-center gap-1.5">
                            <MessageSquare className="h-4 w-4" />
                            AI Chat Booking
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Dashboard Tabs content */}
            <Tabs defaultValue="appointments" className="w-full">
                <TabsList className="grid grid-cols-5 h-12 bg-slate-100 p-1 rounded-xl mb-6">
                    <TabsTrigger value="appointments" className="rounded-lg text-xs font-semibold py-2 flex items-center gap-1 cursor-pointer">
                        <Calendar className="h-3.5 w-3.5" />
                        Visits
                    </TabsTrigger>
                    <TabsTrigger value="routines" className="rounded-lg text-xs font-semibold py-2 flex items-center gap-1 cursor-pointer">
                        <Pill className="h-3.5 w-3.5" />
                        Medicines
                    </TabsTrigger>
                    <TabsTrigger value="records" className="rounded-lg text-xs font-semibold py-2 flex items-center gap-1 cursor-pointer">
                        <Clipboard className="h-3.5 w-3.5" />
                        Medical File
                    </TabsTrigger>
                    <TabsTrigger value="prescriptions" className="rounded-lg text-xs font-semibold py-2 flex items-center gap-1 cursor-pointer">
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        Rx list
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="rounded-lg text-xs font-semibold py-2 flex items-center gap-1 cursor-pointer">
                        <CreditCard className="h-3.5 w-3.5" />
                        Bills
                    </TabsTrigger>
                </TabsList>

                {/* Tab content panels */}
                <TabsContent value="appointments" className="space-y-6">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg mb-3">Upcoming Schedules</h3>
                        {upcomingApps.length === 0 ? (
                            <div className="p-8 border rounded-2xl text-center bg-white/50 text-slate-500 text-sm">
                                No upcoming consultations booked. Feel free to schedule one using our AI chat.
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {upcomingApps.map((app: any) => (
                                    <AppointmentCard key={app.id} app={app} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-800 text-lg mb-3">Past History</h3>
                        {pastApps.length === 0 ? (
                            <div className="p-8 border rounded-2xl text-center bg-white/50 text-slate-500 text-xs">
                                No previous visits logged.
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {pastApps.map((app: any) => (
                                    <AppointmentCard key={app.id} app={app} />
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="routines">
                    <MedicineRoutineTable routines={medicineRoutines} onRefresh={loadPatientFile} />
                </TabsContent>

                <TabsContent value="records" className="space-y-4">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="font-bold text-slate-800 text-lg">Digital Medical Folder</h3>
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none font-semibold">
                            {medicalRecords.length} Documents
                        </Badge>
                    </div>

                    {medicalRecords.length === 0 ? (
                        <div className="p-8 border rounded-2xl text-center bg-white/50 text-slate-500 text-sm">
                            Your medical records folder is currently empty. Visit reports will appear here once saved by your consultant doctor.
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {medicalRecords.map((rec: any) => (
                                <MedicalFileCard key={rec.id} record={rec} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="prescriptions" className="space-y-4">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="font-bold text-slate-800 text-lg">Active & Past Prescriptions</h3>
                        <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-50 border-none font-semibold">
                            {prescriptions.length} Records
                        </Badge>
                    </div>

                    {prescriptions.length === 0 ? (
                        <div className="p-8 border rounded-2xl text-center bg-white/50 text-slate-500 text-sm">
                            No prescriptions found.
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {prescriptions.map((pres: any) => (
                                <PrescriptionCard key={pres.id} prescription={pres} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg mb-3">Billing & Invoices</h3>
                    {payments.length === 0 ? (
                        <div className="p-8 border rounded-2xl text-center bg-white/50 text-slate-500 text-sm">
                            No transactions records found.
                        </div>
                    ) : (
                        <div className="rounded-2xl border overflow-hidden bg-white/75 shadow-xs">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="text-xs font-bold text-slate-600">Date</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-600">Consultant</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-600">Order ID</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-600">Amount</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-600 text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="text-xs">
                                    {payments.map((p: any) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-semibold text-slate-800">Dr. {p.doctor_name}</TableCell>
                                            <TableCell className="font-mono text-slate-500">{p.razorpay_order_id}</TableCell>
                                            <TableCell className="font-bold text-slate-800">₹{p.amount}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge className={
                                                    p.payment_status === 'paid'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50'
                                                }>
                                                    {p.payment_status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
