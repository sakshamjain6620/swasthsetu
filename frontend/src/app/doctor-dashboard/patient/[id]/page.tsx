'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Plus, Trash2, ShieldAlert, FileText, Pill, Save, Clipboard } from 'lucide-react';
import { toast } from 'sonner';

interface MedicineRow {
    medicineName: string;
    dosage: string;
    timing: string;
    durationDays: number;
    beforeAfterFood: string;
    startDate: string;
}

export default function PatientDiagnosisPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const patientId = params.id;
    const appointmentId = searchParams.get('appId');

    const { user, token } = useAppStore();
    const [patientFile, setPatientFile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form states
    const [diagnosis, setDiagnosis] = useState('');
    const [doctorNotes, setDoctorNotes] = useState('');
    const [followUpAdvice, setFollowUpAdvice] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');

    // Prescription list state
    const [medicines, setMedicines] = useState<MedicineRow[]>([]);
    
    // Inline Add Medicine States
    const [medName, setMedName] = useState('');
    const [medDose, setMedDose] = useState('1 tablet');
    const [medTiming, setMedTiming] = useState('Morning and Evening');
    const [medFood, setMedFood] = useState('After Food');
    const [medDuration, setMedDuration] = useState('5');

    const loadPatientFile = async () => {
        try {
            const res = await API.get(`/patients/${patientId}/file`);
            setPatientFile(res.data.data);
            
            // prefill symptoms if any appointment links
            const currentApp = res.data.data.appointments.find((a: any) => a.id === appointmentId);
            if (currentApp) {
                setDiagnosis(currentApp.symptoms || '');
            }
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to load patient history file.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token || !user || user.role !== 'doctor') {
            toast.error('Unauthorized access.');
            router.push('/login');
            return;
        }

        loadPatientFile();
    }, [patientId, appointmentId]);

    const handleAddMedicine = () => {
        if (!medName.trim()) {
            toast.warning('Please enter a medicine name');
            return;
        }

        const newMed: MedicineRow = {
            medicineName: medName.trim(),
            dosage: medDose,
            timing: medTiming,
            durationDays: Number(medDuration || 5),
            beforeAfterFood: medFood,
            startDate: new Date().toISOString().split('T')[0]
        };

        setMedicines([...medicines, newMed]);
        setMedName(''); // Clear input
        toast.success(`${newMed.medicineName} added to prescription list.`);
    };

    const handleRemoveMedicine = (index: number) => {
        const list = [...medicines];
        list.splice(index, 1);
        setMedicines(list);
    };

    const handleSaveConsultation = async () => {
        if (!diagnosis.trim()) {
            toast.warning('Diagnosis / Clinical Summary is required');
            return;
        }

        setIsSaving(true);
        try {
            const currentApp = patientFile.appointments.find((a: any) => a.id === appointmentId);
            const symptomsText = currentApp ? currentApp.symptoms : 'Routine Evaluation';

            // 1. Post Medical Record (Visit summary)
            await API.post('/medical-records', {
                patientId,
                appointmentId,
                symptoms: symptomsText,
                diagnosis,
                doctorNotes,
                visitSummary: `Clinician: Dr. ${user?.name} | Speciality: ${user?.specialization}`,
                followUpAdvice
            });

            // 2. Post Prescription and medicines if any added
            if (medicines.length > 0) {
                await API.post('/prescriptions', {
                    patientId,
                    appointmentId,
                    diagnosis,
                    instructions: doctorNotes || 'Take medications as directed.',
                    followUpDate: followUpDate || null,
                    medicines
                });
            }

            toast.success('Consultation file locked and WhatsApp notification queued.');
            router.push('/doctor-dashboard');
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to lock consultation file.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                <p className="text-sm text-slate-500">Retrieving patient digital folder...</p>
            </div>
        );
    }

    if (!patientFile) {
        return (
            <div className="flex-grow flex items-center justify-center">
                <p className="text-rose-500 font-bold">Failed to load patient profile.</p>
            </div>
        );
    }

    const { patient, appointments, medicalRecords } = patientFile;
    const currentApp = appointments.find((a: any) => a.id === appointmentId);

    return (
        <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/doctor-dashboard')} className="rounded-full select-none cursor-pointer">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">In-Cabin Diagnosing: {patient.name}</h1>
                    <p className="text-xs text-slate-500">{patient.age} Yrs • {patient.gender} • Emergency Contact: {patient.emergency_contact || 'N/A'}</p>
                </div>
            </div>

            {/* Main panels */}
            <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Left Panel: Symptoms and previous history */}
                <div className="space-y-6">
                    {/* Symptoms block */}
                    {currentApp && (
                        <Card className="border-none bg-rose-500/5 shadow-xs">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-700">
                                    <ShieldAlert className="h-4 w-4" />
                                    AI Symptom Diagnosis Context
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs space-y-3">
                                <div>
                                    <span className="font-bold text-slate-700 block">Symptom Description:</span>
                                    <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 mt-1 leading-relaxed">
                                        "{currentApp.symptoms}"
                                    </p>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-700 block">Urgency Classification:</span>
                                    <span className="text-[10px] uppercase font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md mt-1 inline-block">
                                        {currentApp.urgency_level}
                                    </span>
                                </div>
                                {currentApp.ai_summary && (
                                    <div>
                                        <span className="font-bold text-slate-700 block">AI Engine Aggregated Summary:</span>
                                        <p className="text-slate-500 leading-relaxed mt-1 text-[11px]">
                                            {currentApp.ai_summary}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Medical File history */}
                    <Card className="border-none bg-white/70 shadow-md">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Clipboard className="h-4 w-4 text-blue-500" />
                                Previous Visits History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 max-h-[300px] overflow-y-auto space-y-3">
                            {medicalRecords.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-6">No previous visit records found.</p>
                            ) : (
                                medicalRecords.map((mr: any) => (
                                    <div key={mr.id} className="p-3 bg-white border rounded-xl space-y-1.5 text-xs shadow-xs">
                                        <div className="flex justify-between font-bold text-slate-800 text-[10px] text-slate-500 border-b pb-1">
                                            <span>Dr. {mr.doctor_name}</span>
                                            <span>{new Date(mr.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="font-semibold text-emerald-600 text-[11px]">{mr.diagnosis}</p>
                                        {mr.doctor_notes && <p className="text-[10px] text-slate-500 leading-relaxed italic">"{mr.doctor_notes}"</p>}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Active Prescription and Diagnosis forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Diagnosis & clinical notes form */}
                    <Card className="glass-card border-none bg-white/70 shadow-lg">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-emerald-600" />
                                Diagnosis & Clinical Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="diagnosis">Primary Clinical Diagnosis *</Label>
                                <Input 
                                    id="diagnosis" 
                                    value={diagnosis} 
                                    onChange={(e) => setDiagnosis(e.target.value)} 
                                    placeholder="e.g. Acute Viral Bronchitis, Contact Dermatitis" 
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="notes">Clinical Evaluation / Doctor Notes</Label>
                                <Textarea 
                                    id="notes" 
                                    value={doctorNotes} 
                                    onChange={(e) => setDoctorNotes(e.target.value)} 
                                    placeholder="Describe clinical findings, chest auscultation, throat congestion, patient history, etc." 
                                    rows={3}
                                    className="bg-white text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="advice">Follow-Up Advice & Restrictive Instructions</Label>
                                    <Input 
                                        id="advice" 
                                        value={followUpAdvice} 
                                        onChange={(e) => setFollowUpAdvice(e.target.value)} 
                                        placeholder="e.g. Bed rest for 3 days, drink lukewarm water" 
                                        className="bg-white text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="followUpDate">Next Follow-Up Date</Label>
                                    <Input 
                                        id="followUpDate" 
                                        type="date"
                                        value={followUpDate} 
                                        onChange={(e) => setFollowUpDate(e.target.value)} 
                                        className="bg-white text-xs"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prescription schedule builder */}
                    <Card className="glass-card border-none bg-white/70 shadow-lg">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Pill className="h-4 w-4 text-blue-500" />
                                Prescription Routine Builder
                            </CardTitle>
                            <CardDescription>Add medicines to compile prescription logs and schedule dosage routines</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            
                            {/* Medicine inputs grid */}
                            <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="md:col-span-2 space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-slate-500">Medicine Name</Label>
                                    <Input 
                                        value={medName} 
                                        onChange={(e) => setMedName(e.target.value)} 
                                        placeholder="e.g. Paracetamol 650mg" 
                                        className="h-9 text-xs bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-slate-500">Dosage</Label>
                                    <Select value={medDose} onValueChange={(v) => setMedDose(v || '')}>
                                        <SelectTrigger className="h-9 text-xs bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="text-xs">
                                            <SelectItem value="1 tablet">1 tablet</SelectItem>
                                            <SelectItem value="1/2 tablet">1/2 tablet</SelectItem>
                                            <SelectItem value="2 tablets">2 tablets</SelectItem>
                                            <SelectItem value="5 ml">5 ml</SelectItem>
                                            <SelectItem value="10 ml">10 ml</SelectItem>
                                            <SelectItem value="1 puff">1 puff</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-slate-500">Timing</Label>
                                    <Select value={medTiming} onValueChange={(v) => setMedTiming(v || '')}>
                                        <SelectTrigger className="h-9 text-xs bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="text-xs">
                                            <SelectItem value="Morning and Evening">Morning & Evening</SelectItem>
                                            <SelectItem value="Morning, Afternoon and Evening">Morning, Afternoon & Evening</SelectItem>
                                            <SelectItem value="Morning Only">Morning Only</SelectItem>
                                            <SelectItem value="Evening Only">Evening Only</SelectItem>
                                            <SelectItem value="Night Only">Night Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-slate-500">Food Instruction</Label>
                                    <Select value={medFood} onValueChange={(v) => setMedFood(v || '')}>
                                        <SelectTrigger className="h-9 text-xs bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="text-xs">
                                            <SelectItem value="After Food">After Food</SelectItem>
                                            <SelectItem value="Before Food">Before Food</SelectItem>
                                            <SelectItem value="With Food">With Food</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-slate-500">Duration (Days)</Label>
                                    <Input 
                                        type="number"
                                        value={medDuration} 
                                        onChange={(e) => setMedDuration(e.target.value)} 
                                        placeholder="5" 
                                        className="h-9 text-xs bg-white"
                                    />
                                </div>
                                <div className="md:col-span-4" /> {/* spacer */}
                                <Button 
                                    type="button" 
                                    onClick={handleAddMedicine} 
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Rx
                                </Button>
                            </div>

                            {/* Added medicines table */}
                            {medicines.length > 0 && (
                                <div className="rounded-xl border overflow-hidden bg-white">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow>
                                                <TableHead className="text-xs font-bold text-slate-600">Medicine</TableHead>
                                                <TableHead className="text-xs font-bold text-slate-600">Dose</TableHead>
                                                <TableHead className="text-xs font-bold text-slate-600">Timing</TableHead>
                                                <TableHead className="text-xs font-bold text-slate-600">Instruction</TableHead>
                                                <TableHead className="text-xs font-bold text-slate-600">Days</TableHead>
                                                <TableHead className="w-12 text-right"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="text-xs">
                                            {medicines.map((med, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-bold text-slate-800">{med.medicineName}</TableCell>
                                                    <TableCell>{med.dosage}</TableCell>
                                                    <TableCell>{med.timing}</TableCell>
                                                    <TableCell className="text-blue-600 font-semibold">{med.beforeAfterFood}</TableCell>
                                                    <TableCell>{med.durationDays} Days</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => handleRemoveMedicine(index)}
                                                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 select-none cursor-pointer"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {/* Action block */}
                            <div className="border-t pt-5 flex justify-end gap-3">
                                <Button 
                                    onClick={handleSaveConsultation} 
                                    disabled={isSaving}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-6 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Locking Case...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Lock Case & Sign Rx
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
