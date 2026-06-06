'use client';

import React from 'react';
import { Calendar, Clock, Stethoscope, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/app/StatusBadge';
import { ProfileAvatar } from '@/components/app/ProfileAvatar';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
    app: {
        id: string;
        doctor_name: string;
        doctor_specialization: string;
        appointment_date: string;
        appointment_time: string;
        token_no: number;
        amount: number;
        payment_status: "paid" | "pending" | "cancelled";
        appointment_status: "confirmed" | "pending" | "cancelled" | "completed";
        symptoms?: string;
        doctor_avatar?: string;
    };
    onAction?: (appId: string) => void;
    onViewDetails?: (appId: string) => void;
}

export default function AppointmentCard({ app, onAction, onViewDetails }: AppointmentCardProps) {
    const isPast = app.appointment_status === 'completed' || app.appointment_status === 'cancelled';

    return (
        <div className={cn(
            "glass-card bg-white dark:bg-slate-900 rounded-[1.5rem] p-4 flex flex-col transition-all duration-300",
            isPast ? "opacity-80 border-slate-100 dark:border-slate-800 shadow-none" : "shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"
        )}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                    <ProfileAvatar name={`Dr. ${app.doctor_name}`} src={app.doctor_avatar} size="md" />
                    <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Dr. {app.doctor_name}</h4>
                        <span className="text-xs text-slate-500 font-medium">{app.doctor_specialization}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    <StatusBadge status={app.appointment_status as any} />
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 flex justify-between items-center mb-4 border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                    <div className="bg-white dark:bg-slate-700 p-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600">
                        <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-medium">Date</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{app.appointment_date}</p>
                    </div>
                </div>
                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex items-center gap-2">
                    <div className="bg-white dark:bg-slate-700 p-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600">
                        <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-medium">Time</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{app.appointment_time}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center px-1">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-medium">Token No.</span>
                    <span className="text-lg font-black text-primary leading-tight">#{app.token_no}</span>
                </div>
                
                <div className="flex items-center gap-2">
                    {app.payment_status === 'pending' && onAction && (
                        <Button 
                            size="sm" 
                            onClick={() => onAction(app.id)}
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs px-4 h-9 shadow-md shadow-primary/20"
                        >
                            Pay ₹{app.amount}
                        </Button>
                    )}
                    
                    {onViewDetails && (
                        <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => onViewDetails(app.id)}
                            className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs px-3 h-9"
                        >
                            Details
                            <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
