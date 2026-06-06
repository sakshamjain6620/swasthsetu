import React from 'react';
import AppHeader from '@/components/app/AppHeader';
import BottomNav from '@/components/app/BottomNav';
import { MobileContainer } from '@/components/app/MobileContainer';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MobileContainer>
            <div className="flex flex-col h-full bg-background relative">
                <AppHeader />
                <main className="flex-1 overflow-y-auto pb-24 px-4 py-4 w-full scrollbar-none">
                    {children}
                </main>
                <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
                    <div className="pointer-events-auto w-full max-w-sm">
                        <BottomNav />
                    </div>
                </div>
            </div>
        </MobileContainer>
    );
}
