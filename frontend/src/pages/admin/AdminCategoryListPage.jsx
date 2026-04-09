import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronRight, FaToggleOn, FaToggleOff, FaSearch, FaLock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import UniversalImageUpload from '../../components/common/UniversalImageUpload';
import Button from '../../components/common/Button';

const AdminCategoryListPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [modalType, setModalType] = useState('category'); // 'category' or 'subcategory'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        parent: null,
        isActive: true
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await API.get('/categories');
            // Separate categories and subcategories
            const mainCategories = data.filter(cat => !cat.parent);
            setCategories(mainCategories);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setLoading(false);
        }
    };

    const toggleExpand = (categoryId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const openCreateModal = (type = 'category', parent = null) => {
        setModalMode('create');
        setModalType(type);
        setFormData({
            name: '',
            description: '',
            image: '',
            parent: parent,
            isActive: true
        });
        setSelectedCategory(null);
        setShowModal(true);
    };

    const openEditModal = (item, type = 'category') => {
        setModalMode('edit');
        setModalType(type);
        setFormData({
            name: item.name,
            description: item.description || '',
            image: type === 'subcategory' ? (item.logo || '') : (item.image || ''),
            parent: item.category || item.parent || null, // Handle both category ID field names
            isActive: item.isActive !== undefined ? item.isActive : true
        });
        setSelectedCategory(item);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                if (modalType === 'subcategory') {
                    await API.post('/subcategories', {
                        name: formData.name,
                        description: formData.description,
                        image: formData.image, // Mapped to 'logo' in backend if needed? Backend schema says 'logo', frontend says 'image'. 
                        // Wait, controller uses 'logo', frontend uses 'image'. Controller: const { name, category, categoryKey, logo } = req.body;
                        // I should map image -> logo for subcategory? Or just send both?
                        // Let's check Subcategory model... Assuming it has 'image' or 'logo'. seeder.js used 'logo' in comment but passed it?
                        // Controller says: const { name, logo... } = req.body.
                        // I will send as logo.
                        logo: formData.image,
                        category: formData.parent, // Parent ID
                        isActive: formData.isActive
                    });
                } else {
                    await API.post('/categories', formData);
                }
            } else {
                if (modalType === 'subcategory') {
                    await API.put(`/subcategories/${selectedCategory._id}`, {
                        name: formData.name,
                        logo: formData.image,
                        isActive: formData.isActive,
                        // Update parent if changed? Form doesn't allow changing parent cleanly yet, but let's send it.
                        category: formData.parent
                    });
                } else {
                    await API.put(`/categories/${selectedCategory._id}`, formData);
                }
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving category');
        }
    };

    const handleDelete = async (id, isSubcategory = false, hasChildren = false) => {
        if (!isSubcategory && hasChildren) {
            alert('Cannot delete category with subcategories. Delete subcategories first.');
            return;
        }
        if (window.confirm(`Are you sure you want to delete this ${isSubcategory ? 'subcategory' : 'category'}?`)) {
            try {
                if (isSubcategory) {
                    await API.delete(`/subcategories/${id}`);
                } else {
                    await API.delete(`/categories/${id}`);
                }
                fetchCategories();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting item');
            }
        }
    };

    const toggleStatus = async (item, isSubcategory = false) => {
        try {
            const endpoint = isSubcategory ? `/subcategories/${item._id}` : `/categories/${item._id}`;
            await API.put(endpoint, {
                ...item,
                isActive: !item.isActive
            });
            fetchCategories();
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating status');
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Category Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your product categories and subcategories</p>
                </div>

                <Button
                    onClick={() => openCreateModal('category')}
                    className="flex items-center gap-2 shadow-lg shadow-brand-500/20"
                >
                    <FaPlus /> Add Root Category
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
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Structure</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCategories.map((category) => (
                            <React.Fragment key={category._id}>
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-slate-50/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {category.subcategories && category.subcategories.length > 0 && (
                                                <button
                                                    onClick={() => toggleExpand(category._id)}
                                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                                                >
                                                    {expandedCategories.has(category._id) ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                                                </button>
                                            )}

                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                                    {category.image ? (
                                                        <img src={category.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-slate-400 font-bold text-xs">{category.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <span className="font-semibold text-slate-800">{category.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                                        {category.description || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {category.subcategories?.length || 0} Subcategories
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleStatus(category, false)}
                                            className="focus:outline-none transition-transform active:scale-95"
                                        >
                                            {category.isActive ? (
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-100">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                    <span className="text-xs font-semibold text-green-700">Active</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                                    <span className="text-xs font-semibold text-slate-500">Inactive</span>
                                                </div>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button
                                                onClick={() => openCreateModal('subcategory', category._id)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                                                title="Add Subcategory"
                                            >
                                                <FaPlus size={10} /> Add Sub
                                            </button>
                                            <button
                                                onClick={() => openEditModal(category, 'category')}
                                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            {category.is_system ? (
                                                <div className="p-2 text-slate-300" title="System Category (Locked)">
                                                    <FaLock size={12} />
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleDelete(category._id, false, category.subcategories?.length > 0)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>

                                {/* Subcategories Expansion */}
                                <AnimatePresence>
                                    {expandedCategories.has(category._id) && category.subcategories?.map((subcat) => (
                                        <motion.tr
                                            key={subcat._id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-slate-50/50"
                                        >
                                            <td className="px-6 py-3 pl-16 relative">
                                                <div className="absolute left-10 top-1/2 w-4 h-[1px] bg-slate-300"></div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                                                        {subcat.image ? (
                                                            <img src={subcat.image} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-slate-300 text-[10px]">{subcat.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-slate-600 font-medium">{subcat.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-slate-500 text-xs">
                                                {subcat.description || '-'}
                                            </td>
                                            <td className="px-6 py-3 text-slate-400 text-xs">-</td>
                                            <td className="px-6 py-3">
                                                <button onClick={() => toggleStatus(subcat, true)}>
                                                    {subcat.isActive ? (
                                                        <span className="text-green-600 text-xs font-semibold">Active</span>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">Inactive</span>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => openEditModal(subcat, 'subcategory')}
                                                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-white rounded transition-colors"
                                                    >
                                                        <FaEdit size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(subcat._id, true)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors"
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </React.Fragment>
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
                                {modalMode === 'create' ? 'Add New' : 'Edit'} {modalType === 'category' ? 'Category' : 'Subcategory'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                        placeholder="e.g., Electronics"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                                    <textarea
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
                                        placeholder="Brief description..."
                                    />
                                </div>
                                <div>
                                    <UniversalImageUpload
                                        value={formData.image}
                                        onChange={(newUrl) => setFormData({ ...formData, image: newUrl })}
                                        label="Category Image"
                                    />
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
                                        {modalMode === 'create' ? 'Create Category' : 'Save Changes'}
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

export default AdminCategoryListPage;
