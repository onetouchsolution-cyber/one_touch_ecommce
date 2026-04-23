import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import GlobalSearch from '../common/GlobalSearch';
import Button from '../common/Button';

const Navbar = () => {
    const [keyword, setKeyword] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { getCartCount } = useCart();
    const { user, logout } = useAuth();

    const searchHandler = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/search?q=${keyword}`); // Updated to use new search page
        } else {
            navigate('/products');
        }
        setIsMenuOpen(false);
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
                            OT
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-slate-900 tracking-tight leading-none">ONE TOUCH</span>
                            <span className="text-xs text-slate-500 font-medium tracking-widest text-brand-600">SOLUTION</span>
                        </div>
                    </Link>

                    {/* Desktop Search Bar */}
                    <div className="hidden md:block w-1/3">
                        <GlobalSearch />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        <div className="flex items-center space-x-1 mr-4">
                            <Link to="/products" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 rounded-full hover:bg-slate-50 transition-colors">Shop</Link>
                            <Link to="/products/mobile" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 rounded-full hover:bg-slate-50 transition-colors">Mobile</Link>
                            <Link to="/products/laptop-computer" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 rounded-full hover:bg-slate-50 transition-colors">Laptop</Link>
                            <Link to="/products/cctv" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 rounded-full hover:bg-slate-50 transition-colors">CCTV</Link>
                            <Link to="/categories" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 rounded-full hover:bg-slate-50 transition-colors">Categories</Link>
                        </div>

                        <Link to="/cart" className="relative p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-full transition-all mr-2">
                            <FaShoppingCart size={20} />
                            {getCartCount() > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white">
                                    {getCartCount()}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="flex items-center pl-4 border-l border-slate-200">
                                {user.isAdmin && (
                                    <Link to="/admin/dashboard" className="mr-4 text-sm font-bold text-brand-600 hover:text-brand-700">
                                        Dashboard
                                    </Link>
                                )}
                                <Link to="/profile" className="flex items-center gap-2 mr-4 group">
                                    <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm border border-brand-100 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 hidden lg:inline-block">{user.name.split(' ')[0]}</span>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={logout}
                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                                    title="Logout"
                                >
                                    <FaSignOutAlt />
                                </Button>
                            </div>
                        ) : (
                            <Link to="/login">
                                <Button variant="primary" size="sm" className="ml-2 shadow-brand-500/20">
                                    Login
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-top-2">
                    <div className="p-4 flex flex-col space-y-4">
                        <form onSubmit={searchHandler} className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        </form>

                        <div className="grid grid-cols-2 gap-2">
                            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="p-3 bg-slate-50 rounded-lg text-center font-medium text-slate-700 active:bg-slate-100">Shop All</Link>
                            <Link to="/products/mobile" onClick={() => setIsMenuOpen(false)} className="p-3 bg-slate-50 rounded-lg text-center font-medium text-slate-700 active:bg-slate-100">Mobile</Link>
                            <Link to="/products/laptop-computer" onClick={() => setIsMenuOpen(false)} className="p-3 bg-slate-50 rounded-lg text-center font-medium text-slate-700 active:bg-slate-100">Laptop</Link>
                            <Link to="/products/cctv" onClick={() => setIsMenuOpen(false)} className="p-3 bg-slate-50 rounded-lg text-center font-medium text-slate-700 active:bg-slate-100">CCTV</Link>
                            <Link to="/categories" onClick={() => setIsMenuOpen(false)} className="p-3 bg-slate-50 rounded-lg text-center font-medium text-slate-700 active:bg-slate-100">Categories</Link>
                            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="p-3 bg-slate-50 rounded-lg text-center font-medium text-slate-700 active:bg-slate-100 flex items-center justify-center gap-2">
                                <FaShoppingCart /> Cart ({getCartCount()})
                            </Link>
                            {!user && (
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="p-3 bg-brand-600 text-white rounded-lg text-center font-medium active:bg-brand-700">Login</Link>
                            )}
                            {user && user.isAdmin && (
                                <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="p-3 bg-brand-50 text-brand-700 rounded-lg text-center font-bold border border-brand-100 active:bg-brand-100">Dashboard</Link>
                            )}
                        </div>

                        {user && (
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{user.name}</p>
                                        <p className="text-xs text-slate-500">View Profile</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => { logout(); setIsMenuOpen(false); }} className="text-red-500">
                                    Logout
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
