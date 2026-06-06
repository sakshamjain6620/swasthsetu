'use client';

import React, { useState } from 'react';
import API from '@/lib/api';
import { Pill, CheckCircle2, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RoutineItem {
    id: string;
    medicine_name: string;
    dosage: string;
    timing: string;
    routine_date: string;
    routine_time: string;
    status: 'pending' | 'taken' | 'missed' | 'completed';
    instructions?: string;
    before_after_food?: string;
}

interface MedicineRoutineTableProps {
    routines: RoutineItem[];
    onRefresh: () => void;
}

export default function MedicineRoutineTable({ routines, onRefresh }: MedicineRoutineTableProps) {
    const [isLoadingMap, setIsLoadingMap] = useState<Record<string, boolean>>({});

    const handleMarkTaken = async (routineId: string) => {
        setIsLoadingMap(prev => ({ ...prev, [routineId]: true }));
        try {
            await API.put(`/medicines/routine/${routineId}/take`);
            toast.success('Dose logged successfully!');
            onRefresh();
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to log dose. Try again.');
        } finally {
            setIsLoadingMap(prev => ({ ...prev, [routineId]: false }));
        }
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const todaysRoutines = routines.filter(r => r.routine_date === todayStr);
    
    const takenCount = todaysRoutines.filter(r => r.status === 'taken' || r.status === 'completed').length;
    const progress = todaysRoutines.length > 0 ? (takenCount / todaysRoutines.length) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="glass-card bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                            <Pill className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Today's Routine</h3>
                            <p className="text-[11px] font-medium text-slate-500">{takenCount} of {todaysRoutines.length} taken</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xl font-black text-primary">{Math.round(progress)}%</span>
                    </div>
                </div>
                
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-5">
                    <div 
                        className="bg-primary h-full rounded-full transition-all duration-500 ease-in-out" 
                        style={{ width: `${progress}%` }} 
                    />
                </div>

                {todaysRoutines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center gap-2 text-slate-500">
                        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                        <p className="text-xs font-medium">No medicines scheduled for today.<br/>Keep healthy!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todaysRoutines.map((item) => (
                            <div 
                                key={item.id} 
                                className={cn(
                                    "p-3 rounded-2xl border transition-all duration-300 flex items-center gap-4",
                                    item.status === 'taken' || item.status === 'completed'
                                        ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30"
                                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50"
                                )}
                            >
                                <Checkbox
                                    checked={item.status === 'taken' || item.status === 'completed'}
                                    disabled={item.status === 'taken' || item.status === 'completed' || isLoadingMap[item.id]}
                                    onCheckedChange={() => handleMarkTaken(item.id)}
                                    className="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                />
                                <div className="flex-1">
                                    <h4 className={cn(
                                        "font-bold text-sm transition-colors",
                                        item.status === 'taken' || item.status === 'completed' ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-100"
                                    )}>
                                        {item.medicine_name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {item.routine_time}
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                        <span>{item.dosage}</span>
                                        <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                        <span className="text-blue-500">{item.before_after_food}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="glass-card bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-slate-500" />
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">5-Day Course Schedule</h3>
                </div>

                <div className="overflow-x-auto pb-2 scrollbar-none">
                    <div className="min-w-[400px]">
                        <div className="grid grid-cols-5 gap-2 mb-2">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Day 1</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Day 2</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Day 3</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Day 4</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Day 5</div>
                        </div>
                        {/* Mock grid to represent the 5 day table visually as per requirements */}
                        <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map((day) => (
                                <div key={day} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 border border-slate-100 dark:border-slate-700/50 space-y-2">
                                    <div className="flex justify-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>
                                    <div className="flex justify-center"><CheckCircle2 className="h-4 w-4 text-slate-300 dark:text-slate-600" /></div>
                                    <div className="flex justify-center"><CheckCircle2 className="h-4 w-4 text-slate-300 dark:text-slate-600" /></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
