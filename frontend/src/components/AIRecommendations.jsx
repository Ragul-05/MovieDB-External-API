import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Star } from 'lucide-react';
import { aiService, movieService, normalizeMovie } from '../services/api';
import usePosterImage from '../hooks/usePosterImage';

const AIRecommendations = ({ authenticated }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!authenticated) {
                setMovies([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');
            try {
                const response = await aiService.getRecommendations();
                const titles = (response.data?.recommendations || '')
                    .split(',')
                    .map((title) => title.trim())
                    .filter(Boolean)
                    .filter(isValidRecommendationTitle)
                    .slice(0, 10);

                if (!titles.length) {
                    setMovies([]);
                    setError('Recommendations are unavailable right now.');
                    setLoading(false);
                    return;
                }

                const results = await Promise.all(
                    titles.map(async (title) => {
                        try {
                            const searchResponse = await movieService.search(title);
                            const firstMatch = searchResponse.data?.Search?.[0];
                            if (!firstMatch?.imdbID) return null;

                            const detailResponse = await movieService.getDetails(firstMatch.imdbID);
                            return normalizeMovie(detailResponse.data);
                        } catch {
                            return null;
                        }
                    })
                );

                setMovies(results.filter(Boolean));
            } catch (err) {
                setError('Recommendations are unavailable right now.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [authenticated]);

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center text-dark">
                    <Sparkles size={18} className="mr-2 text-primary" />
                    <h3 className="text-2xl font-extrabold">Recommended Movies</h3>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center rounded-3xl border border-gray-100 bg-white px-5 py-6 text-sm font-medium text-gray-500 shadow-sm">
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Loading personalized recommendations...
                </div>
            ) : !authenticated ? (
                <div className="rounded-3xl border border-gray-100 bg-white px-5 py-6 text-sm font-medium text-gray-500 shadow-sm">
                    Sign in to see AI recommendations based on your movie activity.
                </div>
            ) : movies.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {movies.map((movie) => (
                        <RecommendationCard key={movie.imdbID} movie={movie} />
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl border border-gray-100 bg-white px-5 py-6 text-sm font-medium text-gray-500 shadow-sm">
                    {error || 'No recommendations available yet.'}
                </div>
            )}
        </motion.section>
    );
};

const RecommendationCard = ({ movie }) => {
    const posterSrc = usePosterImage(movie.Poster);

    return (
        <Link
            to={`/movie/${movie.imdbID}`}
            className="min-w-[220px] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="relative h-72 overflow-hidden">
                <img src={posterSrc} alt={movie.Title} className="h-full w-full object-cover" />
                <div className="absolute bottom-4 right-4 flex items-center rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-yellow-300 backdrop-blur">
                    <Star size={12} className="mr-1" fill="currentColor" />
                    <span>{movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A'}</span>
                </div>
            </div>
            <div className="p-4">
                <h4 className="line-clamp-2 text-base font-bold text-dark">{movie.Title}</h4>
                <p className="mt-2 text-sm font-medium text-gray-500">{movie.Year}</p>
            </div>
        </Link>
    );
};

const isValidRecommendationTitle = (title) => {
    const normalized = title.toLowerCase();
    return !normalized.includes('error calling ai service')
        && !normalized.includes('quota exceeded')
        && !normalized.includes('too many requests')
        && !normalized.includes('resource_exhausted')
        && !normalized.includes('https://')
        && !normalized.includes('<eol>')
        && !normalized.includes('generativelanguage.googleapis.com')
        && !normalized.includes('"message"')
        && title.length <= 80;
};

export default AIRecommendations;
