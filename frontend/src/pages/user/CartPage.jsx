import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const checkoutHandler = () => {
        if (user) {
            navigate('/shipping');
        } else {
            navigate('/login?redirect=shipping');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
                >
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                        <FaTrash size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Cart is Empty</h2>
                    <p className="text-gray-500 mb-8">Looks like you haven't added any items to the cart yet.</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center justify-center space-x-2 bg-brand hover:bg-brand-dark text-white font-bold py-3 px-8 rounded-xl transition duration-300 shadow-lg hover:shadow-brand/40"
                    >
                        <FaArrowLeft className="text-sm" />
                        <span>Start Shopping</span>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                        <motion.div
                            key={item._id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-center gap-4"
                        >
                            <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <Link
                                    to={`/product/${item.slug}`}
                                    className="text-lg font-bold text-slate-800 hover:text-brand transition block mb-1"
                                >
                                    {item.name}
                                </Link>
                                <div className="text-sm text-gray-500 mb-2">
                                    {item.make && (typeof item.make === 'object' ? item.make.name : item.make)}
                                </div>
                                <div className="font-bold text-brand">
                                    ₹{item.price.toLocaleString()}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1">
                                <button
                                    onClick={() => updateQuantity(item._id, item.qty - 1)}
                                    disabled={item.qty <= 1}
                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-brand disabled:opacity-50 transition"
                                >
                                    <FaMinus size={10} />
                                </button>
                                <span className="font-bold text-slate-800 w-6 text-center">{item.qty}</span>
                                <button
                                    onClick={() => updateQuantity(item._id, item.qty + 1)}
                                    disabled={item.qty >= item.countInStock}
                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-brand disabled:opacity-50 transition"
                                >
                                    <FaPlus size={10} />
                                </button>
                            </div>

                            <button
                                onClick={() => removeFromCart(item._id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Remove Item"
                            >
                                <FaTrash />
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-gray-100">
                            Order Summary
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                                <span className="font-bold text-slate-800">₹{getCartTotal().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-bold">Free</span>
                            </div>
                            <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-bold text-slate-900">
                                <span>Total</span>
                                <span>₹{getCartTotal().toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={checkoutHandler}
                            className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-brand/40 transition flex items-center justify-center"
                        >
                            Proceed to Checkout
                        </button>

                        <div className="mt-6 text-center">
                            <Link to="/products" className="text-gray-500 hover:text-brand text-sm font-medium transition">
                                or Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
