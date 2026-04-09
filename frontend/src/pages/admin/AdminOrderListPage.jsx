import React from 'react';

const AdminOrderListPage = () => {
    // Mock Data
    const orders = [
        { _id: '1', user: { name: 'John Doe' }, createdAt: '2023-10-01', totalPrice: 12500, isPaid: true, isDelivered: false },
        { _id: '2', user: { name: 'Jane Smith' }, createdAt: '2023-10-02', totalPrice: 8500, isPaid: true, isDelivered: true },
        { _id: '3', user: { name: 'Alice Johnson' }, createdAt: '2023-10-03', totalPrice: 2500, isPaid: false, isDelivered: false },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Orders</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order._id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{order.user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.createdAt}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{order.totalPrice}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {order.isPaid ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Paid
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            Not Paid
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {order.isDelivered ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Delivered
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900">
                                        Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrderListPage;
