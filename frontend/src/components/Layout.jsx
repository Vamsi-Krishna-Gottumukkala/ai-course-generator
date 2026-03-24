import React from 'react';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children, activePage }) => {
    return (
        <div className="app-layout">
            <Sidebar activePage={activePage} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
