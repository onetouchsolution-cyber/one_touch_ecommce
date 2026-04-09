import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaCalendar } from 'react-icons/fa';
import API from '../../services/api';
import Breadcrumb from '../../components/common/Breadcrumb';

const ModelListPage = () => {
    const { categorySlug, makeSlug } = useParams();
    const [category, setCategory] = useState(null);
    const [make, setMake] = useState(null);
    const [models, setModels] = useState([]);
    const [filteredModels, setFilteredModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Determine navigation mode
    const isCategoryMode = !!categorySlug;

    useEffect(() => {
        fetchData();
    }, [categorySlug, makeSlug]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = models.filter(model =>
                model.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredModels(filtered);
        } else {
            setFilteredModels(models);
        }
    }, [searchTerm, models]);

    const fetchData = async () => {
        try {
            // Fetch make details
            const { data: makeData } = await API.get(`/makes/${makeSlug}`);
            setMake(makeData);

            let modelsData;

            if (isCategoryMode) {
                // Category-based flow: fetch category and models
                const { data: categories } = await API.get('/categories');
                const foundCategory = categories.find(cat => cat.slug === categorySlug);
                setCategory(foundCategory);

                if (foundCategory) {
                    const { data } = await API.get(`/models/category-slug/${categorySlug}/make-slug/${makeSlug}`);
                    modelsData = data;
                }
            } else {
                // Make-based flow: fetch all models for this make
                const { data } = await API.get(`/models/make-slug/${makeSlug}`);
                modelsData = data;
            }

            setModels(modelsData || []);
            setFilteredModels(modelsData || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (!make) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Make not found</p>
                <Link to="/makes" className="text-brand hover:underline mt-4 inline-block">
                    Browse Makes
                </Link>
            </div>
        );
    }

    // Build breadcrumb based on navigation mode
    const breadcrumbItems = isCategoryMode && category
        ? [
            { label: 'Categories', link: '/categories' },
            { label: category.name, link: `/category/${category.slug}` },
            { label: 'Makes', link: `/category/${categorySlug}/makes` },
            { label: make.name },
            { label: 'Models' }
        ]
        : [
            { label: 'Makes', link: '/makes' },
            { label: make.name },
            { label: 'Models' }
        ];

    return (
        <div className="py-8">
            <Breadcrumb items={breadcrumbItems} />

            <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-800 mb-4">
                    {make.name} Models {isCategoryMode && category && `- ${category.name}`}
                </h1>
                <p className="text-gray-600">
                    Select a model to view compatible products
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
                <div className="relative max-w-md">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search models..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Models Grid */}
            {filteredModels.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No models available</p>
                    <Link
                        to={isCategoryMode ? `/category/${categorySlug}/makes` : '/makes'}
                        className="text-brand hover:underline mt-4 inline-block"
                    >
                        Go Back
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredModels.map((model, index) => (
                        <motion.div
                            key={model._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                to={
                                    isCategoryMode
                                        ? `/category/${categorySlug}/make/${makeSlug}/model/${model.slug}/products`
                                        : `/make/${makeSlug}/model/${model.slug}/products`
                                }
                                className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-brand group"
                            >
                                <div className="flex items-start space-x-4">
                                    {model.image ? (
                                        <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden group-hover:bg-brand-light/10 transition">
                                            <img
                                                src={model.image}
                                                alt={model.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-400 group-hover:bg-brand-light/10 group-hover:text-brand transition">
                                            {model.name.charAt(0)}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-brand transition truncate">
                                            {model.name}
                                        </h3>
                                        {model.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                {model.description}
                                            </p>
                                        )}
                                        {model.releaseYear && (
                                            <div className="flex items-center text-xs text-gray-500">
                                                <FaCalendar className="mr-1" />
                                                {model.releaseYear}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ModelListPage;
