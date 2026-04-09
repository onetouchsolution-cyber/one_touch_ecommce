import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import CategoryGrid from '../../components/common/CategoryGrid';
import BrandGrid from '../../components/common/BrandGrid';

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch featured products
                const { data: productsData } = await API.get('/products');
                setFeaturedProducts(productsData.slice(0, 8));

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Hero Section */}
            <section className="relative h-[400px] md:h-[500px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl mx-4 mt-6">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-10"></div>
                {/* Hero Image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517336714731-489689fd1ca4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-60"></div>

                <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-20 text-white">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-brand-400 font-bold tracking-wider uppercase mb-2"
                    >
                        Quality Spare Parts
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight max-w-2xl"
                    >
                        Repair it.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-200">Don't replace it.</span>
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-wrap gap-4"
                    >
                        <Link to="/products" className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-brand-600/30 flex items-center gap-2">
                            Start Browsing
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Fixed Categories */}
            <section className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-6 px-2">
                    <h2 className="text-2xl font-bold text-slate-800">Explore Categories</h2>
                </div>
                <CategoryGrid />
            </section>

            {/* Dynamic Subcategories (Brands) - Mobile Parts */}
            <section className="container mx-auto px-4 bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-1">Mobile Parts</h2>
                        <p className="text-slate-500">Find parts for top mobile brands</p>
                    </div>
                    <Link to="/categories?key=mobile_parts" className="text-brand-600 font-semibold hover:underline">View All</Link>
                </div>
                <BrandGrid categoryKey="mobile_parts" limit={6} />
            </section>

            {/* Featured Products */}
            <section className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-8 px-2">Trending components</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {featuredProducts.map((item) => (
                        <div key={item._id} className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
                            <Link to={`/product/${item.slug}`}>
                                <div className="h-56 bg-gray-50 relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center p-6">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <span className="text-gray-400">No Image</span>
                                        )}
                                    </div>
                                    {/* Quick Actions overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center">
                                        <button className="bg-white text-slate-900 px-6 py-2 rounded-full font-medium text-sm shadow-lg hover:bg-brand-600 hover:text-white transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="text-xs font-bold text-brand-600 mb-1 uppercase tracking-wider">
                                        {item.make?.name || 'Generic'}
                                    </div>
                                    <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2 min-h-[3rem]">{item.name}</h3>
                                    <div className="flex justify-between items-end mt-4">
                                        <div>
                                            <span className="text-lg font-bold text-slate-900">₹{item.price.toLocaleString()}</span>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
