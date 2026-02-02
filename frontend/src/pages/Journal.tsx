import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, Clock, Pencil, Trash2, X, Check } from 'lucide-react';
import api from '../lib/api';

interface JournalItemProps {
    entry: any;
    index: number;
    onEdit: (id: string, content: string) => void;
    onDelete: (id: string) => void;
    editingId: string | null;
    editContent: string;
    setEditContent: (content: string) => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
    isUpdating: boolean;
}

const JournalItem = ({
    entry,
    index,
    onEdit,
    onDelete,
    editingId,
    editContent,
    setEditContent,
    onCancelEdit,
    onSaveEdit,
    isUpdating
}: JournalItemProps) => {
    const isEditing = editingId === entry.id;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-6 pb-8 last:pb-0"
        >
            {/* Timeline Line */}
            <div className="absolute left-[27px] top-8 bottom-0 w-px bg-gray-100 last:hidden" />

            {/* Icon */}
            <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-apple-card border border-white/60 text-apple-blue">
                <BookOpen size={24} />
            </div>

            {/* Content */}
            <div className="flex-1 rounded-3xl bg-white p-6 shadow-apple-card border border-white/60">
                <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-4 mb-2 flex-wrap">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-gray-900">{entry.pet?.name}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 font-medium">Activity</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-400 flex-wrap">
                            <Clock size={12} />
                            {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <span className="hidden sm:inline mx-1">•</span>
                            <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(entry.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        {!isEditing && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => onEdit(entry.id, entry.content)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-apple-blue transition-colors"
                                    title="Edit"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={() => onDelete(entry.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <div className="space-y-3">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full rounded-xl bg-gray-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/20 resize-none h-24 border border-gray-200"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={onCancelEdit}
                                className="flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <X size={14} />
                                Cancel
                            </button>
                            <button
                                onClick={onSaveEdit}
                                disabled={isUpdating || !editContent.trim()}
                                className="flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium bg-apple-blue text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                            >
                                {isUpdating ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                ) : (
                                    <Check size={14} />
                                )}
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-700 leading-relaxed">{entry.content}</p>
                )}
            </div>
        </motion.div>
    );
};

export const Journal = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [content, setContent] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
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

    const { data: journal, isLoading } = useQuery({
        queryKey: ['journal'],
        queryFn: async () => {
            const res = await api.get('/journal');
            return res.data;
        }
    });

    const createMutation = useMutation({
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
            setIsAdding(false);
            queryClient.invalidateQueries({ queryKey: ['journal'] });
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, content }: { id: string; content: string }) => {
            await api.put(`/journal/${id}`, { content });
        },
        onSuccess: () => {
            setEditingId(null);
            setEditContent('');
            queryClient.invalidateQueries({ queryKey: ['journal'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/journal/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journal'] });
        }
    });

    const handleEdit = (id: string, currentContent: string) => {
        setEditingId(id);
        setEditContent(currentContent);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditContent('');
    };

    const handleSaveEdit = () => {
        if (editingId && editContent.trim()) {
            updateMutation.mutate({ id: editingId, content: editContent });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this journal entry?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Activity Journal</h1>
                    <p className="text-base sm:text-lg text-gray-500">A historical record of everything you do for your fish.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center justify-center gap-2 rounded-full bg-apple-blue px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-apple-blue/20 transition-all hover:bg-blue-600 active:scale-95 shrink-0"
                >
                    <BookOpen size={16} />
                    {isAdding ? 'Cancel' : 'Log New Activity'}
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-3xl bg-white p-6 shadow-apple-card border border-white/60">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Describe what you did for Obi..."
                                className="w-full rounded-2xl bg-gray-50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/20 resize-none h-32 border border-gray-100"
                            />
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => content.trim() && createMutation.mutate(content)}
                                    disabled={createMutation.isPending || !content.trim()}
                                    className="flex items-center gap-2 rounded-full bg-apple-blue px-8 py-2 text-sm font-semibold text-white shadow-lg shadow-apple-blue/20 transition-all disabled:opacity-50"
                                >
                                    {createMutation.isPending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : <BookOpen size={16} />}
                                    Save to Journal
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading ? (
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-6">
                            <div className="h-14 w-14 shrink-0 rounded-2xl bg-white shadow-apple-card animate-pulse" />
                            <div className="flex-1 h-32 rounded-3xl bg-white shadow-apple-card animate-pulse" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="max-w-3xl">
                    {journal?.map((entry: any, i: number) => (
                        <JournalItem
                            key={entry.id}
                            entry={entry}
                            index={i}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            editingId={editingId}
                            editContent={editContent}
                            setEditContent={setEditContent}
                            onCancelEdit={handleCancelEdit}
                            onSaveEdit={handleSaveEdit}
                            isUpdating={updateMutation.isPending}
                        />
                    ))}

                    {journal?.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mb-4 rounded-full bg-gray-50 p-6 text-gray-300">
                                <BookOpen size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Your journal is empty</h3>
                            <p className="text-gray-500 mt-2">Start by logging an activity on the dashboard.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
