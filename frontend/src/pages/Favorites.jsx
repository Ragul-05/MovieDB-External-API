import React, { useEffect, useMemo, useState } from 'react';
import { favoriteService, movieService, normalizeMovie } from '../services/api';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartOff, Search, SlidersHorizontal } from 'lucide-react';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [genreFilter, setGenreFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const response = await favoriteService.list();
            const enrichedFavorites = await Promise.all(
                response.data.map(async (fav) => {
                    const baseMovie = normalizeMovie(fav.movie);
                    try {
                        const detailResponse = await movieService.getDetails(baseMovie.imdbID || baseMovie.imdbId);
                        return {
                            ...normalizeMovie(detailResponse.data),
                            favoriteId: fav.id,
                        };
                    } catch {
                        return {
                            ...baseMovie,
                            favoriteId: fav.id,
                        };
                    }
                })
            );
            setFavorites(enrichedFavorites);
        } catch (err) {
            console.error("Failed to fetch favorites", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const handleRemove = async (favoriteId) => {
        try {
            await favoriteService.remove(favoriteId);
            setFavorites(prev => prev.filter(f => f.favoriteId !== favoriteId));
        } catch (err) {
            console.error("Failed to remove favorite", err);
        }
    };

    const genres = useMemo(() => {
        const values = new Set();
        favorites.forEach((movie) => {
            const genreText = movie.Genre || movie.genre || '';
            genreText
                .split(',')
                .map((genre) => genre.trim())
                .filter(Boolean)
                .forEach((genre) => values.add(genre));
        });
        return ['all', ...Array.from(values).sort((a, b) => a.localeCompare(b))];
    }, [favorites]);

    const filteredFavorites = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        const filtered = favorites.filter((movie) => {
            const title = (movie.Title || movie.title || '').toLowerCase();
            const director = (movie.Director || movie.director || '').toLowerCase();
            const genreText = movie.Genre || movie.genre || '';
            const matchesQuery =
                !normalizedQuery ||
                title.includes(normalizedQuery) ||
                director.includes(normalizedQuery);
            const matchesGenre =
                genreFilter === 'all' ||
                genreText.split(',').map((genre) => genre.trim()).includes(genreFilter);

            return matchesQuery && matchesGenre;
        });

        const sorted = [...filtered];
        sorted.sort((a, b) => {
            if (sortBy === 'title') {
                return (a.Title || '').localeCompare(b.Title || '');
            }
            if (sortBy === 'rating') {
                return (Number.parseFloat(b.imdbRating) || 0) - (Number.parseFloat(a.imdbRating) || 0);
            }
            if (sortBy === 'year') {
                return (Number.parseInt(b.Year, 10) || 0) - (Number.parseInt(a.Year, 10) || 0);
            }
            return (b.favoriteId || 0) - (a.favoriteId || 0);
        });

        return sorted;
    }, [favorites, genreFilter, query, sortBy]);

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="mb-12">
                <h1 className="text-4xl font-extrabold text-dark tracking-tight">Your Favorites</h1>
                <p className="text-gray-500 mt-2 text-lg">Movies and series you've saved to watch later.</p>
            </div>

            {!loading && favorites.length > 0 && (
                <div className="mb-10 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center text-sm font-bold uppercase tracking-widest text-gray-400">
                        <SlidersHorizontal size={16} className="mr-2" />
                        Filter Favorites
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(180px,1fr)_minmax(180px,1fr)]">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by title or director..."
                                className="w-full rounded-2xl bg-gray-50 py-3 pl-11 pr-4 text-sm text-dark ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <select
                            value={genreFilter}
                            onChange={(e) => setGenreFilter(e.target.value)}
                            className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-dark ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-primary"
                        >
                            {genres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre === 'all' ? 'All Genres' : genre}
                                </option>
                            ))}
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-dark ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-primary"
                        >
                            <option value="recent">Recently Added</option>
                            <option value="rating">Highest Rated</option>
                            <option value="year">Newest Year</option>
                            <option value="title">Title A-Z</option>
                        </select>
                    </div>
                </div>
            )}

            <AnimatePresence mode='wait'>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                        {[...Array(5)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : favorites.length > 0 && filteredFavorites.length > 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8"
                    >
                        {filteredFavorites.map((movie) => (
                            <div key={movie.favoriteId} className="relative">
                                <MovieCard
                                    movie={movie}
                                    initialIsFavorite
                                    showRemoveAction
                                    onRemove={() => handleRemove(movie.favoriteId)}
                                />
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-32 text-gray-400"
                    >
                        <HeartOff size={80} strokeWidth={1} className="mb-4 opacity-20" />
                        <p className="text-xl font-medium text-center">
                            You haven't favorited any movies yet.<br/>
                            Start exploring to build your library.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {!loading && favorites.length > 0 && filteredFavorites.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-24 text-gray-400"
                >
                    <Search size={64} strokeWidth={1.25} className="mb-4 opacity-20" />
                    <p className="text-xl font-medium text-center">No favorites match the current filters.</p>
                </motion.div>
            )}
        </div>
    );
};

export default Favorites;
