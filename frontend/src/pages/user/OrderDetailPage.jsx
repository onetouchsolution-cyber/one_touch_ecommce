import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBox, FaShippingFast, FaCheckCircle, FaChevronLeft, FaMapMarkerAlt, FaCreditCard, FaFileInvoice } from 'react-icons/fa';
import API from '../../services/api';

const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await API.get(`/orders/${id}`);
                setOrder(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch order details');
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const getStatusStep = (status) => {
        const steps = ['Order Placed', 'Confirmed', 'Packed', 'Dispatched', 'Out for Delivery', 'Delivered'];
        const index = steps.indexOf(status);
        return index === -1 && status === 'Cancelled' ? -1 : index;
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link to="/account/orders" className="text-brand-600 hover:underline">
                &larr; Back to My Orders
            </Link>
        </div>
    );

    if (!order) return null;

    const currentStep = getStatusStep(order.status);
    const isCancelled = order.status === 'Cancelled';

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Link to="/account/orders" className="inline-flex items-center text-gray-500 hover:text-brand-600 mb-6 transition">
                <FaChevronLeft className="mr-2" size={14} /> Back to Orders
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Details</h1>
                    <p className="text-gray-500">Order ID: <span className="font-mono text-slate-800">#{order._id}</span></p>
                    <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-3">
                    {order.isDelivered && (
                        <button className="flex items-center gap-2 px-4 py-2 border border-brand-200 text-brand-600 rounded-lg hover:bg-brand-50 transition">
                            <FaFileInvoice /> Invoice
                        </button>
                    )}
                    {/* Reorder button logic to be added later */}
                </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-8">Order Status</h2>

                {isCancelled ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-full"><FaBox /></div>
                        <div>
                            <p className="font-bold">Order Cancelled</p>
                            <p className="text-sm">This order has been cancelled.</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="hidden md:flex justify-between w-full absolute top-1/2 -translate-y-1/2 px-8">
                            <div className="w-full bg-gray-200 h-1 rounded-full"></div>
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 bg-brand-500 h-1 rounded-full transition-all duration-1000"
                                style={{ width: `${(currentStep / 5) * 100}%` }}
                            ></div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
                            {['Order Placed', 'Confirmed', 'Packed', 'Dispatched', 'Out for Delivery', 'Delivered'].map((step, index) => {
                                const isCompleted = index <= currentStep;
                                const isCurrent = index === currentStep;

                                return (
                                    <div key={step} className="flex md:flex-col items-center gap-4 md:gap-2 flex-1">
                                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-gray-300 text-gray-300'}`}>
                                            <FaCheckCircle size={16} />
                                        </div>
                                        <div className={`text-left md:text-center ${isCurrent ? 'font-bold text-brand-600' : isCompleted ? 'text-slate-800' : 'text-gray-400'}`}>
                                            <p className="text-sm">{step}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50">
                            <h2 className="text-xl font-bold text-slate-800">Items Ordered</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="p-6 flex gap-4 md:gap-6">
                                    <div className="h-20 w-20 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <Link to={`/product/${item.product}`} className="text-lg font-medium text-slate-800 hover:text-brand-600 transition">
                                            {item.name}
                                        </Link>
                                        <div className="flex justify-between items-end mt-2">
                                            <div>
                                                <p className="text-gray-500">Qty: {item.qty}</p>
                                            </div>
                                            <p className="font-bold text-slate-900">₹{item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Shipping Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                                <FaMapMarkerAlt />
                            </div>
                            <h3 className="font-bold text-slate-800">Shipping Address</h3>
                        </div>
                        <p className="text-slate-700 font-medium">{order.user?.name}</p>
                        <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                            {order.shippingAddress.address}<br />
                            {order.shippingAddress.city}<br />
                            {order.shippingAddress.country} - {order.shippingAddress.postalCode}
                        </p>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-forwards">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <FaCreditCard />
                            </div>
                            <h3 className="font-bold text-slate-800">Payment Information</h3>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600 text-sm">Method</span>
                            <span className="font-medium text-slate-800">{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Status</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {order.isPaid ? 'PAID' : 'PENDING'}
                            </span>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-forwards">
                        <h3 className="font-bold text-slate-800 mb-4">Order Summary</h3>
                        <div className="space-y-3 pb-4 border-b border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-slate-900 font-medium">₹{order.itemsPrice?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-slate-900 font-medium">₹{order.shippingPrice?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax</span>
                                <span className="text-slate-900 font-medium">₹{order.taxPrice?.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex justify-between pt-4">
                            <span className="font-bold text-slate-900">Total</span>
                            <span className="font-bold text-brand-600 text-lg">₹{order.totalPrice?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
