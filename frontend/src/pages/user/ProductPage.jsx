import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaSort, FaTimes } from 'react-icons/fa';
import API from '../../services/api';
import Breadcrumb from '../../components/common/Breadcrumb';
import ProductCard from '../../components/product/ProductCard';
import Button from '../../components/common/Button';

const ProductPage = () => {
    const { categorySlug, makeSlug, modelSlug } = useParams();
    const [searchParams] = useSearchParams();
    const searchFilter = searchParams.get('search');

    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [make, setMake] = useState(null);
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Determine navigation mode
    const isCategoryMode = !!categorySlug;
    const isHierarchical = !!(makeSlug && modelSlug);

    useEffect(() => {
        fetchData();
    }, [categorySlug, makeSlug, modelSlug, searchFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let queryParams = {};

            if (searchFilter) {
                // Search mode
                const { data } = await API.get(`/products?search=${searchFilter}`);
                setProducts(data.products || data);
            } else if (isHierarchical) {
                // Hierarchical mode
                if (isCategoryMode) {
                    queryParams = { categorySlug, makeSlug, modelSlug };
                } else {
                    queryParams = { makeSlug, modelSlug };
                }

                const { data } = await API.get('/products', { params: queryParams });
                setProducts(data.products || data);

                // Fetch metadata
                if (categorySlug) {
                    const { data: categories } = await API.get('/categories');
                    setCategory(categories.find(c => c.slug === categorySlug));
                }
                if (makeSlug) {
                    const { data: makeData } = await API.get(`/makes/${makeSlug}`);
                    setMake(makeData);
                }
                if (modelSlug && makeSlug) {
                    const { data: modelData } = await API.get(`/models/${makeSlug}/${modelSlug}`);
                    setModel(modelData);
                }
            } else {
                // All products
                const { data } = await API.get('/products');
                setProducts(data.products || data);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    // Filter and sort products
    const filteredProducts = products
        .filter(p => !inStockOnly || p.countInStock > 0)
        .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'popularity':
                    return (b.rating || 0) - (a.rating || 0);
                case 'newest':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

    // Build breadcrumb
    const buildBreadcrumb = () => {
        const items = [];

        if (searchFilter) {
            items.push({ label: `Search: "${searchFilter}"` });
        } else if (isHierarchical) {
            if (isCategoryMode && category) {
                items.push({ label: 'Categories', link: '/categories' });
                items.push({ label: category.name, link: `/category/${category.slug}` });
                items.push({ label: 'Makes', link: `/category/${categorySlug}/makes` });
            } else {
                items.push({ label: 'Makes', link: '/makes' });
            }

            if (make) {
                items.push({
                    label: make.name,
                    link: isCategoryMode
                        ? `/category/${categorySlug}/make/${makeSlug}/models`
                        : `/make/${makeSlug}/models`
                });
            }

            if (model) {
                items.push({ label: model.name });
            }

            items.push({ label: 'Products' });
        } else {
            items.push({ label: 'All Products' });
        }

        return items;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <div className="container mx-auto px-4 py-8">
                <Breadcrumb items={buildBreadcrumb()} />

                <div className="flex flex-col md:flex-row justify-between items-end mb-8 mt-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                            {searchFilter
                                ? `Results for "${searchFilter}"`
                                : model
                                    ? `${model.name} Parts`
                                    : make
                                        ? `${make.name} Parts`
                                        : 'All Components'
                            }
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Showing {filteredProducts.length} premium {filteredProducts.length === 1 ? 'part' : 'parts'}
                        </p>
                    </div>

                    <button
                        className="md:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 mt-4 md:mt-0"
                        onClick={() => setShowMobileFilters(true)}
                    >
                        <FaFilter className="text-brand-600" /> Filters
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar - Desktop */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 sticky top-24">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center pb-4 border-b border-slate-100">
                                <FaFilter className="mr-2 text-brand-600" />
                                Filters
                            </h3>

                            {/* Sort */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <FaSort className="inline mr-1 text-slate-400" />
                                    Sort By
                                </label>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="newest">Newest Arrivals</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="popularity">Most Popular</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    Price Range (₹)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={priceRange[0]}
                                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                        placeholder="Min"
                                    />
                                    <span className="text-slate-400">-</span>
                                    <input
                                        type="number"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>

                            {/* Availability */}
                            <div>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={inStockOnly}
                                            onChange={(e) => setInStockOnly(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`w-10 h-6 bg-slate-200 rounded-full shadow-inner transition-colors ${inStockOnly ? 'bg-brand-500' : ''}`}></div>
                                        <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${inStockOnly ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-slate-700 group-hover:text-slate-900">In Stock Only</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        {filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                                    🔍
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No products found</h3>
                                <p className="text-slate-500 mb-6">Try adjusting your filters or search criteria.</p>
                                <Button
                                    onClick={() => {
                                        setPriceRange([0, 100000]);
                                        setInStockOnly(false);
                                        setSortBy('newest');
                                    }}
                                    variant="secondary"
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {filteredProducts.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
