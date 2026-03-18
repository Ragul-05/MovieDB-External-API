import React from 'react';
import MovieCard from './MovieCard';

const CategoryRow = ({ movies, onTrailerOpen }) => {
    return (
        <div className="flex gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {movies.map((movie, index) => (
                <div key={movie.imdbID || movie.imdbId || `${movie.Title}-${index}`} className="min-w-[260px] max-w-[260px] flex-shrink-0">
                    <MovieCard movie={movie} onTrailerOpen={onTrailerOpen} compact />
                </div>
            ))}
        </div>
    );
};

export default CategoryRow;
