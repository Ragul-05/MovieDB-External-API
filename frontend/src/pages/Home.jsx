import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Popcorn } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import CategorySection from '../components/CategorySection';
import { movieService, normalizeMovie } from '../services/api';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [categoryGroups, setCategoryGroups] = useState({});
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');

    const handleSearch = useCallback(async (query) => {
        if (!query || query.trim().length < 2) {
            setMovies([]);
            setSearchQuery(query);
            setError('');
            return;
        }

        setLoading(true);
        setError('');
        setSearchQuery(query);

        try {
            const response = await movieService.search(query);
            if (response.data?.Search) {
                const results = response.data.Search.slice(0, 10);
                const enrichedResults = await Promise.all(
                    results.map(async (movie) => {
                        try {
                            const detail = await movieService.getDetails(movie.imdbID);
                            return normalizeMovie(detail.data);
                        } catch {
                            return normalizeMovie(movie);
                        }
                    })
                );
                setMovies(enrichedResults);
            } else {
                setMovies([]);
                if (response.data?.Error) setError(response.data.Error);
            }
        } catch (err) {
            setError('Something went wrong while fetching movies.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadCategories = async () => {
            setCategoriesLoading(true);
            try {
                const response = await movieService.getCategories();
                const normalizedCategories = Object.fromEntries(
                    Object.entries(response.data || {}).map(([category, categoryMovies]) => [
                        category,
                        (categoryMovies || []).map((movie) => normalizeMovie(movie)),
                    ])
                );
                setCategoryGroups(normalizedCategories);
            } catch (err) {
                console.error(err);
                setError('Unable to load category sections right now.');
            } finally {
                setCategoriesLoading(false);
            }
        };

        loadCategories();
    }, []);

    const isShowingSearchResults = searchQuery.trim().length >= 2;
    const categoryEntries = useMemo(() => Object.entries(categoryGroups), [categoryGroups]);

    return (
        <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
                >
                    Browse Movies Like a <span className="text-primary italic">Streaming Shelf</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mx-auto max-w-2xl text-lg text-slate-500"
                >
                    Search instantly, then dive into curated comedy, action, horror, and adventure rows with quick trailer access.
                </motion.p>
            </div>

            <div className="sticky top-6 z-30 mb-12">
                <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
            </div>

            <AnimatePresence mode="wait">
                {isShowingSearchResults ? (
                    loading ? (
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                            {[...Array(10)].map((_, index) => (
                                <SkeletonCard key={index} />
                            ))}
                        </div>
                    ) : movies.length > 0 ? (
                        <motion.div
                            key="search-results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-8"
                        >
                            <div className="flex items-end justify-between">
                                <div>
                                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Search Results</h2>
                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        Showing matches for "{searchQuery}".
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                {movies.map((movie, index) => (
                                    <MovieCard key={movie.imdbID || movie.imdbId || `${movie.Title}-${index}`} movie={movie} />
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <EmptyState message={error || 'No results found for your search.'} />
                    )
                ) : categoriesLoading ? (
                    <div className="space-y-10">
                        {[...Array(4)].map((_, sectionIndex) => (
                            <div key={sectionIndex} className="space-y-4">
                                <div className="h-8 w-48 animate-pulse rounded-xl bg-gray-200" />
                                <div className="flex gap-5 overflow-hidden">
                                    {[...Array(5)].map((_, cardIndex) => (
                                        <div key={cardIndex} className="min-w-[260px] max-w-[260px] flex-shrink-0">
                                            <SkeletonCard />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : categoryEntries.length > 0 ? (
                    <motion.div
                        key="category-browse"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-12"
                    >
                        <div className="flex items-center gap-3 text-slate-900">
                            <Popcorn className="text-primary" size={24} />
                            <h2 className="text-3xl font-extrabold tracking-tight">Browse by Category</h2>
                        </div>
                        {categoryEntries.map(([category, categoryMovies]) => (
                            <CategorySection
                                key={category}
                                title={toTitleCase(category)}
                                movies={categoryMovies}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <EmptyState message={error || 'No category sections are available yet.'} />
                )}
            </AnimatePresence>
        </div>
    );
};

const EmptyState = ({ message }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-gray-400"
    >
        <Film size={80} strokeWidth={1} className="mb-4 opacity-20" />
        <p className="text-center text-xl font-medium">{message}</p>
    </motion.div>
);

const toTitleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export default Home;
