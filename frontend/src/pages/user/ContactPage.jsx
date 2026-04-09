import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';
import API from '../../services/api';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [statusMessage, setStatusMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            // Import API if not already imported, assuming it will be at top of file
            // But since I'm replacing the whole component body basically, I need to make sure API is imported.
            // I'll assume API import is added in a separate step or I should have included it. 
            // Wait, I can't easily add import with this tool if I don't target the top.
            // I will target the imports separately or use a multi-replace.

            // For now, let's write the logic assuming API is imported.
            const { data } = await API.post('/contact', formData);
            setStatus('success');
            setStatusMessage('Message sent successfully! We will get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setStatus('error');
            setStatusMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Contact Us</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    We are here to help you with your spare parts needs. Reach out to us for any queries or support.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Contact Information */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                >
                    <h2 className="text-2xl font-bold text-slate-800 mb-8">Get in Touch</h2>

                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="bg-brand-light/10 p-3 rounded-full text-brand">
                                <FaMapMarkerAlt size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Our Location</h3>
                                <p className="text-gray-600 mt-1">
                                    57, Madurai Road,<br />
                                    Tirunelveli Junction,<br />
                                    Tirunelveli, Tamil Nadu – 627001
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-brand-light/10 p-3 rounded-full text-brand">
                                <FaPhoneAlt size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Phone Number</h3>
                                <p className="text-gray-600 mt-1">8667566419</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-brand-light/10 p-3 rounded-full text-brand">
                                <FaEnvelope size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Email</h3>
                                <p className="text-gray-600 mt-1">support@onetouchsolution.com</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-brand-light/10 p-3 rounded-full text-brand">
                                <FaClock size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Business Hours</h3>
                                <p className="text-gray-600 mt-1">Mon - Sat: 9:00 AM - 8:00 PM</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                >
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Send Message</h2>
                    {status === 'success' && (
                        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                            {statusMessage}
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                            {statusMessage}
                        </div>
                    )}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                                placeholder="Inquiry about..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                rows="4"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                                placeholder="How can we help you?"
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className={`w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {status === 'loading' ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ContactPage;
