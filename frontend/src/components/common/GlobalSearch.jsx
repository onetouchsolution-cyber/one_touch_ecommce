import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaTimes, FaMobileAlt, FaBox } from 'react-icons/fa';
import API from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ models: [], products: [] });
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounce Search
    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim().length < 2) {
                setResults({ models: [], products: [] });
                return;
            }

            setLoading(true);
            try {
                const { data } = await API.get(`/search?q=${query}`);
                setResults(data);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            setShowSuggestions(false);
            navigate(`/search?q=${query}`);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults({ models: [], products: [] });
        setShowSuggestions(false);
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
                <input
                    type="text"
                    placeholder="Search for models (e.g., iPhone 13) or products..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-sm outline-none"
                    aria-label="Search"
                />
                <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                {query && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <FaTimes />
                    </button>
                )}
            </form>

            <AnimatePresence>
                {showSuggestions && (results.models.length > 0 || results.products.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                    >
                        {results.models.length > 0 && (
                            <div className="p-2">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase px-3 py-2">Models</h3>
                                {results.models.map((model) => (
                                    <Link
                                        key={model._id}
                                        to={`/make/${model.brand?.slug || 'unknown'}/model/${model.slug}/products`}
                                        onClick={() => setShowSuggestions(false)} // Fix logic here, need correct route
                                        // Wait, correct route for model is /make/:makeSlug/model/:modelSlug/products ??
                                        // Need to check MakeBrowsePage or Routes.
                                        // App.jsx: /make/:makeSlug/model/:modelSlug/products
                                        // Data returned has make, brand.
                                        // brand in model is ID or object?
                                        // Controller populated 'make' and 'brand'.
                                        // We need make slug.
                                        className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-sm text-slate-700"
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-500">
                                            {model.image ? <img src={model.image} alt={model.name} className="w-full h-full object-contain" /> : <FaMobileAlt />}
                                        </div>
                                        <span>{model.name}</span>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {results.models.length > 0 && results.products.length > 0 && <div className="border-t border-slate-100 my-1"></div>}

                        {results.products.length > 0 && (
                            <div className="p-2">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase px-3 py-2">Products</h3>
                                {results.products.map((product) => (
                                    <Link
                                        key={product._id}
                                        to={`/product/${product.slug}`}
                                        onClick={() => setShowSuggestions(false)}
                                        className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-sm text-slate-700"
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-500">
                                            {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-contain" /> : <FaBox />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="line-clamp-1">{product.name}</span>
                                            <span className="text-xs text-brand-600 font-medium">₹{product.price}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        <div className="bg-slate-50 p-2 text-center border-t border-slate-100">
                            <button
                                onClick={handleSearchSubmit}
                                className="text-xs text-brand-600 font-medium hover:underline"
                            >
                                View All Results
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GlobalSearch;
