import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSync } from 'react-icons/fa';
import API from '../../services/api';
import ProductFormModal from '../../components/admin/ProductFormModal';

const AdminProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncLoading, setSyncLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProducts = async () => {
        try {
            const { data } = await API.get('/products');
            setProducts(data.products || data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching products", error);
            setLoading(false);
        }
    };

    const syncZohoHandler = async () => {
        if (window.confirm('This will sync items and stock from Zoho Inventory. Local stock updates will be overwritten. Continue?')) {
            setSyncLoading(true);
            try {
                const { data } = await API.post('/products/sync-zoho');
                alert(`Sync Complete: ${data.details.totalSynced} items synced. ${data.details.totalFailed} failed.`);
                fetchProducts(); // Refresh list
            } catch (error) {
                console.error("Zoho Sync Failed", error);
                alert(error.response?.data?.message || 'Zoho Sync Failed');
            } finally {
                setSyncLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                // Assuming backend has delete endpoint
                await API.delete(`/products/${id}`);
                setProducts(products.filter(p => p._id !== id));
            } catch (error) {
                console.error("Error deleting product", error);
                alert("Failed to delete product");
            }
        }
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setShowModal(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleModalSuccess = () => {
        setShowModal(false);
        fetchProducts();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            {/* Zoho Integration Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg shadow-sm">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            <span className="font-bold">Note:</span> Products and Stock levels are synchronized with Zoho Inventory.
                            Changes made to stock quantities here might be overwritten during the next sync cycle.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Products</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={syncZohoHandler}
                        disabled={syncLoading}
                        className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition ${syncLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <FaSync className={syncLoading ? 'animate-spin' : ''} />
                        <span>{syncLoading ? 'Syncing...' : 'Fetch Latest Items & Stock'}</span>
                    </button>
                    <Link
                        to="/admin/products/bulk"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
                    >
                        <FaSync />
                        <span>Bulk Import/Export</span>
                    </Link>
                    <button
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
                    >
                        <FaPlus />
                        <span>Create Product</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product._id.substring(0, 10)}...</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{product.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {typeof product.category === 'object' ? product.category.name : product.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {/* Handle brand/make populating correctly */}
                                    {product.make ? (typeof product.make === 'object' ? product.make.name : 'Unknown') : 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4 inline-block"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => deleteHandler(product._id)} className="text-red-600 hover:text-red-900 inline-block">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <ProductFormModal
                    product={editingProduct}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleModalSuccess}
                />
            )}
        </div>
    );
};

export default AdminProductListPage;
