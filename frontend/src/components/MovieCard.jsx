import React, { useState } from 'react';
import { Star, Clock, Calendar, User, Heart, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { favoriteService } from '../services/api';
import usePosterImage from '../hooks/usePosterImage';

const MovieCard = ({
    movie,
    onFavoriteToggle,
    initialIsFavorite = false,
    showRemoveAction = false,
    onRemove,
}) => {
    const { authenticated } = useAuth();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);

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

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            className="group relative flex flex-col bg-white rounded-card overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all h-full"
        >
            {/* Poster Section */}
            <Link to={`/movie/${movie.imdbID}`} className="relative h-[400px] overflow-hidden">
                <img
                    src={posterSrc}
                    alt={movie.Title}
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
            </div>
            
            {/* Hover details overlay (Optional) */}
            <Link 
                to={`/movie/${movie.imdbID}`}
                className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
            />
        </motion.div>
    );
};

export default MovieCard;
