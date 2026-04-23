import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaStar, FaCheck, FaTimes } from 'react-icons/fa';
import API from '../../services/api';
import Breadcrumb from '../../components/common/Breadcrumb';
import SafeImage from '../../components/common/SafeImage';
import { useCart } from '../../context/CartContext';

const ProductDetailsPage = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addToCart } = useCart();
    const [addedToCart, setAddedToCart] = useState(false);

    const addToCartHandler = () => {
        addToCart(product, 1);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    useEffect(() => {
        fetchProduct();
    }, [slug]);

    const fetchProduct = async () => {
        try {
            const { data } = await API.get(`/products/slug/${slug}`);
            setProduct(data);
            setSelectedImage(0);

            // Fetch related products (same category or make)
            if (data.category) {
                const categoryId = typeof data.category === 'object' ? data.category._id : data.category;
                const { data: related } = await API.get(`/products?category=${categoryId}`);
                setRelatedProducts(related.filter(p => p._id !== data._id).slice(0, 4));
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching product details:', error);
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    // Build breadcrumb
    const breadcrumbItems = [];
    if (product.category) {
        const cat = typeof product.category === 'object' ? product.category : null;
        if (cat) {
            breadcrumbItems.push({ label: 'Categories', link: '/categories' });
            breadcrumbItems.push({ label: cat.name, link: `/category/${cat.slug}` });
        }
    }
    if (product.make) {
        const mk = typeof product.make === 'object' ? product.make : null;
        if (mk) {
            breadcrumbItems.push({ label: mk.name });
        }
    }
    breadcrumbItems.push({ label: product.name });

    // Prepare images array
    const allImages = [product.image, ...(product.images || [])].filter(Boolean);

    return (
        <div className="py-8">
            <Breadcrumb items={breadcrumbItems} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                {/* Image Gallery */}
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100 mb-4"
                    >
                        <div className="aspect-square flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
                            <SafeImage
                                src={allImages[selectedImage]}
                                alt={product.name}
                                className="max-h-full max-w-full object-contain"
                            />
                        </div>
                    </motion.div>

                    {/* Thumbnail Gallery */}
                    {allImages.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {allImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${selectedImage === index
                                        ? 'border-brand'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <SafeImage
                                        src={img}
                                        alt={`${product.name} ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div>
                        {product.make && (
                            <span className="text-brand font-bold uppercase tracking-wider text-sm bg-brand-light/10 px-3 py-1 rounded-full">
                                {typeof product.make === 'object' ? product.make.name : product.make}
                            </span>
                        )}
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 mb-2">
                            {product.name}
                        </h1>
                        {product.rating !== undefined && (
                            <div className="flex items-center space-x-2 text-yellow-500 text-sm">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-500">
                                    ({product.numReviews || 0} reviews)
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="text-4xl font-bold text-slate-800">
                        ₹{product.price.toLocaleString()}
                    </div>

                    <p className="text-gray-600 leading-relaxed text-lg">
                        {product.description}
                    </p>

                    {/* Compatibility */}
                    {product.model && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-bold text-slate-800 mb-2">Compatible With:</h3>
                            <div className="flex items-center text-blue-700">
                                <FaCheck className="mr-2" />
                                <span>
                                    {typeof product.make === 'object' ? product.make.name : ''}{' '}
                                    {typeof product.model === 'object' ? product.model.name : product.model}
                                </span>
                            </div>
                        </div>
                    )}

                    {product.compatibleModels && product.compatibleModels.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="font-bold text-slate-800 mb-2">Also Compatible With:</h3>
                            <div className="space-y-1">
                                {product.compatibleModels.map((model, index) => (
                                    <div key={index} className="flex items-center text-green-700 text-sm">
                                        <FaCheck className="mr-2 flex-shrink-0" />
                                        <span>
                                            {typeof model === 'object' && model.make
                                                ? `${typeof model.make === 'object' ? model.make.name : model.make} ${model.name}`
                                                : typeof model === 'object'
                                                    ? model.name
                                                    : model}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t border-b border-gray-200 py-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">Availability:</span>
                            <span
                                className={`font-bold ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'
                                    }`}
                            >
                                {product.countInStock > 0 ? `In Stock (${product.countInStock})` : 'Out of Stock'}
                            </span>
                        </div>
                        {product.category && (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 font-medium">Category:</span>
                                <span className="text-slate-800">
                                    {typeof product.category === 'object' ? product.category.name : product.category}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex space-x-4 pt-4">
                        <button
                            onClick={addToCartHandler}
                            disabled={product.countInStock === 0}
                            className={`flex-1 font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${addedToCart
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-brand hover:bg-brand-dark text-white hover:shadow-brand/40'
                                }`}
                        >
                            {addedToCart ? (
                                <>
                                    <FaCheck size={20} />
                                    <span>Added to Cart!</span>
                                </>
                            ) : (
                                <>
                                    <FaShoppingCart size={20} />
                                    <span>Add to Cart</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Specifications</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-3 border-b border-gray-200">
                                <span className="font-medium text-gray-700">{key}:</span>
                                <span className="text-slate-800">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Related Products</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map((relatedProduct) => (
                            <Link
                                key={relatedProduct._id}
                                to={`/product/${relatedProduct.slug}`}
                                className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-brand group"
                            >
                                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                                    <SafeImage
                                        src={relatedProduct.image}
                                        alt={relatedProduct.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-brand transition">
                                        {relatedProduct.name}
                                    </h3>
                                    <p className="text-lg font-bold text-slate-800 mt-2">
                                        ₹{relatedProduct.price.toLocaleString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailsPage;
