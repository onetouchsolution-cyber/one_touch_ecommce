import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import CategoryGrid from '../../components/common/CategoryGrid'; // Ensure this path is correct if reusing or remove if not needed for this page
import SafeImage from '../../components/common/SafeImage';
// Actually, we are building a specific Category Page here, so likely we want a specific Subcategory Grid + Product Grid.

// Product Card Component (Internal for now, or import)
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

const CategoryPage = () => {
    const { slug } = useParams();
    const [category, setCategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // If slug is present, fetch specific category data
    // If not, show the main CategoryGrid (Explore Categories)
    const isCategoryDetail = !!slug;

    useEffect(() => {
        if (!isCategoryDetail) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Category Details
                const catRes = await API.get(`/categories/slug/${slug}`);
                const catData = catRes.data;
                setCategory(catData);

                if (catData) {
                    // 2. Fetch Subcategories (Product Types)
                    // Filter by categoryKey if available, or Slug (assuming they match for now, or backend handles it)
                    // The backend expects 'category' query param which maps to 'categoryKey'
                    const subRes = await API.get(`/subcategories?category=${catData.key || catData.slug}`);
                    setSubcategories(subRes.data);

                    // 3. Fetch Products
                    const prodRes = await API.get(`/products?categoryKey=${catData.key || catData.slug}`);
                    setProducts(prodRes.data.products || prodRes.data || []);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching category data:', err);
                setError('Category not found or failed to load.');
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, isCategoryDetail]);

    if (!isCategoryDetail) {
        return (
            <div className="container mx-auto px-4 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <h1 className="text-3xl font-bold text-slate-900">Explore Categories</h1>
                    <p className="text-slate-500 mt-2">Find the right part for your device</p>
                </motion.div>
                <CategoryGrid />
            </div>
        );
    }

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
                <Link to="/categories" className="text-brand-600 hover:underline mt-4 inline-block">Browse All Categories</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 text-center relative rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 md:p-12 overflow-hidden"
            >
                {/* Background Pattern or Image could go here */}
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{category.name}</h1>
                    <p className="text-slate-300 max-w-2xl mx-auto">{category.description || `Browse our collection of ${category.name}`}</p>
                </div>
            </motion.div>

            {/* Subcategories (Product Types) */}
            {subcategories.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Product Types</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {subcategories.map((sub) => {
                            const catIdentifier = category.key || category.slug || category._id;
                            const subIdentifier = sub.slug || sub._id;

                            return (
                                <Link
                                    to={`/categories/${catIdentifier}/${subIdentifier}`}
                                    key={sub._id}
                                    className="bg-white border border-slate-100 rounded-xl p-4 text-center hover:shadow-md transition-all hover:border-brand-500 cursor-pointer group block"
                                >
                                    <div className="h-12 w-12 mx-auto bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                        {/* Icon placeholder if no image */}
                                        {sub.logo ? <SafeImage src={sub.logo} alt={sub.name} className="h-8 w-8 object-contain" /> : <span className="text-xl">#</span>}
                                    </div>
                                    <h3 className="font-semibold text-slate-700 text-sm group-hover:text-brand-700">{sub.name}</h3>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Products Grid */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Featured Products</h2>
                    <Link to={`/products?categoryKey=${category.key || category.slug}`} className="text-sm text-brand-600 font-medium hover:underline">View All</Link>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No products found in this category yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
