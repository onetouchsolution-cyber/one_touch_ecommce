import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import API from '../../services/api';

const BrandGrid = ({ categoryKey, limit }) => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                // Fetch subcategories (brands) by category key
                const { data } = await API.get(`/subcategories?category=${categoryKey}`);
                setBrands(limit ? data.slice(0, limit) : data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching brands:", error);
                setLoading(false);
            }
        };

        if (categoryKey) {
            fetchBrands();
        }
    }, [categoryKey, limit]);

    if (loading) return <div className="animate-pulse h-20 bg-slate-100 rounded-xl"></div>;

    if (brands.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.map((brand) => (
                <Link to={`/products?subcategory=${brand.slug}`} key={brand._id}>
                    <motion.div
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        className="bg-white rounded-xl p-4 flex flex-col items-center justify-center border border-slate-100 h-32 cursor-pointer transition-all duration-300 shadow-sm"
                    >
                        {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="h-12 object-contain mb-3 grayscale hover:grayscale-0 transition-all duration-300" />
                        ) : (
                            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400 font-bold text-xl">
                                {brand.name.charAt(0)}
                            </div>
                        )}
                        <span className="text-sm font-medium text-slate-700">{brand.name}</span>
                    </motion.div>
                </Link>
            ))}
        </div>
    );
};

export default BrandGrid;
