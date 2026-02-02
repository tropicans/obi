import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Fish, Droplets, Utensils, AlertCircle, CheckCircle2, CloudFog, Send, Loader2, BookOpen } from 'lucide-react';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Sparkles } from 'lucide-react';



function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const BentoCard = ({ children, className, title, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, icon?: any }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("relative overflow-hidden rounded-3xl bg-white p-6 shadow-apple-card border border-white/60", className)}
    >
        {(title || Icon) && (
            <div className="mb-4 flex items-center gap-2 text-gray-400">
                {Icon && <Icon size={16} />}
                {title && <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>}
            </div>
        )}
        {children}
    </motion.div>
);

export const Dashboard = () => {
    const [greeting, setGreeting] = useState('');
    const [content, setContent] = useState('');
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const queryClient = useQueryClient();


    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get('/users');
            return res.data;
        }
    });

    const activeUser = users?.[0];
    const activePet = activeUser?.pets?.[0];

    const journalMutation = useMutation({
        mutationFn: async (text: string) => {
            if (!activeUser || !activePet) throw new Error('User or Pet not found');
            await api.post('/journal', {
                content: text,
                petId: activePet.id,
                userId: activeUser.id
            });
        },
        onSuccess: () => {
            setContent('');
            queryClient.invalidateQueries({ queryKey: ['journal'] });
            queryClient.invalidateQueries({ queryKey: ['prediction'] });
            alert('Activity logged successfully! 🎉');
        }
    });

    const emergencyMutation = useMutation({
        mutationFn: async () => {
            if (!activePet) throw new Error('No pet found');
            await api.post(`/emergency/${activePet.id}`);
        },
        onSuccess: () => {
            alert('🚨 Emergency alert sent to WhatsApp!');
        },
        onError: (error: any) => {
            alert(`❌ Failed to send alert: ${error.message || 'Unknown error'}`);
        }
    });

    const askAi = async () => {
        if (!aiQuestion.trim()) return;
        const question = aiQuestion;
        setAiQuestion('');
        setAiMessages(prev => [...prev, { role: 'user', content: question }]);
        setIsAiLoading(true);

        try {
            const res = await api.post('/ai/ask', { question });
            setAiMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
        } catch (error) {
            setAiMessages(prev => [...prev, { role: 'assistant', content: 'Waduh, koneksi ke otak saya lagi putus nih. Coba lagi ya! 🔌' }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    const { data: situationData, isLoading: isPredicting, refetch: predictAgain } = useQuery({
        queryKey: ['prediction'],
        queryFn: async () => {
            if (!activePet) return { prediction: 'Belum ada data untuk dianalisis.' };
            const res = await api.get(`/ai/predict?petId=${activePet.id}`);
            return res.data;
        },
        enabled: !!activePet
    });

    useEffect(() => {



        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    return (
        <div className="space-y-8 overflow-x-hidden">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1"
            >
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">{greeting}, Master</h1>
                <p className="text-lg text-gray-500">Here's what's happening with Obi today.</p>
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden">

                {/* Situation Insights (AI Prediction) */}
                <BentoCard className="sm:col-span-2 lg:col-span-4 bg-white" title="Obi's Situation Analysis" icon={Sparkles}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            {isPredicting ? (
                                <div className="space-y-2 animate-pulse">
                                    <div className="h-4 w-3/4 bg-amber-200/50 rounded" />
                                    <div className="h-4 w-1/2 bg-amber-200/50 rounded" />
                                </div>
                            ) : (
                                <p className="text-xl font-medium text-amber-900 leading-relaxed italic">
                                    "{situationData?.prediction}"
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => predictAgain()}
                            disabled={isPredicting}
                            className="shrink-0 flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 active:scale-95 disabled:opacity-50"
                        >
                            {isPredicting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            Update Analysis
                        </button>
                    </div>
                    <div className="absolute -right-10 -bottom-10 text-amber-500/10 pointer-events-none">
                        <Sparkles size={160} />
                    </div>
                </BentoCard>

                {/* AI Assistant Card (Wide) */}

                <BentoCard className="md:col-span-2 lg:col-span-4 bg-gradient-to-br from-indigo-50 to-white" title="Obi Assistant" icon={BookOpen}>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                            <div className="self-start rounded-2xl bg-white p-3 text-sm shadow-sm border border-indigo-100 max-w-[80%]">
                                <p className="text-gray-800 italic">Halo! Saya asisten Obi. Ada yang bisa saya bantu terkait perawatan Obi hari ini? 🐠</p>
                            </div>
                            {aiMessages.map((msg, i) => (
                                <div key={i} className={cn(
                                    "rounded-2xl p-3 text-sm shadow-sm max-w-[80%]",
                                    msg.role === 'user'
                                        ? "self-end bg-apple-blue text-white"
                                        : "self-start bg-white text-gray-800 border border-indigo-100"
                                )}>
                                    {msg.content}
                                </div>
                            ))}
                            {isAiLoading && (
                                <div className="self-start rounded-2xl bg-white p-3 text-sm shadow-sm border border-indigo-100 italic text-gray-400 flex items-center gap-2">
                                    <Loader2 size={14} className="animate-spin" />
                                    Sedang mengetik...
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <input
                                value={aiQuestion}
                                onChange={(e) => setAiQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !isAiLoading && askAi()}
                                placeholder="Tanya sesuatu tentang Obi..."
                                className="flex-1 rounded-full bg-white border border-indigo-100 shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <button
                                onClick={askAi}
                                disabled={isAiLoading || !aiQuestion.trim()}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </BentoCard>

                {/* Status Card (Large) */}

                <BentoCard className="md:col-span-2 bg-gradient-to-br from-blue-50 to-white" title="Current Status" icon={Fish}>
                    <div className="flex h-full flex-col justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-apple-blue shadow-sm">
                                    <Fish size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Obi is Happy</h3>
                                    <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                        <CheckCircle2 size={14} /> All metrics normal
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-4 py-4 sm:py-6">
                            <div className="text-center p-3 rounded-2xl bg-blue-50/50">
                                <span className="block text-2xl font-bold text-gray-900">2.6L</span>
                                <span className="text-xs text-gray-500">Volume</span>
                            </div>
                            <div className="text-center p-3 rounded-2xl bg-blue-50/50">
                                <span className="block text-2xl font-bold text-gray-900">27°C</span>
                                <span className="text-xs text-gray-500">Temp</span>
                            </div>
                            <div className="text-center p-3 rounded-2xl bg-blue-50/50">
                                <span className="block text-2xl font-bold text-gray-900">98%</span>
                                <span className="text-xs text-gray-500">Health</span>
                            </div>
                        </div>

                        <div className="h-48 w-full rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-300 opacity-20 blur-3xl absolute -bottom-10 -right-10 pointer-events-none" />
                    </div>
                </BentoCard>

                {/* Next Feeding */}
                <BentoCard title="Next Feeding" icon={Utensils}>
                    <div className="flex flex-col items-center justify-center py-4">
                        <span className="text-3xl font-bold text-gray-900">08:00</span>
                        <span className="text-sm text-gray-500">Tomorrow Morning</span>
                        <button className="mt-4 w-full rounded-full bg-apple-dark py-2 text-sm font-medium text-white transition-transform active:scale-95">
                            Feed Now
                        </button>
                    </div>
                </BentoCard>

                {/* Water Change */}
                <BentoCard title="Water Quality" icon={Droplets}>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-3xl font-bold text-gray-900">7 Days</span>
                            <span className="text-xs text-gray-500 mb-1">since last change</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full w-[70%] bg-orange-400 rounded-full" />
                        </div>
                        <p className="text-xs text-gray-500">Water change recommended soon.</p>
                    </div>
                </BentoCard>

                {/* Recent Logs (Wide) */}
                <BentoCard className="col-span-2 md:col-span-2" title="Recent Activity" icon={CloudFog}>
                    <div className="space-y-3">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Morning Feeding</p>
                                        <p className="text-xs text-gray-500">Successfully sent via WhatsApp</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">2h ago</span>
                            </div>
                        ))}
                    </div>
                </BentoCard>

                {/* Quick Log Activity */}
                <BentoCard className="col-span-1" title="Quick Log" icon={CloudFog}>
                    <div className="space-y-4">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What did you do? (e.g. Angkat daun ketapang)"
                            className="w-full rounded-2xl bg-gray-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/20 resize-none h-24 border border-gray-100"
                        />
                        <button
                            onClick={() => content.trim() && journalMutation.mutate(content)}
                            disabled={journalMutation.isPending || !content.trim()}
                            className="flex items-center justify-center gap-2 w-full rounded-full bg-apple-blue py-2 text-sm font-medium text-white shadow-lg shadow-apple-blue/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                            {journalMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Save Activity
                        </button>
                    </div>
                </BentoCard>

                {/* Quick Action Emergency */}
                <BentoCard className="col-span-1 bg-red-50 border-red-100" title="Emergency" icon={AlertCircle}>

                    <p className="text-sm text-red-600/80 mb-4">Something wrong with Obi?</p>
                    <button
                        onClick={() => emergencyMutation.mutate()}
                        disabled={emergencyMutation.isPending || !activePet}
                        className="flex items-center justify-center gap-2 w-full rounded-full bg-red-500 py-2 text-sm font-medium text-white shadow-lg shadow-red-500/30 transition-transform active:scale-95 disabled:opacity-50"
                    >
                        {emergencyMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <AlertCircle size={16} />}
                        {emergencyMutation.isPending ? 'Sending...' : 'Trigger Alert'}
                    </button>
                </BentoCard>

            </div>
        </div >
    );
};
