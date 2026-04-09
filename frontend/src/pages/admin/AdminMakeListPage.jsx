import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import UniversalImageUpload from '../../components/common/UniversalImageUpload';
import Button from '../../components/common/Button';

const AdminMakeListPage = () => {
    const [makes, setMakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMake, setEditingMake] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logo: '',
        productType: 'mobile',
        isActive: true
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMakes();
    }, []);

    const fetchMakes = async () => {
        try {
            const { data } = await API.get('/makes');
            setMakes(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching makes:', error);
            setLoading(false);
        }
    };

    const handleEdit = (make) => {
        setEditingMake(make);
        setFormData({
            name: make.name,
            description: make.description || '',
            logo: make.logo || '',
            isActive: make.isActive
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingMake(null);
        setFormData({
            name: '',
            description: '',
            logo: '',
            isActive: true
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMake) {
                await API.put(`/makes/id/${editingMake._id}`, formData);
            } else {
                await API.post('/makes', formData);
            }
            setShowModal(false);
            fetchMakes();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving make');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will fail if there are products using this make.')) {
            try {
                await API.delete(`/makes/id/${id}`);
                fetchMakes();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting make');
            }
        }
    };

    const filteredMakes = makes.filter(make =>
        make.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Makes & Brands</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage manufacturer brands and makes</p>
                </div>

                <Button
                    onClick={handleCreate}
                    className="flex items-center gap-2 shadow-lg shadow-brand-500/20"
                >
                    <FaPlus /> Add New Make
                </Button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <FaSearch />
                    </div>
                    <input
                        type="text"
                        placeholder="Search makes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Brand Info</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredMakes.map((make) => (
                            <motion.tr
                                key={make._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-slate-50/50 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 p-1 flex items-center justify-center overflow-hidden shadow-sm">
                                            {make.logo ? (
                                                <img src={make.logo} alt={make.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-slate-400 font-bold text-lg">{make.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <span className="font-semibold text-slate-800">{make.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500 font-mono text-xs bg-slate-50 rounded-lg w-fit">
                                    {make.slug}
                                </td>
                                <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{make.description || '-'}</td>
                                <td className="px-6 py-4">
                                    {make.isActive ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                            Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(make)}
                                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(make._id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full"
                        >
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
                                {editingMake ? 'Edit Make' : 'Create New Make'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Brand Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                        required
                                        placeholder="e.g., Samsung"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
                                        rows="3"
                                        placeholder="Brief brand description..."
                                    />
                                </div>
                                <div>
                                    <UniversalImageUpload
                                        value={formData.logo}
                                        onChange={(newUrl) => setFormData({ ...formData, logo: newUrl })}
                                        label="Brand/Make Logo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Type</label>
                                    <select
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                        value={formData.productType || 'mobile'}
                                        onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                                    >
                                        <option value="mobile">Mobile</option>
                                        <option value="laptop">Laptop</option>
                                        <option value="cctv">CCTV</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                    </label>
                                    <span className="text-sm font-medium text-slate-700">Active Status</span>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="flex-1"
                                    >
                                        {editingMake ? 'Update Brand' : 'Create Brand'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminMakeListPage;
