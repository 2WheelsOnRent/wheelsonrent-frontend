import React from 'react';
import UsersTab from '../../components/admin/UsersTab';

/**
 * Admin Users Page
 * Wrapped by AdminLayout
 */
const UsersPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Users Management</h1>
            <UsersTab />
        </div>
    );
};

export default UsersPage;
