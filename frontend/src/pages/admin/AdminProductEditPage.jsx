import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import API from '../../services/api';
import UniversalImageUpload from '../../components/common/UniversalImageUpload';

const AdminProductEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isAddMode = !id;

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');
    const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);

    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMakes();
        fetchCategories();
        if (!isAddMode) {
            fetchProduct();
        }
    }, [id, isAddMode]);

    useEffect(() => {
        if (make) {
            fetchModels(make);
        } else {
            setModels([]);
            setModel('');
        }
    }, [make]);

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

    const fetchProduct = async () => {
        try {
            const { data } = await API.get(`/products/${id}`);
            setName(data.name);
            setPrice(data.price);
            setImage(data.image);
            setMake(typeof data.make === 'object' ? data.make._id : data.make);
            setModel(data.model ? (typeof data.model === 'object' ? data.model._id : data.model) : '');
            setCategory(typeof data.category === 'object' ? data.category._id : data.category);
            setSubcategory(data.subcategory ? (typeof data.subcategory === 'object' ? data.subcategory._id : data.subcategory) : '');
            setCountInStock(data.countInStock);
            setDescription(data.description);

            // Convert specifications Map to array
            if (data.specifications) {
                const specsArray = Object.entries(data.specifications).map(([key, value]) => ({ key, value }));
                setSpecifications(specsArray.length > 0 ? specsArray : [{ key: '', value: '' }]);
            }
        } catch (error) {
            console.error('Error fetching product', error);
            setError('Failed to load product');
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

        // Validation
        if (!make) {
            setError('Please select a make');
            return;
        }
        if (!category) {
            setError('Please select a category');
            return;
        }

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
                model: model || null,
                category,
                subcategory: subcategory || null,
                countInStock: Number(countInStock),
                description,
                specifications: specsObject
            };

            if (isAddMode) {
                await API.post('/products', productData);
            } else {
                await API.put(`/products/${id}`, productData);
            }

            navigate('/admin/products');
        } catch (error) {
            setError(error.response?.data?.message || 'Error saving product');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Link to="/admin/products" className="inline-flex items-center text-gray-600 hover:text-brand mb-6 transition">
                <FaArrowLeft className="mr-2" /> Back to Products
            </Link>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">{isAddMode ? 'Create Product' : 'Edit Product'}</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={submitHandler} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                                value={countInStock}
                                onChange={(e) => setCountInStock(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <UniversalImageUpload
                            value={image}
                            onChange={setImage}
                            label="Product Image *"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Make (Brand) *</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                                value={make}
                                onChange={(e) => setMake(e.target.value)}
                                required
                            >
                                <option value="">Select Make</option>
                                {makes.map((mk) => (
                                    <option key={mk._id} value={mk._id}>
                                        {mk.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Model (Optional)</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                disabled={!make || models.length === 0}
                            >
                                <option value="">
                                    {!make ? 'Select make first' : models.length === 0 ? 'No models available' : 'Select Model (Optional)'}
                                </option>
                                {models.map((mdl) => (
                                    <option key={mdl._id} value={mdl._id}>
                                        {mdl.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory (Optional)</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                value={subcategory}
                                onChange={(e) => setSubcategory(e.target.value)}
                                disabled={!category || subcategories.length === 0}
                            >
                                <option value="">
                                    {!category ? 'Select category first' : subcategories.length === 0 ? 'No subcategories' : 'Select Subcategory (Optional)'}
                                </option>
                                {subcategories.map((subcat) => (
                                    <option key={subcat._id} value={subcat._id}>
                                        {subcat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <textarea
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    {/* Specifications */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Specifications (Optional)</label>
                        <div className="space-y-2">
                            {specifications.map((spec, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Key (e.g., Warranty)"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                                        value={spec.key}
                                        onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value (e.g., 6 months)"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                                        value={spec.value}
                                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                                    />
                                    {specifications.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeSpecification(index)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addSpecification}
                            className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            + Add Specification
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-lg transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : (isAddMode ? 'Create Product' : 'Update Product')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminProductEditPage;
