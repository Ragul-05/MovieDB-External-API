import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, initialValue = "" }) => {
    const [query, setQuery] = useState(initialValue);

    useEffect(() => {
        const handler = setTimeout(() => {
            onSearch(query);
        }, 500);

        return () => clearTimeout(handler);
    }, [query, onSearch]);

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-11 pr-12 py-4 border-none bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-primary focus:shadow-md transition-all duration-300 text-dark placeholder-gray-400 text-lg"
                placeholder="Search movies, series, and more..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
                <button
                    onClick={() => setQuery("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
