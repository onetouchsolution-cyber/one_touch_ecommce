import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaIdCard, FaSignOutAlt, FaBoxOpen } from 'react-icons/fa';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/')
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
            >
                <div className="bg-brand-600 h-32 w-full relative">
                    <div className="absolute -bottom-16 left-8">
                        <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center text-4xl font-bold text-brand-600">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>

                <div className="pt-20 pb-8 px-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                            <p className="text-gray-500 font-medium">Member</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={() => navigate('/account/orders')}
                            className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl shadow-md hover:bg-brand-700 transition-all font-semibold"
                        >
                            <FaBoxOpen /> My Orders
                        </button>
                    </div>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Profile Information</h2>

                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                <div className="p-3 bg-white rounded-lg text-brand-600 shadow-sm">
                                    <FaUser size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Full Name</p>
                                    <p className="font-medium text-slate-900">{user.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                <div className="p-3 bg-white rounded-lg text-brand-600 shadow-sm">
                                    <FaEnvelope size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email Address</p>
                                    <p className="font-medium text-slate-900">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                <div className="p-3 bg-white rounded-lg text-brand-600 shadow-sm">
                                    <FaIdCard size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">User ID</p>
                                    <p className="font-medium text-slate-900 font-mono text-sm">{user._id}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Account Status</h2>
                            <div className="bg-green-50 border border-green-100 rounded-xl p-6">
                                <p className="text-green-800 font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Active Account
                                </p>
                                <p className="text-green-600 text-sm mt-1">Your account is fully active and verified.</p>
                            </div>

                            {user.isAdmin && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                                    <p className="text-blue-800 font-medium flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        Admin Access
                                    </p>
                                    <p className="text-blue-600 text-sm mt-1">You have administrative privileges.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
