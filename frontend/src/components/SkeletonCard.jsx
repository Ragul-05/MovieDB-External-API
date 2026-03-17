import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="bg-white rounded-card overflow-hidden shadow-sm border border-gray-100 h-[560px] animate-pulse">
            <div className="h-[400px] bg-gray-200" />
            <div className="p-5 flex flex-col space-y-3">
                <div className="h-6 bg-gray-200 rounded-md w-3/4" />
                <div className="flex space-x-4">
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="flex space-x-2 mt-2">
                    <div className="h-6 bg-gray-50 rounded w-16" />
                    <div className="h-6 bg-gray-50 rounded w-16" />
                </div>
                <div className="pt-4 border-t border-gray-50">
                    <div className="h-3 bg-gray-50 rounded w-1/2" />
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
