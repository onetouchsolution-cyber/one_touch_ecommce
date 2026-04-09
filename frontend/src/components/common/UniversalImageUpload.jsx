import React, { useState, useRef, useEffect } from 'react';
import { FaCloudUploadAlt, FaLink, FaImage, FaTimes } from 'react-icons/fa';
import API from '../../services/api';

const UniversalImageUpload = ({ value, onChange, label = 'Image' }) => {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [inputType, setInputType] = useState('file'); // 'file' or 'url'
    const fileInputRef = useRef(null);

    // Handle paste events
    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    uploadFile(file);
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, []);

    const uploadFile = async (file) => {
        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('image', file);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            const { data } = await API.post('/upload', formData, config);
            onChange(data.image); // The backend returns the relative path which might need prefixing depending on setup, but typically /uploads/file.png
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadFile(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            uploadFile(file);
        } else {
            setError('Please drop a valid image file');
        }
    };

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        if (urlInput) {
            onChange(urlInput);
            setUrlInput('');
            setInputType('file');
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            {value ? (
                <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                        src={value}
                        alt="Uploaded preview"
                        className="w-full h-64 object-contain"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                        }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                            title="Remove Image"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            type="button"
                            className={`px-4 py-2 text-sm font-medium ${inputType === 'file' ? 'text-brand border-b-2 border-brand' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setInputType('file')}
                        >
                            Upload File
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-2 text-sm font-medium ${inputType === 'url' ? 'text-brand border-b-2 border-brand' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setInputType('url')}
                        >
                            Image URL
                        </button>
                    </div>

                    {inputType === 'file' ? (
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${dragging ? 'border-brand bg-brand/5' : 'border-gray-300 hover:border-brand hover:bg-gray-50'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                className="hidden"
                            />

                            {uploading ? (
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mb-2"></div>
                                    <p className="text-gray-500">Uploading...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-gray-500">
                                    <FaCloudUploadAlt className="text-4xl mb-2 text-gray-400" />
                                    <p className="font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                                    <p className="text-xs mt-2 text-gray-400">You can also paste (Ctrl+V) an image anywhere</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="https://example.com/image.jpg"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleUrlSubmit(e);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleUrlSubmit}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                                Set URL
                            </button>
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default UniversalImageUpload;
