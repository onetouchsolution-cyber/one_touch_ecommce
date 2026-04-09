import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import API from '../../services/api';
import UniversalImageUpload from '../../components/common/UniversalImageUpload';

const AdminModelListPage = () => {
    const [models, setModels] = useState([]);
    const [makes, setMakes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingModel, setEditingModel] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        make: '',
        category: '',
        description: '',
        image: '',
        releaseYear: new Date().getFullYear(),
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [modelsRes, makesRes, categoriesRes] = await Promise.all([
                API.get('/models'),
                API.get('/makes'),
                API.get('/categories')
            ]);
            setModels(modelsRes.data);
            setMakes(makesRes.data);
            setCategories(categoriesRes.data.filter(cat => !cat.parent));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleEdit = (model) => {
        setEditingModel(model);
        setFormData({
            name: model.name,
            make: typeof model.make === 'object' ? model.make._id : model.make,
            category: model.category ? (typeof model.category === 'object' ? model.category._id : model.category) : '',
            description: model.description || '',
            image: model.image || '',
            releaseYear: model.releaseYear || new Date().getFullYear(),
            isActive: model.isActive
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingModel(null);
        setFormData({
            name: '',
            make: '',
            category: '',
            description: '',
            image: '',
            releaseYear: new Date().getFullYear(),
            isActive: true
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                category: formData.category || null
            };

            if (editingModel) {
                await API.put(`/models/id/${editingModel._id}`, submitData);
            } else {
                await API.post('/models', submitData);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving model');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will fail if there are products using this model.')) {
            try {
                await API.delete(`/models/id/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting model');
            }
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Models Management</h1>
                <button
                    onClick={handleCreate}
                    className="bg-brand hover:bg-brand-dark text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition"
                >
                    <FaPlus /> <span>Add Model</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Make</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {models.map((model) => (
                            <tr key={model._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-slate-800">{model.name}</td>
                                <td className="px-6 py-4 text-gray-600 font-mono text-sm">{model.slug}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    {typeof model.make === 'object' ? model.make.name : model.make}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {model.category ? (typeof model.category === 'object' ? model.category.name : model.category) : '-'}
                                </td>
                                <td className="px-6 py-4 text-gray-600">{model.releaseYear || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${model.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {model.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(model)}
                                            className="text-blue-600 hover:text-blue-800 transition"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(model._id)}
                                            className="text-red-600 hover:text-red-800 transition"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">{editingModel ? 'Edit Model' : 'Create Model'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                                <select
                                    value={formData.make}
                                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                                    required
                                >
                                    <option value="">Select Make</option>
                                    {makes.map((make) => (
                                        <option key={make._id} value={make._id}>{make.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                                    rows="3"
                                />
                            </div>
                            <div>
                                <UniversalImageUpload
                                    value={formData.image}
                                    onChange={(newUrl) => setFormData({ ...formData, image: newUrl })}
                                    label="Image"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Release Year</label>
                                <input
                                    type="number"
                                    value={formData.releaseYear}
                                    onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                                />
                            </div>
                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Active</span>
                                </label>
                            </div>
                            <div className="flex space-x-2 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-brand hover:bg-brand-dark text-white py-2 rounded-lg transition"
                                >
                                    {editingModel ? 'Update' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminModelListPage;
