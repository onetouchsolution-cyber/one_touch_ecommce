import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';

const ProductGrid = ({ products, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500 text-lg">No products found matching your criteria.</p>
                <button
                    onClick={() => window.location.reload()} // Simplistic reset, proper way is clearing parent filters
                    className="mt-4 text-brand-600 hover:underline"
                >
                    Clear Filters
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
                <Link to={`/product/${product.slug}`} key={product._id} className="block group">
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 border border-slate-100 h-full flex flex-col relative">
                        {product.countInStock === 0 && (
                            <span className="absolute top-4 left-4 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full z-10">OUT OF STOCK</span>
                        )}
                        <div className="h-48 mb-4 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden p-4 group-hover:scale-105 transition-transform duration-500">
                            <img src={product.image} alt={product.name} className="h-full w-full object-contain mix-blend-multiply" />
                        </div>

                        <div className="flex-1 flex flex-col">
                            <div className="text-xs text-slate-400 mb-1">{product.brand?.name}</div>
                            <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-brand-600 transition-colors">{product.name}</h3>
                            <div className="mt-auto flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-slate-900">₹{product.price}</span>
                                    {/* <span className="text-xs text-slate-400 line-through">₹{product.price * 1.2}</span> */}
                                </div>
                                <button className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors">
                                    <FaShoppingCart size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ProductGrid;
