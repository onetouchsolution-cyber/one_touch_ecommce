import React from 'react';
import { FaBox, FaShoppingBag, FaUsers, FaMoneyBillWave, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden group"
    >
        <div className={`absolute right-4 top-4 p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
        </div>

        <div className="z-10">
            <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{value}</h3>

            {trend && (
                <div className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {trend === 'up' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                    {trendValue} <span className="text-slate-400 font-normal ml-1">vs last month</span>
                </div>
            )}
        </div>

        {/* Decorative Gradient Background */}
        <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${color} opacity-5 rounded-full blur-xl`}></div>
    </motion.div>
);

const AdminDashboardPage = () => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value="₹1,24,000"
                    icon={<FaMoneyBillWave className="text-2xl text-green-600" />}
                    color="bg-green-500"
                    trend="up"
                    trendValue="12%"
                />
                <StatCard
                    title="Total Orders"
                    value="45"
                    icon={<FaShoppingBag className="text-2xl text-blue-600" />}
                    color="bg-blue-500"
                    trend="up"
                    trendValue="5%"
                />
                <StatCard
                    title="Total Products"
                    value="120"
                    icon={<FaBox className="text-2xl text-orange-600" />}
                    color="bg-orange-500"
                    trend="up"
                    trendValue="2 New"
                />
                <StatCard
                    title="Total Users"
                    value="89"
                    icon={<FaUsers className="text-2xl text-purple-600" />}
                    color="bg-purple-500"
                    trend="down"
                    trendValue="3%"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders Table with Glassmorphism Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-800">Recent Orders</h3>
                        <button className="text-sm font-semibold text-brand-600 hover:text-brand-700">View All</button>
                    </div>
                    <div className="p-0">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex justify-between items-center px-8 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                                        #{240 + i}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-700">Order #{1000 + i}</p>
                                        <p className="text-xs text-slate-400">2 mins ago</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-800">₹{2500 * i}</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                        Delivered
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* New Users */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-800">New Users</h3>
                    </div>
                    <div className="p-0">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center px-8 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-accent-500 p-0.5">
                                        <img className="h-full w-full rounded-full object-cover border-2 border-white" src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} alt="" />
                                    </div>
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-semibold text-slate-800">User {i}</p>
                                    <p className="text-xs text-slate-500">user{i}@example.com</p>
                                </div>
                                <button className="text-xs font-semibold text-slate-400 hover:text-brand-600 border border-slate-200 rounded-lg px-3 py-1 hover:border-brand-200 transition-colors">
                                    View
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
