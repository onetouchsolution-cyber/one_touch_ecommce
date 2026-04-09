import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaBox, FaShoppingBag, FaUsers, FaSignOutAlt, FaTags, FaIndustry, FaMobileAlt, FaBars } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (!user || !user.isAdmin) {
                navigate('/login');
            }
        }
    }, [user, loading, navigate]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
        </div>
    );

    if (!user || !user.isAdmin) return null;

    const menuItems = [
        { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { path: '/admin/orders', icon: <FaShoppingBag />, label: 'Orders' },
        { path: '/admin/products', icon: <FaBox />, label: 'Products' },
        { path: '/admin/categories', icon: <FaTags />, label: 'Categories' },
        { path: '/admin/makes', icon: <FaIndustry />, label: 'Makes & Brands' },
        { path: '/admin/models', icon: <FaMobileAlt />, label: 'Models' },
        { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20 hidden md:flex relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 z-0"></div>
                <div className="absolute top-[-10%] right-[-30%] w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"></div>

                <div className="p-8 z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-400 to-brand-600"></div>
                        <h1 className="text-xl font-bold tracking-wider text-white">ONE TOUCH</h1>
                    </div>

                    <nav className="space-y-1.5">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${isActive
                                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span className={`text-lg transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                                        {item.icon}
                                    </span>
                                    <span className="font-medium tracking-wide">{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute left-0 w-1 h-8 bg-white rounded-r-full"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6 z-10 border-t border-white/5">
                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="flex items-center space-x-3 text-slate-400 hover:text-red-400 px-4 py-3 w-full rounded-xl hover:bg-white/5 transition-colors"
                    >
                        <FaSignOutAlt />
                        <span>Sign Out</span>
                    </button>

                    <div className="mt-6 flex items-center gap-3 px-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-accent-500 p-0.5">
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">{user.name}</p>
                            <p className="text-xs text-slate-500">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-8 py-4 flex justify-between items-center border-b border-slate-200/50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500 hover:text-slate-700">
                            <FaBars className="text-xl" />
                        </button>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                            {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-8 relative">
                    {/* Background blob for main area */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-100/50 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
