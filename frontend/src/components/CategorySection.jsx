import React from 'react';
import { motion } from 'framer-motion';
import CategoryRow from './CategoryRow';

const CategorySection = ({ title, movies, onTrailerOpen }) => {
    if (!movies?.length) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h2>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                        Scroll through curated picks in this genre.
                    </p>
                </div>
            </div>
            <CategoryRow movies={movies} onTrailerOpen={onTrailerOpen} />
        </motion.section>
    );
};

export default CategorySection;
