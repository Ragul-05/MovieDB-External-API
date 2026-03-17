import React, { useState, useEffect } from 'react';
import { historyService } from '../services/api';
import { motion } from 'framer-motion';
import { Search, Clock, Trash2 } from 'lucide-react';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await historyService.get();
                setHistory(response.data);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDelete = async (id) => {
        setBusyId(id);
        try {
            await historyService.remove(id);
            setHistory((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            console.error("Failed to delete history item", err);
        } finally {
            setBusyId(null);
        }
    };

    const handleClearAll = async () => {
        if (!history.length) return;

        setClearing(true);
        try {
            await historyService.clear();
            setHistory([]);
        } catch (err) {
            console.error("Failed to clear history", err);
        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-24">
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold text-dark tracking-tight">Search History</h1>
                    <p className="text-gray-500 mt-2 text-lg">Tracks your recent discoveries and interests.</p>
                </div>
                {history.length > 0 && !loading && (
                    <button
                        onClick={handleClearAll}
                        disabled={clearing}
                        className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Trash2 size={16} className="mr-2" />
                        {clearing ? 'Clearing...' : 'Clear History'}
                    </button>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : history.length > 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-4"
                >
                    {history.map((item) => (
                        <div 
                            key={item.id} 
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group transition-all hover:shadow-md"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center">
                                    <Search size={22} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-dark group-hover:text-primary transition-colors">
                                        "{item.searchQuery}"
                                    </h3>
                                    <div className="flex items-center text-xs text-gray-400 mt-1 font-medium italic">
                                        <Clock size={12} className="mr-1" />
                                        Searched on {formatDate(item.createdAt)}
                                    </div>
                                </div>
                            </div>
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                    Keyword
                                </span>
                            </div>
                            <button
                                onClick={() => handleDelete(item.id)}
                                disabled={busyId === item.id}
                                className="ml-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-100 text-gray-400 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                                title="Delete history item"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </motion.div>
            ) : (
                <div className="text-center py-32 text-gray-400">
                    <Clock size={60} strokeWidth={1} className="mx-auto mb-4 opacity-20" />
                    <p className="text-xl font-medium">Your search history is empty.</p>
                </div>
            )}
        </div>
    );
};

export default History;
