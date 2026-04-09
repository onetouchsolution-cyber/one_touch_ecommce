import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FilterSection = ({ title, items, selectedItems, onChange, searchKey = 'name' }) => {
    const [isOpen, setIsOpen] = React.useState(true);

    if (!items || items.length === 0) return null;

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full font-semibold text-slate-800 mb-2"
            >
                {title}
                {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar"
                    >
                        {items.map(item => {
                            const isChecked = selectedItems.includes(item.slug);
                            return (
                                <label key={item._id || item.slug} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                            // Handle change
                                            onChange(item.slug);
                                        }}
                                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                                    />
                                    <span className={`text-sm flex-1 ${isChecked ? 'text-brand-600 font-medium' : 'text-slate-600'}`}>
                                        {item[searchKey]}
                                    </span>
                                </label>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ProductFilters = ({ filters, setFilters, meta = {} }) => {

    const toggleFilter = (key, slug) => {
        setFilters(prev => {
            // 1. Get the raw string from the previous state (safe from race conditions)
            const rawValue = prev[key] || '';

            // 2. Fix the split bug: Only split if the string is not empty
            const current = rawValue ? rawValue.split(',') : [];

            let updated;
            if (current.includes(slug)) {
                // Remove slug
                updated = current.filter(i => i !== slug);
            } else {
                // Add slug
                updated = [...current, slug];
            }
            // 3. Update state
            return {
                ...prev,
                [key]: updated.join(','),
                page: 1 // Reset pagination on filter change
            };
        });
        console.log(filters, 'filters');
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    return (
        <div className="space-y-4">
            {/* Price Filter */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4">Price Range</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        name="minPrice"
                        placeholder="Min"
                        value={filters.minPrice || ''}
                        onChange={handlePriceChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                        type="number"
                        name="maxPrice"
                        placeholder="Max"
                        value={filters.maxPrice || ''}
                        onChange={handlePriceChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                    />
                </div>
            </div>

            {/* Availability */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4">Availability</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={filters.inStock === 'true'}
                        onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked ? 'true' : '', page: 1 }))}
                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                    />
                    <span className="text-slate-600 text-sm">In Stock Only</span>
                </label>
            </div>

            {/* Dynamic Filters */}
            <FilterSection
                title="Category"
                items={meta.categories}
                selectedItems={filters.categoryKey ? filters.categoryKey.split(',') : []}
                onChange={(slug) => toggleFilter('categoryKey', slug)}
                searchKey="name" // or key if needed, using name for display
            />

            <FilterSection
                title="Subcategory"
                items={meta.subcategories}
                selectedItems={filters.subcategorySlug ? filters.subcategorySlug.split(',') : []}
                onChange={(slug) => toggleFilter('subcategorySlug', slug)}
            />

            <FilterSection
                title="Brand (Make)"
                items={meta.makes}
                selectedItems={filters.makeSlug ? filters.makeSlug.split(',') : []}
                onChange={(slug) => toggleFilter('makeSlug', slug)}
            />

            <FilterSection
                title="Model"
                items={meta.models}
                selectedItems={filters.modelSlug ? filters.modelSlug.split(',') : []}
                onChange={(slug) => toggleFilter('modelSlug', slug)}
            />

            <button
                onClick={() => setFilters(prev => ({ categoryKey: '', subcategorySlug: '', makeSlug: '', modelSlug: '', minPrice: '', maxPrice: '', inStock: '', page: 1 }))}
                className="w-full py-2 text-sm text-slate-500 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"
            >
                Clear All Filters
            </button>
        </div>
    );
};

export default ProductFilters;
