import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Fish, Plus, MoreHorizontal, Heart, Clock } from 'lucide-react';
import api from '../lib/api';

const PetCard = ({ pet }: { pet: any }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-apple-card border border-white/60 transition-all hover:shadow-xl"
    >
        <div className="flex items-start justify-between">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-apple-blue group-hover:bg-apple-blue group-hover:text-white transition-colors">
                <Fish size={32} />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={20} />
            </button>
        </div>

        <div className="mt-6 space-y-1">
            <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{pet.type || 'Fighter Fish'}</p>
        </div>

        <div className="mt-6 flex items-center gap-4 border-t border-gray-50 pt-4">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-400">
                <Heart size={14} className="text-red-400" />
                <span>Healthy</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-gray-400">
                <Clock size={14} />
                <span>{pet.schedules?.length || 0} Schedules</span>
            </div>
        </div>
    </motion.div>
);

export const Pets = () => {
    const { data: pets, isLoading } = useQuery({
        queryKey: ['pets'],
        queryFn: async () => {
            const res = await api.get('/pets');
            return res.data;
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">My Pets</h1>
                    <p className="text-lg text-gray-500">Manage your beloved aquatic companions.</p>
                </div>
                <button className="flex items-center gap-2 rounded-full bg-apple-dark px-6 py-3 text-sm font-semibold text-white shadow-lg active:scale-95 transition-transform">
                    <Plus size={18} />
                    Add New Pet
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-56 animate-pulse rounded-3xl bg-white border border-white/60 shadow-apple-card" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pets?.map((pet: any) => (
                        <PetCard key={pet.id} pet={pet} />
                    ))}

                    {/* Add Placeholder Card */}
                    <button className="flex h-56 flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-gray-400 transition-colors hover:border-apple-blue/30 hover:bg-blue-50/30 hover:text-apple-blue">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-current">
                            <Plus size={24} />
                        </div>
                        <span className="font-medium">Add another companion</span>
                    </button>
                </div>
            )}
        </div>
    );
};
