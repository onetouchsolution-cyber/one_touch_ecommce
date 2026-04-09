import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { motion } from 'framer-motion';
import { FaMobileAlt, FaBox } from 'react-icons/fa';

// Reusing ProductCard or creating a simple one
const ProductCard = ({ product }) => (
    <Link to={`/product/${product.slug}`} className="block">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 border border-slate-100 flex flex-col h-full">
            <div className="h-40 mb-4 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-slate-500 mb-2">{product.brand?.name} • {product.model?.name}</p>
            </div>
            <div className="mt-auto pt-3 border-t border-slate-50 flex justify-between items-center">
                <span className="font-bold text-brand-600">₹{product.price}</span>
            </div>
        </div>
    </Link>
);

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState({ models: [], products: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                // Remove limit for full page results or use pagination (defaulting to API limit for now, maybe increase?)
                // API currently limits to 5. We might need a separate 'limit' param or a new endpoint for full results.
                // For now, using the same endpoint. If specific requirements arise, I'll add limit param.
                // Re-using same processing logic as GlobalSearch but maybe backend should accept limit.
                // But let's assume the user accepted the plan which used same endpoint.
                const { data } = await API.get(`/search?q=${query}`);
                setResults(data);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (!query) {
        return <div className="text-center py-20">Please enter a search term</div>;
    }

    if (loading) {
        return <div className="text-center py-20">Loading results for "{query}"...</div>;
    }

    const hasResults = results.models.length > 0 || results.products.length > 0;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>

            {!hasResults && (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                    <p className="text-slate-500">No results found.</p>
                </div>
            )}

            {/* Models Section */}
            {results.models.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <FaMobileAlt /> Matching Models
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {results.models.map((model) => (
                            <Link
                                key={model._id}
                                to={`/make/${model.brand?.slug || 'unknown'}/model/${model.slug}/products`}
                                className="bg-white border border-slate-100 rounded-xl p-4 text-center hover:shadow-md transition-all hover:border-brand-500 block"
                            >
                                <div className="h-16 w-16 mx-auto bg-slate-50 rounded-lg flex items-center justify-center mb-3">
                                    {model.image ? <img src={model.image} alt={model.name} className="h-full w-full object-contain" /> : <FaMobileAlt className="text-2xl text-slate-400" />}
                                </div>
                                <h3 className="font-semibold text-slate-700">{model.name}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Products Section */}
            {results.products.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <FaBox /> Matching Products
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {results.products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;
