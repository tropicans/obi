import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Search, Filter, History } from 'lucide-react';
import api from '../lib/api';
import { clsx } from 'clsx';

const LogItem = ({ log, index }: { log: any, index: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group flex items-center gap-6 rounded-3xl bg-white p-6 shadow-apple-card border border-white/60 mb-2 transition-all hover:translate-x-1"
    >
        <div className={clsx(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            log.status === 'SUCCESS' ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
        )}>
            {log.status === 'SUCCESS' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
        </div>

        <div className="flex flex-1 items-center justify-between gap-4">
            <div>
                <p className="font-bold text-gray-900">{log.template?.name || 'WhatsApp Notification'}</p>
                <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500">
                    <span className="font-semibold text-apple-blue">{log.pet?.name}</span>
                    <span>•</span>
                    <span>{log.phone}</span>
                </div>
            </div>

            <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                    {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-gray-400">
                    {new Date(log.sentAt).toLocaleDateString()}
                </p>
            </div>
        </div>
    </motion.div>
);

export const Logs = () => {
    const { data: logs, isLoading } = useQuery({
        queryKey: ['logs'],
        queryFn: async () => {
            const res = await api.get('/logs');
            return res.data;
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">Activity Logs</h1>
                    <p className="text-lg text-gray-500">Track all notifications sent to your WhatsApp.</p>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="rounded-full bg-white border border-white/60 shadow-apple-card py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
                        />
                    </div>
                    <button className="flex items-center gap-2 rounded-full bg-white border border-white/60 shadow-apple-card px-4 py-2.5 text-sm font-medium text-gray-600 active:scale-95 transition-transform">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-20 animate-pulse rounded-3xl bg-white border border-white/60 shadow-apple-card" />
                    ))}
                </div>
            ) : (
                <div className="max-w-4xl">
                    {logs?.map((log: any, i: number) => (
                        <LogItem key={log.id} log={log} index={i} />
                    ))}

                    {logs?.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mb-4 rounded-full bg-gray-50 p-6 text-gray-300">
                                <History size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No activity yet</h3>
                            <p className="text-gray-500 mt-2">System logs will appear here once notifications are sent.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
