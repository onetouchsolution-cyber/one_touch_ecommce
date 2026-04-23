import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import SafeImage from '../../components/common/SafeImage';

// Product Card Component (Internal for now)
const ProductCard = ({ product }) => (
    <Link to={`/product/${product.slug}`} className="block">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 border border-slate-100 flex flex-col h-full">
            <div className="h-40 mb-4 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                <SafeImage src={product.image} alt={product.name} className="h-full w-full object-contain" />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-slate-500 mb-2">{product.brand?.name} • {product.model?.name}</p>
            </div>
            <div className="mt-auto pt-3 border-t border-slate-50 flex justify-between items-center">
                <span className="font-bold text-brand-600">₹{product.price}</span>
                {product.countInStock > 0 ? (
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">In Stock</span>
                ) : (
                    <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full">Out of Stock</span>
                )}
            </div>
        </div>
    </Link>
);

const SubcategoryPage = () => {
    const { categorySlug, subcategorySlug } = useParams();
    const [subcategory, setSubcategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Subcategory Details using slug
                // We assume backend has /api/subcategories/slug/:slug
                // Or filtered by category if slug is not unique globally? Slugs should be unique.
                const subRes = await API.get(`/subcategories/slug/${subcategorySlug}`);
                const subData = subRes.data;
                setSubcategory(subData);

                if (subData) {
                    // 2. Fetch Products
                    // Filter by subcategory ID or Slug
                    const prodRes = await API.get(`/products?subcategorySlug=${subData.slug}`);
                    setProducts(prodRes.data.products || prodRes.data || []);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching subcategory data:', err);
                setError('Subcategory not found or failed to load.');
                setLoading(false);
            }
        };

        fetchData();
    }, [categorySlug, subcategorySlug]);


    if (loading) {
        return (
            <div className="container mx-auto px-4 py-10 text-center">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-slate-400 mb-4">😕</h2>
                <p className="text-slate-600 text-lg">{error}</p>
                <Link to={`/categories/${categorySlug}`} className="text-brand-600 hover:underline mt-4 inline-block">Back to Category</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb - simple text for now */}
            <div className="text-sm text-slate-500 mb-6">
                <Link to="/categories" className="hover:text-brand-600">Categories</Link>
                <span className="mx-2">/</span>
                <Link to={`/categories/${categorySlug}`} className="hover:text-brand-600 capitalize">{categorySlug?.replace(/_/g, ' ')}</Link>
                <span className="mx-2">/</span>
                <span className="font-semibold text-slate-800">{subcategory.name}</span>
            </div>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 text-center"
            >
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{subcategory.name}</h1>
                <p className="text-slate-500">Browse {subcategory.name}</p>
            </motion.div>

            {/* Products Grid */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Products</h2>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No products found in this subcategory yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubcategoryPage;
