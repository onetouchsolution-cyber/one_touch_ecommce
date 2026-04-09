import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBoxOpen, FaChevronRight, FaSearch, FaFilter } from 'react-icons/fa';
import API from '../../services/api';

const OrderListPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await API.get('/orders/myorders');
                setOrders(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch orders');
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'All' || order.status === filter;
        const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.orderItems.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Packed': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Dispatched': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Out for Delivery': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto py-12 px-4 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto py-12 px-4 text-center text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Order ID or Product"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none w-full sm:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none w-full sm:w-48 appearance-none bg-white"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All">All Orders</option>
                            <option value="Order Placed">Order Placed</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Packed">Packed</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Out for Delivery">Out For Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FaBoxOpen size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">No orders found</h2>
                    <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
                    <Link to="/products" className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOrders.map((order, index) => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Order ID</p>
                                        <p className="font-mono font-medium text-slate-900">#{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Date Placed</p>
                                        <p className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                                        <p className="font-bold text-slate-900">₹{order.totalPrice?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <Link
                                        to={`/account/orders/${order._id}`}
                                        className="hidden md:flex items-center gap-1 text-brand-600 hover:text-brand-800 font-medium text-sm"
                                    >
                                        View Details <FaChevronRight size={12} />
                                    </Link>
                                </div>

                                <div className="border-t border-gray-50 pt-6">
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Show first 3 images */}
                                        <div className="flex -space-x-3 overflow-hidden">
                                            {order.orderItems.slice(0, 4).map((item, i) => (
                                                <div key={i} className="h-12 w-12 rounded-lg border-2 border-white shadow-sm overflow-hidden bg-gray-50 relative z-0 hover:z-10 transition-all">
                                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                </div>
                                            ))}
                                            {order.orderItems.length > 4 && (
                                                <div className="h-12 w-12 rounded-lg border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 z-0">
                                                    +{order.orderItems.length - 4}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-slate-800 font-medium line-clamp-1">
                                                {order.orderItems.map(item => item.name).join(', ')}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {order.orderItems.reduce((acc, item) => acc + item.qty, 0)} items
                                            </p>
                                        </div>

                                        <Link
                                            to={`/account/orders/${order._id}`}
                                            className="md:hidden flex items-center justify-center gap-1 text-brand-600 hover:text-brand-800 font-medium text-sm mt-2 sm:mt-0"
                                        >
                                            View Details <FaChevronRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderListPage;
