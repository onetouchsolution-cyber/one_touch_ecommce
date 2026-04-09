import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import API from '../../services/api';
import UniversalImageUpload from '../common/UniversalImageUpload';

const ProductFormModal = ({ product, onClose, onSuccess }) => {
    const isAddMode = !product;

    const [name, setName] = useState(product?.name || '');
    const [price, setPrice] = useState(product?.price || 0);
    const [image, setImage] = useState(product?.image || '');
    const [make, setMake] = useState(product?.make?._id || product?.make || '');
    const [model, setModel] = useState(product?.model?._id || product?.model || '');
    const [category, setCategory] = useState(product?.category?._id || product?.category || '');
    const [subcategory, setSubcategory] = useState(product?.subcategory?._id || product?.subcategory || '');
    const [countInStock, setCountInStock] = useState(product?.countInStock || 0);
    const [description, setDescription] = useState(product?.description || '');
    const [isActive, setIsActive] = useState(product?.isActive !== undefined ? product.isActive : true);
    const [specifications, setSpecifications] = useState(
        product?.specifications
            ? Object.entries(product.specifications).map(([key, value]) => ({ key, value }))
            : [{ key: '', value: '' }]
    );

    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMakes();
        fetchCategories();
        if (product) {
            // Initial fetch based on existing data
            if (product.make) fetchModels(typeof product.make === 'object' ? product.make._id : product.make);
            if (product.category) fetchSubcategories(typeof product.category === 'object' ? product.category._id : product.category);
        }
    }, [product]);

    // Fetch models when make changes
    useEffect(() => {
        if (make) {
            fetchModels(make);
        } else {
            setModels([]);
            setModel('');
        }
    }, [make]);

    // Fetch subcategories when category changes
    useEffect(() => {
        if (category) {
            fetchSubcategories(category);
        } else {
            setSubcategories([]);
            setSubcategory('');
        }
    }, [category]);

    const fetchMakes = async () => {
        try {
            const { data } = await API.get('/makes');
            setMakes(data);
        } catch (error) {
            console.error('Error fetching makes:', error);
        }
    };

    const fetchModels = async (makeId) => {
        try {
            const { data } = await API.get(`/models/make/${makeId}`);
            setModels(data);
        } catch (error) {
            console.error('Error fetching models:', error);
            setModels([]);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await API.get('/categories');
            // Filter only parent categories if your logic requires that
            const mainCategories = data.filter(cat => !cat.parent);
            setCategories(mainCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSubcategories = async (categoryId) => {
        try {
            const { data } = await API.get(`/categories/${categoryId}/subcategories`);
            setSubcategories(data);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            setSubcategories([]);
        }
    };

    const addSpecification = () => {
        setSpecifications([...specifications, { key: '', value: '' }]);
    };

    const removeSpecification = (index) => {
        const newSpecs = specifications.filter((_, i) => i !== index);
        setSpecifications(newSpecs.length > 0 ? newSpecs : [{ key: '', value: '' }]);
    };

    const updateSpecification = (index, field, value) => {
        const newSpecs = [...specifications];
        newSpecs[index][field] = value;
        setSpecifications(newSpecs);
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');

        // Validation - Enforce Category and Model logic
        if (!name) return setError('Name is required');
        if (!price) return setError('Price is required');
        if (!category) return setError('Category is required');

        // Check if category requires model
        // We need the category OBJECT to check name/slug.
        // 'category' state is just ID. find it in 'categories' array.
        const selectedCat = categories.find(c => c._id === category);
        const strictModelCategories = ['mobile_parts', 'mobile_case', 'laptop_computer_parts'];
        const isStrictCategory = selectedCat && (
            strictModelCategories.includes(selectedCat.key) ||
            strictModelCategories.includes(selectedCat.slug)
        );

        if (isStrictCategory && !model) return setError('Model is required for this category');

        setLoading(true);

        try {
            // Convert specifications array to object
            const specsObject = {};
            specifications.forEach(spec => {
                if (spec.key && spec.value) {
                    specsObject[spec.key] = spec.value;
                }
            });

            const productData = {
                name,
                price: Number(price),
                image,
                make,
                model,
                category,
                subcategory: subcategory || null,
                countInStock: Number(countInStock),
                description,
                isActive,
                specifications: specsObject
            };

            if (isAddMode) {
                await API.post('/products', productData);
            } else {
                await API.put(`/products/${product._id}`, productData);
            }

            onSuccess();
        } catch (error) {
            setError(error.response?.data?.message || 'Error saving product');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {isAddMode ? 'Add New Product' : 'Edit Product'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. iPhone 13 Screen"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (₹) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Hierarchical Selection */}
                        <div className="p-6 bg-slate-50 rounded-xl space-y-4 border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Categorization</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
                                    <select
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subcategory (Optional)</label>
                                    <select
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
                                        value={subcategory}
                                        onChange={(e) => setSubcategory(e.target.value)}
                                        disabled={!category}
                                    >
                                        <option value="">Select Subcategory</option>
                                        {subcategories.map((subcat) => (
                                            <option key={subcat._id} value={subcat._id}>{subcat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Make (Brand) *</label>
                                    <select
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                        value={make}
                                        onChange={(e) => setMake(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Brand</option>
                                        {makes.map((mk) => (
                                            <option key={mk._id} value={mk._id}>{mk.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Model {
                                            (() => {
                                                const cat = categories.find(c => c._id === category);
                                                const strict = ['mobile_parts', 'mobile_case', 'laptop_computer_parts'];
                                                return cat && (strict.includes(cat.key) || strict.includes(cat.slug)) ? '*' : '(Optional)';
                                            })()
                                        }
                                    </label>
                                    <select
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        disabled={!make}
                                    >
                                        <option value="">Select Model</option>
                                        {models.map((mdl) => (
                                            <option key={mdl._id} value={mdl._id}>{mdl.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Quantity *</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                value={countInStock}
                                onChange={(e) => setCountInStock(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <UniversalImageUpload
                                value={image}
                                onChange={setImage}
                                label="Product Image *"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
                            <textarea
                                rows="3"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* Specifications */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Specifications</label>
                            <div className="space-y-3">
                                {specifications.map((spec, index) => (
                                    <div key={index} className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Key (e.g. Color)"
                                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                                            value={spec.key}
                                            onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Value (e.g. Red)"
                                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                                            value={spec.value}
                                            onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                                        />
                                        {specifications.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSpecification(index)}
                                                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addSpecification}
                                    className="text-sm text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1 mt-2"
                                >
                                    + Add Specification
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 border-gray-300"
                                />
                                <span className="font-medium text-slate-700">Active Product</span>
                            </label>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : (isAddMode ? 'Create Product' : 'Save Changes')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;
