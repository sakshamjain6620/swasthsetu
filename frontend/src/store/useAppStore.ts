import { create } from 'zustand';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'patient' | 'doctor' | 'admin';
    doctorId?: string;
    specialization?: string;
    phone?: string;
}

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
    actionHint?: string;
    data?: any;
}

interface BookingState {
    symptoms: string;
    urgency: string;
    specialization: string;
    recommendedDoctors: any[];
    selectedDoctor: any | null;
    selectedDate: string; // YYYY-MM-DD
    selectedSlot: string; // HH:MM
    patientForm: {
        name: string;
        age: string;
        gender: string;
        phone: string;
        email: string;
        address: string;
        emergencyContact: string;
    } | null;
    pendingAppointment: any | null;
}

interface AppStore {
    user: User | null;
    token: string | null;
    chatMessages: ChatMessage[];
    booking: BookingState;
    
    // Actions
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    logout: () => void;
    
    // Chat Actions
    addChatMessage: (msg: ChatMessage) => void;
    clearChat: () => void;
    
    // Booking Actions
    updateBooking: (updates: Partial<BookingState>) => void;
    resetBooking: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
    user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    chatMessages: [
        {
            sender: 'ai',
            text: "Hello! I am your SwasthSetu AI health assistant. Please tell me what symptoms or health concerns you are experiencing today, and I'll help you find the right specialist and book an appointment.",
            timestamp: new Date()
        }
    ],
    booking: {
        symptoms: '',
        urgency: 'medium',
        specialization: '',
        recommendedDoctors: [],
        selectedDoctor: null,
        selectedDate: '',
        selectedSlot: '',
        patientForm: null,
        pendingAppointment: null
    },

    setUser: (user) => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
        set({ user });
    },
    setToken: (token) => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
        set({ token });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
        useAppStore.getState().resetBooking();
        useAppStore.getState().clearChat();
    },

    addChatMessage: (msg) => set((state) => ({ 
        chatMessages: [...state.chatMessages, msg] 
    })),
    
    clearChat: () => set({
        chatMessages: [
            {
                sender: 'ai',
                text: "Hello! I am your SwasthSetu AI health assistant. Please tell me what symptoms or health concerns you are experiencing today, and I'll help you find the right specialist and book an appointment.",
                timestamp: new Date()
            }
        ]
    }),

    updateBooking: (updates) => set((state) => ({
        booking: { ...state.booking, ...updates }
    })),

    resetBooking: () => set({
        booking: {
            symptoms: '',
            urgency: 'medium',
            specialization: '',
            recommendedDoctors: [],
            selectedDoctor: null,
            selectedDate: '',
            selectedSlot: '',
            patientForm: null,
            pendingAppointment: null
        }
    })
}));
