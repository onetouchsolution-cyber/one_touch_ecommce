import React from 'react';

const ProductSort = ({ currentSort, onSortChange }) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Sort by:</span>
            <select
                value={currentSort}
                onChange={(e) => onSortChange(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2 outline-none cursor-pointer hover:border-slate-300"
            >
                <option value="new">Newest Arrivals</option>
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
            </select>
        </div>
    );
};

export default ProductSort;
