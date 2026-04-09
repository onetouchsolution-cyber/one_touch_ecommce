import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-secondary text-gray-300 pt-10 pb-6">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* About */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">ONE TOUCH SOLUTION.</h3>
                    <p className="text-sm mb-4">
                        Your premium destination for mobile keywords, laptop spare parts, and high-quality accessories.
                    </p>
                    <div className="text-sm text-gray-400 space-y-2">
                        <p>57, Madurai Road, Tirunelveli Junction,</p>
                        <p>Tirunelveli, Tamil Nadu – 627001</p>
                        <p className="text-brand-light font-semibold">Phone: 8667566419</p>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="/" className="hover:text-accent transition">Home</a></li>
                        <li><a href="/products" className="hover:text-accent transition">Shop</a></li>
                        <li><a href="/about" className="hover:text-accent transition">About Us</a></li>
                        <li><a href="/contact" className="hover:text-accent transition">Contact Us</a></li>
                    </ul>
                </div>

                {/* Customer Service */}
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Customer Care</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="/faq" className="hover:text-accent transition">FAQ</a></li>
                        <li><a href="/shipping" className="hover:text-accent transition">Shipping Policy</a></li>
                        <li><a href="/returns" className="hover:text-accent transition">Returns & Refunds</a></li>
                        <li><a href="/privacy" className="hover:text-accent transition">Privacy Policy</a></li>
                    </ul>
                </div>

                {/* Social Media */}
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
                    <div className="flex space-x-4">
                        <a href="#" className="hover:text-accent transition"><FaFacebook size={24} /></a>
                        <a href="#" className="hover:text-accent transition"><FaTwitter size={24} /></a>
                        <a href="#" className="hover:text-accent transition"><FaInstagram size={24} /></a>
                        <a href="#" className="hover:text-accent transition"><FaLinkedin size={24} /></a>
                    </div>
                </div>

            </div>

            <div className="border-t border-gray-600 mt-8 pt-4 text-center text-sm">
                &copy; {new Date().getFullYear()} One Touch Solution. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
