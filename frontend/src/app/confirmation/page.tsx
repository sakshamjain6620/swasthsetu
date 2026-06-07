'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import API from '@/lib/api';
import {
  CheckCircle,
  MapPin,
  Activity,
  CalendarPlus,
  LayoutDashboard,
  Sparkles,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('id');

  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!appointmentId) {
      router.push('/');
      return;
    }

    const fetchAppointment = async () => {
      try {
        const res = await API.get(`/appointments/${appointmentId}`);
        setAppointment(res.data.data);
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load appointment details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
            <Activity className="h-7 w-7 text-emerald-500 animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full bg-emerald-200/30 animate-ping" />
        </div>
        <p className="text-sm text-slate-500 font-medium">
          Retrieving booking receipt...
        </p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
        <div className="h-16 w-16 rounded-3xl bg-rose-50 flex items-center justify-center">
          <Activity className="h-8 w-8 text-rose-400" />
        </div>
        <p className="text-rose-500 font-bold text-sm">
          Appointment details not found.
        </p>
        <Button asChild variant="outline" className="rounded-2xl cursor-pointer mt-2">
          <Link href="/app/chat">Go Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 container mx-auto px-4 py-8 max-w-md flex flex-col justify-center">
      {/* Success Animation Header */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
            <PartyPopper className="h-4 w-4 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mt-4">
          Booking Confirmed!
        </h1>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mt-2">
          <Sparkles className="h-3 w-3" />
          Payment Successful
        </span>
      </div>

      {/* Token Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-teal-500 p-6 rounded-3xl text-white text-center shadow-xl mb-5">
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[3px] text-blue-100/70 block mb-1">
            Queue Ticket
          </span>

          <h2 className="text-6xl font-black mb-0.5 drop-shadow-sm">
            {appointment.token_no || '---'}
          </h2>

          <span className="text-xs font-semibold uppercase tracking-wider block text-teal-100/80">
            Token Number
          </span>

          <div className="border-t border-white/20 mt-4 pt-3 grid grid-cols-2 gap-3 text-xs text-blue-50">
            <div>
              <span className="block text-blue-100/60 font-medium text-[10px] uppercase tracking-wider">
                Consultant
              </span>
              <span className="font-bold text-white">
                Dr. {appointment.doctor_name || 'Assigned'}
              </span>
            </div>

            <div>
              <span className="block text-blue-100/60 font-medium text-[10px] uppercase tracking-wider">
                Slot Time
              </span>
              <span className="font-bold text-white">
                {appointment.appointment_time || 'Selected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 space-y-4 mb-5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Consultation Details
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
              Patient Name
            </span>
            <span className="text-sm font-bold text-slate-800">
              {appointment.patient_name || 'Patient'}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
              Date
            </span>
            <span className="text-sm font-bold text-slate-800">
              {appointment.appointment_date || 'Selected date'}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
              Receipt ID
            </span>
            <span className="font-mono text-xs font-semibold text-slate-600">
              {appointment.id ? `${String(appointment.id).slice(0, 13)}...` : 'N/A'}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
              Razorpay ID
            </span>
            <span className="font-mono text-xs font-semibold text-slate-600">
              {appointment.razorpay_order_id || 'N/A'}
            </span>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="h-4 w-4 text-blue-500" />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block">
                Clinic Address
              </span>
              <span className="text-[11px] text-slate-500">
                SwasthSetu Clinic, 123 Healthcare Avenue, Medical District, Mumbai - 400001
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
              <CalendarPlus className="h-4 w-4 text-emerald-500" />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block">
                WhatsApp Notification Sent
              </span>
              <span className="text-[11px] text-slate-500">
                A mock receipt message with your token number has been sent to +91 98765 98765.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          asChild
          variant="outline"
          className="flex-1 cursor-pointer rounded-2xl h-12 border-slate-200 font-semibold"
        >
          <Link href="/app/chat">Book Another</Link>
        </Button>

        <Button
          asChild
          className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white cursor-pointer rounded-2xl h-12 shadow-lg shadow-blue-200/50 font-semibold"
        >
          <Link href="/app/home" className="flex items-center justify-center gap-1.5">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <Activity className="h-7 w-7 text-emerald-500 animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full bg-emerald-200/30 animate-ping" />
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Loading confirmation...
          </p>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}