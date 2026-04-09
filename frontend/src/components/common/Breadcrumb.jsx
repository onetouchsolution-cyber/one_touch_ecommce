import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaChevronRight } from 'react-icons/fa';

const Breadcrumb = ({ items }) => {
    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:text-brand transition flex items-center">
                <FaHome className="mr-1" />
                Home
            </Link>

            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <FaChevronRight className="text-gray-400 text-xs" />
                    {item.link ? (
                        <Link
                            to={item.link}
                            className="hover:text-brand transition"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-800 font-medium">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumb;
