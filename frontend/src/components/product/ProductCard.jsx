import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeImage from '../common/SafeImage';

const ProductCard = ({ product }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group h-full flex flex-col"
        >
            <Link to={`/product/${product.slug}`} className="flex-1 flex flex-col">
                <div className="relative h-56 bg-slate-50 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                        {product.image ? (
                            <SafeImage
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <span className="text-slate-300 font-medium">No Image</span>
                        )}
                    </div>

                    {/* Badges/Tags could go here */}
                    {product.countInStock === 0 && (
                        <div className="absolute top-3 right-3 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                            Out of Stock
                        </div>
                    )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-2">
                        {product.make && (
                            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2 py-1 rounded-md">
                                {typeof product.make === 'object' ? product.make.name : product.make}
                            </span>
                        )}
                    </div>

                    <h3 className="font-semibold text-slate-800 text-lg mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-brand-600 transition-colors">
                        {product.name}
                    </h3>

                    {product.compatibleModels && product.compatibleModels.length > 0 && (
                        <p className="text-xs text-slate-500 mb-4 line-clamp-1">
                            Fits: {product.compatibleModels.length} models
                        </p>
                    )}

                    <div className="mt-auto flex items-end justify-between">
                        <div>
                            <span className="text-2xl font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
                        </div>
                        <button className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
