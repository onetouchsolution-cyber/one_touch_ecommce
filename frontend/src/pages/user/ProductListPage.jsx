import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { motion } from 'framer-motion';
import { FaFilter } from 'react-icons/fa';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilters from '../../components/product/ProductFilters';
import ProductSort from '../../components/product/ProductSort';

const ProductListPage = ({ vertical }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [filterMeta, setFilterMeta] = useState({ categories: [], subcategories: [], makes: [], models: [] });

    // Filter state synced with URL + Vertical prop
    const params = Object.fromEntries([...searchParams]);

    // Derived filters object
    const filters = {
        group: vertical, // Pass vertical as group to backend
        categoryKey: params.categoryKey || '',
        subcategorySlug: params.subcategorySlug || '',
        makeSlug: params.makeSlug || '',
        modelSlug: params.modelSlug || '',
        brandSlug: params.brandSlug || '', // Legacy
        minPrice: params.minPrice || '',
        maxPrice: params.maxPrice || '',
        inStock: params.inStock || '',
        sort: params.sort || 'new',
        page: params.page || 1,
        ...params
    };

    const updateFilters = (newFilters) => {
        let nextParams = { ...params, ...newFilters };

        // Smart Filters: No manual resets needed.
        // We trust the user's selection and let the background validation cleanup if needed.

        // Cleanup empty
        Object.keys(nextParams).forEach(key => {
            if (nextParams[key] === '' || nextParams[key] === undefined) delete nextParams[key];
        });

        // Remove internal props from URL if any mistakenly added
        if (vertical) delete nextParams.group;

        setSearchParams(nextParams);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Construct Query
                const query = new URLSearchParams(filters);
                if (vertical) query.set('group', vertical);

                const { data } = await API.get(`/products?${query.toString()}`);

                if (data.products) {
                    setProducts(data.products);
                    setMeta({ page: data.page, pages: data.pages, total: data.total });
                } else {
                    setProducts(data);
                }

                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch products', error);
                setLoading(false);
            }
        };

        const fetchFilterMeta = async () => {
            try {
                // Smart Filter API
                const metaQuery = new URLSearchParams({
                    group: vertical || '',
                    categoryKey: filters.categoryKey || '',
                    subcategorySlug: filters.subcategorySlug || '',
                    makeSlug: filters.makeSlug || '',
                    modelSlug: filters.modelSlug || ''
                });

                const { data } = await API.get(`/products/filters/smart?${metaQuery.toString()}`);
                setFilterMeta(data);

                // Auto-Cleanup: If current selections are invalid according to backend options, remove them.

                let cleanup = {};
                let needsCleanup = false;
                const isInvalid = (slug, list) => list && list.length > 0 && !list.some(i => i.slug === slug);

                // Check Subcategory
                if (filters.subcategorySlug && isInvalid(filters.subcategorySlug, data.subcategories)) {
                    cleanup.subcategorySlug = '';
                    needsCleanup = true;
                }

                // Check Make
                if (filters.makeSlug && data.makes && data.makes.length > 0) {
                    const selected = filters.makeSlug.split(',');
                    const validSlugs = data.makes.map(m => m.slug);
                    const newSelected = selected.filter(s => validSlugs.includes(s));

                    if (newSelected.length !== selected.length) {
                        cleanup.makeSlug = newSelected.join(',');
                        needsCleanup = true;
                    }
                }

                // Check Model
                if (filters.modelSlug && isInvalid(filters.modelSlug, data.models)) {
                    cleanup.modelSlug = '';
                    needsCleanup = true;
                }

                if (needsCleanup) {
                    // Debounce or immediate update? Immediate update is fine as it corrects the URL.
                    // We merge with current filters to ensure we don't lose other state, 
                    // although updateFilters does that merging too.
                    console.log("Smart Filter Cleaned up:", cleanup);
                    updateFilters(cleanup);
                }

            } catch (err) {
                console.error("Failed to fetch filters", err);
            }
        };

        fetchProducts();
        fetchFilterMeta();
        window.scrollTo(0, 0);
    }, [searchParams, vertical]); // Re-run when URL changes or vertical changes

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 capitalize mb-2">
                        {vertical ? vertical.replace('-', ' & ') + ' Products' : 'All Products'}
                    </h1>
                    <p className="text-slate-500">
                        Showing {products.length} of {meta.total} results
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium"
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                    >
                        <FaFilter /> Filters
                    </button>
                    <ProductSort currentSort={filters.sort} onSortChange={(val) => updateFilters({ sort: val, page: 1 })} />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Desktop Filters */}
                <aside className="hidden md:block w-64 flex-shrink-0">
                    <ProductFilters
                        filters={filters}
                        setFilters={(fn) => {
                            const newState = fn(filters);
                            updateFilters(newState);
                        }}
                        meta={filterMeta}
                    />
                </aside>

                {/* Mobile Filters Drawer */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setShowMobileFilters(false)}>
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Filters</h2>
                                <button onClick={() => setShowMobileFilters(false)}>Close</button>
                            </div>
                            <ProductFilters
                                filters={filters}
                                setFilters={(fn) => {
                                    const newState = fn(filters);
                                    updateFilters(newState);
                                }}
                                meta={filterMeta}
                            />
                        </motion.div>
                    </div>
                )}

                {/* Products Grid */}
                <main className="flex-1">
                    <ProductGrid products={products} loading={loading} />

                    {/* Pagination */}
                    {meta.pages > 1 && (
                        <div className="flex justify-center mt-12 gap-2">
                            {[...Array(meta.pages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => updateFilters({ page: i + 1 })}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${(i + 1) === Number(filters.page)
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProductListPage;
