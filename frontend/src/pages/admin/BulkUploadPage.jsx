import React, { useState } from 'react';
import API from '../../services/api';
import { FaCloudUploadAlt, FaFileCsv, FaDownload } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const BulkUploadPage = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [details, setDetails] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setMessage('');
        setDetails(null);

        try {
            const { data } = await API.post('/products/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(`Upload Successful! Created: ${data.createdCount}`);
            if (data.errors && data.errors.length > 0) {
                setDetails(data.errors);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Upload Failed');
        } finally {
            setUploading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await API.get('/products/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'products_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Export Failed');
        }
    };

    const handleDownloadSample = async () => {
        try {
            const response = await API.get('/products/sample-csv', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'products_sample.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to download sample CSV');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Bulk Operations</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Import Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3 text-brand-600">
                            <FaCloudUploadAlt size={32} />
                            <h2 className="text-xl font-bold">Import Products</h2>
                        </div>
                        <button
                            onClick={handleDownloadSample}
                            className="text-sm text-brand-600 hover:text-brand-800 font-semibold underline"
                        >
                            Download Sample Template
                        </button>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                                id="csvInput"
                            />
                            <label htmlFor="csvInput" className="cursor-pointer block">
                                <FaFileCsv className="mx-auto text-gray-400 mb-2" size={40} />
                                <span className="text-gray-600 font-medium">
                                    {file ? file.name : 'Click to select CSV file'}
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={!file || uploading}
                            className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Start Import'}
                        </button>
                    </form>

                    {message && (
                        <div className={`mt-6 p-4 rounded-lg ${message.includes('Success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            <p className="font-bold">{message}</p>
                            {details && (
                                <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                                    {details.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Export Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6 text-blue-600">
                        <FaDownload size={32} />
                        <h2 className="text-xl font-bold">Export Products</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Download a CSV file containing all products. You can use this file as a template for bulk updates.
                    </p>
                    <button
                        onClick={handleExport}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                        <FaDownload /> Download CSV
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <Link to="/admin/products" className="text-gray-500 hover:text-brand-600">
                    &larr; Back to Product List
                </Link>
            </div>
        </div>
    );
};

export default BulkUploadPage;
