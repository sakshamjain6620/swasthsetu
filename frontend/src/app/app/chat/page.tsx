'use client';

import React from 'react';
import AIChatBox from '@/components/AIChatBox';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function AppChatPage() {
    return (
        <div className="flex flex-col h-full">
            {/* Compact header */}
            <div className="mb-4 text-center">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                    <Sparkles className="h-3 w-3" />
                    AI Symptom Booking
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Describe your symptoms naturally. Our AI agent will analyze, recommend specialists, find slots, and book for you.
                </p>
            </div>

            {/* Chat container */}
            <AIChatBox />

            {/* Tip */}
            <div className="mt-3 p-3 rounded-xl border border-blue-100 bg-blue-50/30 dark:bg-blue-950/10 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2 max-w-md mx-auto">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Tip:</span> Try{' '}
                    <span className="font-mono text-blue-600">&quot;Mujhe cough aur chest pain hai&quot;</span> or{' '}
                    <span className="font-mono text-blue-600">&quot;I have fever and sore throat&quot;</span>
                </div>
            </div>
        </div>
    );
}
