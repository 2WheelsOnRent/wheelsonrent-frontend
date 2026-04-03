import React from 'react';
import VehiclesTab from '../../components/admin/VehiclesTab';

/**
 * Admin Vehicles Page
 * Wrapped by AdminLayout
 */
const VehiclesPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Vehicles Management</h1>
            <VehiclesTab />
        </div>
    );
};

export default VehiclesPage;
