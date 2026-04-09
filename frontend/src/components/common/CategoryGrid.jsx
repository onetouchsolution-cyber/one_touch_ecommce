import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import API from '../../services/api';

// Skeleton Component
const CategorySkeleton = () => (
    <div className="bg-gray-100 rounded-xl shadow-sm p-4 flex flex-col items-center justify-center border border-gray-200 h-32 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
);

const CategoryGrid = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await API.get('/categories');
                // Filter active categories if needed, or assume backend sends all and we show all or just active?
                // Usually for user facing, we might want only active.
                // If backend supports isActive, let's filter.
                console.log('API Response:', data); // Debugging
                if (Array.isArray(data)) {
                    const activeCats = data.filter(c => c.isActive !== false);
                    setCategories(activeCats);
                } else {
                    console.error('API response is not an array:', data);
                    setError('Invalid data format received');
                }
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                setError('Failed to load categories');
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4">
                {[...Array(6)].map((_, i) => (
                    <CategorySkeleton key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-red-500">
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="mt-2 text-sm underline">Retry</button>
            </div>
        );
    }

    if (!categories || categories.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500">
                <p>No categories found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4">
            {categories.map((cat) => (
                <Link to={`/categories/${cat.key || cat.slug}`} key={cat._id}>
                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white rounded-xl shadow-soft p-4 flex flex-col items-center justify-center cursor-pointer border border-slate-100 h-32 hover:border-brand-500 transition-colors"
                    >
                        {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="w-12 h-12 object-contain mb-3" />
                        ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-full mb-3 flex items-center justify-center text-gray-400 text-xs">
                                No Icon
                            </div>
                        )}
                        <h3 className="text-sm font-semibold text-slate-700 text-center">{cat.name}</h3>
                    </motion.div>
                </Link>
            ))}
        </div>
    );
};

export default CategoryGrid;
