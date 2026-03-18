import React, { useState } from 'react';
import { Star, Clock, Calendar, User, Heart, Trash2, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { favoriteService, movieService } from '../services/api';
import usePosterImage from '../hooks/usePosterImage';

const MovieCard = ({
    movie,
    onFavoriteToggle,
    initialIsFavorite = false,
    showRemoveAction = false,
    onRemove,
    onTrailerOpen,
    compact = false,
}) => {
    const { authenticated } = useAuth();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);
    const [trailerLoading, setTrailerLoading] = useState(false);
    const [trailerError, setTrailerError] = useState('');

    // Handle "N/A" values
    const getValue = (val) => val && val !== "N/A" ? val : "N/A";
    const posterSrc = usePosterImage(movie.Poster);

    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!authenticated) return;

        setLoading(true);
        try {
            if (isFavorite) {
                // In a real app, we'd need to find the specific favoriteId
                // For simplicity in search results, we'll just show the visual toggle
                // unless we implement a "check favorite status" on search enrichment
            } else {
                await favoriteService.add(movie.imdbID);
                setIsFavorite(true);
            }
            if (onFavoriteToggle) onFavoriteToggle();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onRemove) {
            onRemove();
        }
    };

    const handleTrailerClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (trailerLoading) return;

        setTrailerLoading(true);
        setTrailerError('');

        try {
            const response = await movieService.getTrailer(movie.imdbID);
            const youtubeUrl = response.data?.youtubeUrl;

            if (!youtubeUrl) {
                throw new Error('Trailer not available');
            }

            window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
            if (onTrailerOpen) onTrailerOpen(movie.imdbID);
        } catch (err) {
            setTrailerError('Trailer not available');
        } finally {
            setTrailerLoading(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            className={`group relative flex flex-col overflow-hidden rounded-card border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl h-full ${
                compact ? 'min-h-[490px]' : ''
            }`}
        >
            {/* Poster Section */}
            <Link to={`/movie/${movie.imdbID}`} className={`relative overflow-hidden ${compact ? 'h-[320px]' : 'h-[400px]'}`}>
                <img
                    src={posterSrc}
                    alt={movie.Title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-primary/90 text-white px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-md">
                    {getValue(movie.Type).toUpperCase()}
                </div>
                {movie.imdbRating && movie.imdbRating !== "N/A" && (
                    <div className="absolute top-4 right-4 bg-black/60 text-yellow-400 px-2 py-1 rounded-md text-xs font-bold backdrop-blur-md flex items-center space-x-1">
                        <Star size={12} fill="currentColor" />
                        <span>{movie.imdbRating}</span>
                    </div>
                )}
                {showRemoveAction ? (
                    <button
                        onClick={handleRemoveClick}
                        className="absolute bottom-4 right-4 z-20 rounded-full bg-red-500 p-2 text-white shadow-lg transition-all hover:bg-red-600"
                        title="Remove from favorites"
                    >
                        <Trash2 size={16} />
                    </button>
                ) : authenticated && (
                    <button 
                        onClick={handleFavoriteClick}
                        className={`absolute bottom-4 right-4 p-2 rounded-full backdrop-blur-md transition-all z-20
                            ${isFavorite ? 'bg-primary text-white shadow-lg shadow-blue-200' : 'bg-white/80 text-gray-400 hover:text-danger hover:bg-white'}`}
                    >
                        <Heart size={18} fill={isFavorite ? "currentColor" : "none"} className={loading ? 'animate-pulse' : ''} />
                    </button>
                )}
            </Link>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-grow">
                <Link to={`/movie/${movie.imdbID}`}>
                    <h3 className="text-lg font-bold text-dark group-hover:text-primary transition-colors line-clamp-1">
                        {movie.Title}
                    </h3>
                </Link>
                
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {getValue(movie.Year)}
                    </div>
                    {movie.Runtime && movie.Runtime !== "N/A" && (
                        <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {movie.Runtime}
                        </div>
                    )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    {getValue(movie.Genre).split(',').slice(0, 2).map((genre, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider">
                            {genre.trim()}
                        </span>
                    ))}
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                    <div className="flex items-center text-[10px] text-gray-400 font-medium">
                        <User size={12} className="mr-1" />
                        <span className="line-clamp-1">{getValue(movie.Director)}</span>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <Link
                        to={`/movie/${movie.imdbID}`}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-dark transition-all hover:border-primary hover:text-primary"
                    >
                        View Details
                    </Link>
                    <button
                        onClick={handleTrailerClick}
                        disabled={trailerLoading}
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition-all hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Play size={14} className="mr-1.5" fill="currentColor" />
                        {trailerLoading ? 'Loading...' : 'Watch Trailer'}
                    </button>
                </div>

                {trailerError && (
                    <p className="mt-3 text-xs font-semibold text-amber-600">
                        {trailerError}
                    </p>
                )}
            </div>
            
            {/* Hover details overlay (Optional) */}
            <Link 
                to={`/movie/${movie.imdbID}`}
                className="pointer-events-none absolute inset-0 bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100"
            />
        </motion.div>
    );
};

export default MovieCard;
