import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, Calendar, Bell, Plus, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { clsx } from 'clsx';

const ScheduleItem = ({ schedule }: { schedule: any }) => {
    const queryClient = useQueryClient();

    const toggleMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/schedules/${schedule.id}/toggle`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
        }
    });

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-apple-card border border-white/60 mb-4"
        >
            <div className="flex items-center gap-6">
                <div className={clsx(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                    schedule.enabled ? "bg-blue-50 text-apple-blue" : "bg-gray-100 text-gray-400"
                )}>
                    <Clock size={24} />
                </div>

                <div>
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">{schedule.template?.name || 'Feeding Reminder'}</h4>
                        {!schedule.enabled && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase font-bold text-gray-400">Disabled</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {schedule.pet?.name}</span>
                        <span className="flex items-center gap-1 font-mono bg-gray-50 px-2 rounded-md">{schedule.cron}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* iOS Style Toggle */}
                <button
                    onClick={() => toggleMutation.mutate()}
                    className={clsx(
                        "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none",
                        schedule.enabled ? "bg-green-500" : "bg-gray-200"
                    )}
                >
                    <span
                        className={clsx(
                            "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                            schedule.enabled ? "translate-x-6" : "translate-x-1"
                        )}
                    />
                </button>
                <button className="p-2 text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={18} />
                </button>
            </div>
        </motion.div>
    );
};

export const Schedules = () => {
    const { data: schedules, isLoading } = useQuery({
        queryKey: ['schedules'],
        queryFn: async () => {
            const res = await api.get('/schedules');
            return res.data;
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">Schedules</h1>
                    <p className="text-lg text-gray-500">Automate reminders for your water changes and feedings.</p>
                </div>
                <button className="flex items-center gap-2 rounded-full bg-apple-dark px-6 py-3 text-sm font-semibold text-white shadow-lg active:scale-95 transition-transform">
                    <Plus size={18} />
                    Create Schedule
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 animate-pulse rounded-3xl bg-white border border-white/60 shadow-apple-card" />
                    ))}
                </div>
            ) : (
                <div className="max-w-4xl">
                    {schedules?.map((s: any) => (
                        <ScheduleItem key={s.id} schedule={s} />
                    ))}

                    {schedules?.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mb-4 rounded-full bg-gray-50 p-6 text-gray-300">
                                <Bell size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No schedules set yet</h3>
                            <p className="text-gray-500 mt-2">Create your first automated reminder to keep Obi happy.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
