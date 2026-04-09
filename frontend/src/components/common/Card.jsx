import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = false, ...props }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -4 } : {}}
            className={`bg-white rounded-2xl shadow-card ${hover ? 'hover:shadow-card-hover transition-shadow duration-300' : ''} ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
