import React, { useCallback, useEffect, useState } from 'react';
import { movieService, normalizeMovie } from '../services/api';
import SearchBar from '../components/SearchBar';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Film } from 'lucide-react';

const DISCOVER_SEEDS = [
    'avengers',
    'batman',
    'inception',
    'interstellar',
    'matrix',
    'godfather',
];

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [featuredMovies, setFeaturedMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [featuredLoading, setFeaturedLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");

    const handleSearch = useCallback(async (query) => {
        if (!query || query.trim().length < 2) {
            setMovies([]);
            setSearchQuery(query);
            setError("");
            return;
        }

        setLoading(true);
        setError("");
        setSearchQuery(query);

        try {
            const response = await movieService.search(query);
            // The search API returns simplified data, so we might need full details
            if (response.data && response.data.Search) {
                const results = response.data.Search.slice(0, 10);
                
                // Enrichment: Fetch full details for the first 10 results to get Rating, Genre, Director etc.
                const enrichedResults = await Promise.all(
                    results.map(async (m) => {
                        try {
                            const detail = await movieService.getDetails(m.imdbID);
                            return normalizeMovie(detail.data);
                        } catch {
                            return normalizeMovie(m); // Fallback to basic data
                        }
                    })
                );
                
                setMovies(enrichedResults);
            } else {
                setMovies([]);
                if (response.data.Error) setError(response.data.Error);
            }
        } catch (err) {
            setError("Something went wrong while fetching movies.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadFeaturedMovies = async () => {
            setFeaturedLoading(true);
            try {
                const searchResponses = await Promise.all(
                    DISCOVER_SEEDS.map((seed) => movieService.search(seed))
                );

                const uniqueSummaries = [];
                const seenIds = new Set();

                for (const response of searchResponses) {
                    const results = response.data?.Search ?? [];
                    for (const movie of results) {
                        if (!movie.imdbID || seenIds.has(movie.imdbID)) continue;
                        seenIds.add(movie.imdbID);
                        uniqueSummaries.push(movie);
                        if (uniqueSummaries.length >= 20) break;
                    }
                    if (uniqueSummaries.length >= 20) break;
                }

                const enrichedMovies = await Promise.all(
                    uniqueSummaries.map(async (movie) => {
                        try {
                            const detail = await movieService.getDetails(movie.imdbID);
                            return normalizeMovie(detail.data);
                        } catch {
                            return normalizeMovie(movie);
                        }
                    })
                );

                enrichedMovies.sort((a, b) => {
                    const ratingA = Number.parseFloat(a.imdbRating) || 0;
                    const ratingB = Number.parseFloat(b.imdbRating) || 0;
                    return ratingB - ratingA;
                });

                setFeaturedMovies(enrichedMovies.slice(0, 20));
            } catch (err) {
                console.error(err);
            } finally {
                setFeaturedLoading(false);
            }
        };

        loadFeaturedMovies();
    }, []);

    const displayedMovies = searchQuery.trim().length >= 2 ? movies : featuredMovies;
    const isShowingSearchResults = searchQuery.trim().length >= 2;
    const isGridLoading = isShowingSearchResults ? loading : featuredLoading;

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header / Hero */}
            <div className="text-center mb-12">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl sm:text-5xl font-extrabold text-dark tracking-tight mb-4"
                >
                    Discover Your Next <span className="text-primary italic">Favorite</span> Movie
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 text-lg max-w-2xl mx-auto"
                >
                    Browse through thousands of films and series with AI-powered insights and professional reviews.
                </motion.p>
            </div>

            {/* Sticky Search bar */}
            <div className="sticky top-6 z-30 mb-12">
                <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
            </div>

            {/* Results Grid */}
            <AnimatePresence mode='wait'>
                {isGridLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                        {[...Array(10)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : displayedMovies.length > 0 ? (
                    <>
                        {!isShowingSearchResults && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 flex items-end justify-between"
                            >
                                <div>
                                    <h2 className="text-2xl font-extrabold tracking-tight text-dark">Discover Picks</h2>
                                    <p className="mt-1 text-sm font-medium text-gray-500">20 popular, highly rated movies to start exploring.</p>
                                </div>
                            </motion.div>
                        )}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8"
                        >
                            {displayedMovies.map((movie, index) => (
                                <MovieCard key={movie.imdbID || movie.imdbId || `${movie.Title}-${index}`} movie={movie} />
                            ))}
                        </motion.div>
                    </>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-gray-400"
                    >
                        <Film size={80} strokeWidth={1} className="mb-4 opacity-20" />
                        <p className="text-xl font-medium">
                            {error ? error : searchQuery ? "No results found." : "Movies will appear here shortly."}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
