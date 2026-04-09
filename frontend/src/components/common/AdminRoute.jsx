import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a proper spinner
    }

    if (user && user.isAdmin) {
        return <Outlet />;
    } else {
        return <Navigate to="/login" replace />;
    }
};

export default AdminRoute;
