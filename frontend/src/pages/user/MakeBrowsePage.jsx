import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import API from '../../services/api';
import Breadcrumb from '../../components/common/Breadcrumb';

const MakeBrowsePage = () => {
    const [makes, setMakes] = useState([]);
    const [filteredMakes, setFilteredMakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMakes();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = makes.filter(make =>
                make.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredMakes(filtered);
        } else {
            setFilteredMakes(makes);
        }
    }, [searchTerm, makes]);

    const fetchMakes = async () => {
        try {
            const { data } = await API.get('/makes');
            setMakes(data);
            setFilteredMakes(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching makes:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="py-8">
            <Breadcrumb items={[{ label: 'Browse by Make' }]} />

            <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-800 mb-4">Browse by Make</h1>
                <p className="text-gray-600">Select a device manufacturer to view compatible models and products</p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
                <div className="relative max-w-md">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search makes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Makes Grid */}
            {filteredMakes.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No makes found</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredMakes.map((make, index) => (
                        <motion.div
                            key={make._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                to={`/make/${make.slug}/models`}
                                className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-brand group"
                            >
                                <div className="flex flex-col items-center text-center">
                                    {make.logo ? (
                                        <div className="w-24 h-24 mb-4 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-brand-light/10 transition">
                                            <img
                                                src={make.logo}
                                                alt={make.name}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 mb-4 flex items-center justify-center bg-gray-100 rounded-lg text-4xl font-bold text-gray-400 group-hover:bg-brand-light/10 group-hover:text-brand transition">
                                            {make.name.charAt(0)}
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-brand transition">
                                        {make.name}
                                    </h3>
                                    {make.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {make.description}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MakeBrowsePage;
