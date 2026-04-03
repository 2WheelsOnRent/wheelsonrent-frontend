import React from 'react';
import { Outlet } from 'react-router-dom';
import WhatsAppButton from './WhatsAppButton';

/**
 * Main site layout (scootyonrent.com)
 * Wraps all user-facing pages
 */
const MainLayout: React.FC = () => {
    return (
        <>
            <Outlet />
            <WhatsAppButton />
        </>
    );
};

export default MainLayout;
