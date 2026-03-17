import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService, favoriteService, normalizeMovie } from '../services/api';
import { 
    Star, Clock, Calendar, Globe, User, 
    ChevronLeft, Award, Languages, Tag, 
    Clapperboard, PenTool, Users, Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import usePosterImage from '../hooks/usePosterImage';
import AISummary from '../components/AISummary';
import AIRecommendations from '../components/AIRecommendations';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const { authenticated } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    const [favoriteId, setFavoriteId] = useState(null);
    const posterSrc = usePosterImage(movie?.Poster);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await movieService.getDetails(id);
                const normalizedMovie = normalizeMovie(response.data);
                setMovie(normalizedMovie);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            if (!authenticated || !id) {
                setIsFavorite(false);
                setFavoriteId(null);
                return;
            }

            try {
                const response = await favoriteService.list();
                const existingFavorite = response.data.find((fav) => fav.movie?.imdbId === id || fav.movie?.imdbID === id);
                setIsFavorite(!!existingFavorite);
                setFavoriteId(existingFavorite?.id ?? null);
            } catch (err) {
                console.error(err);
            }
        };

        fetchFavoriteStatus();
    }, [authenticated, id]);

    const handleToggleFavorite = async () => {
        if (!authenticated || favLoading) return;
        setFavLoading(true);
        try {
            if (isFavorite) {
                if (favoriteId) {
                    await favoriteService.remove(favoriteId);
                }
                setIsFavorite(false);
                setFavoriteId(null);
            } else {
                const response = await favoriteService.add(id);
                setFavoriteId(response.data?.id ?? null);
                setIsFavorite(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFavLoading(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!movie) return (
        <div className="flex h-screen items-center justify-center">
            <p className="text-xl text-gray-500">Movie not found.</p>
        </div>
    );

    const getValue = (val) => val && val !== "N/A" ? val : "N/A";

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Nav */}
            <div className="max-w-7xl mx-auto px-6 py-6 flex items-center">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-primary transition-colors font-medium"
                >
                    <ChevronLeft size={20} className="mr-1" />
                    Back to Search
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left: Poster */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4"
                    >
                        <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-[2/3]">
                            <img 
                                src={posterSrc}
                                alt={movie.Title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        <div className="mt-8 space-y-4">
                            <div className="enterprise-card flex items-center justify-between">
                                <span className="text-gray-400 font-medium text-sm flex items-center">
                                    <Star className="mr-2 text-yellow-400" size={18} fill="currentColor" />
                                    IMDb Rating
                                </span>
                                <span className="text-xl font-bold text-dark">{getValue(movie.imdbRating)}/10</span>
                            </div>
                            <div className="enterprise-card flex items-center justify-between">
                                <span className="text-gray-400 font-medium text-sm flex items-center">
                                    <Tag className="mr-2 text-secondary" size={18} />
                                    Votes
                                </span>
                                <span className="font-semibold text-dark">{getValue(movie.imdbVotes)}</span>
                            </div>

                            {authenticated && (
                                <button 
                                    onClick={handleToggleFavorite}
                                    disabled={favLoading}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg
                                        ${isFavorite 
                                            ? 'bg-primary text-white shadow-blue-100' 
                                            : 'bg-white text-gray-600 border border-gray-100 hover:border-danger hover:text-danger'}`}
                                >
                                    <Heart size={20} fill={isFavorite ? "currentColor" : "none"} className={favLoading ? 'animate-pulse' : ''} />
                                    <span>{isFavorite ? 'In Your Favorites' : 'Add to Favorites'}</span>
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Right: Info */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-8 space-y-8"
                    >
                        <section>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-dark leading-tight">
                                {movie.Title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 mt-4 text-gray-500 font-medium uppercase tracking-wide text-xs">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">{movie.Rated}</span>
                                <span className="flex items-center"><Calendar size={14} className="mr-1" />{movie.Year}</span>
                                <span className="flex items-center"><Clock size={14} className="mr-1" />{movie.Runtime}</span>
                                <span className="flex items-center"><Globe size={14} className="mr-1" />{movie.Country}</span>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                {getValue(movie.Genre).split(',').map((g, i) => (
                                    <span key={i} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm">
                                        {g.trim()}
                                    </span>
                                ))}
                            </div>
                            <p className="text-lg text-gray-600 leading-relaxed font-medium">
                                {getValue(movie.Plot)}
                            </p>
                        </section>

                        <AISummary imdbId={movie.imdbID} plot={movie.Plot} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <InfoItem icon={<Clapperboard size={18} />} label="Director" value={movie.Director} />
                            <InfoItem icon={<PenTool size={18} />} label="Writer" value={movie.Writer} />
                            <InfoItem icon={<Users size={18} />} label="Actors" value={movie.Actors} />
                            <InfoItem icon={<Languages size={18} />} label="Languages" value={movie.Language} />
                            <InfoItem icon={<Award size={18} />} label="Awards" value={movie.Awards} />
                            <InfoItem icon={<User size={18} />} label="Production" value={movie.Production} />
                        </div>

                        <AIRecommendations authenticated={authenticated} />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start space-x-3">
        <div className="p-2 bg-gray-100 rounded-lg text-gray-500 mt-1">
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-semibold text-dark mt-1 leading-relaxed">{value && value !== "N/A" ? value : "Not specified"}</p>
        </div>
    </div>
);

export default MovieDetails;
