import React from 'react';
import BookingsTab from '../../components/admin/BookingsTab';

/**
 * Admin Bookings Page
 * Wrapped by AdminLayout
 */
const BookingsPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Bookings Management</h1>
            <BookingsTab />
        </div>
    );
};

export default BookingsPage;
