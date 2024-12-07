import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./SideBanner.css";

export default function PopularProducts() {
  const accessToken = localStorage.getItem('accessToken');
  const backendUrl = import.meta.env.VITE_BACK_END_URL;
  const [mostOrderedProducts, setMostOrderedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMostOrderedProducts = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/api/order/mostorder`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        setMostOrderedProducts(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching most ordered products:", error);
        setIsLoading(false);
      }
    };

    fetchMostOrderedProducts();
  }, [backendUrl, accessToken]);

  const getImageUrl = (item) => {
    try {
      const images = JSON.parse(item);
      return images[0]?.url || '/placeholder-image.jpg';
    } catch (error) {
      console.error('Error parsing image:', error);
      return '/placeholder-image.jpg';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg 
            className="w-5 h-5" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Popular Products
        </h2>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex space-x-3">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {mostOrderedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className="group relative flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(product.product.images)}
                    alt={product.product.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors duration-300">
                    {product.product.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500">Orders:</span>
                      <span className="ml-1 text-sm font-medium text-gray-900">
                        {product.totalSold}
                      </span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-500">
                      {product.product.category}
                    </span>
                  </div>
                </div>

                {/* Trend Indicator */}
                <div className={`flex items-center ${
                  product.totalSold > 50 ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d={product.totalSold > 50 
                        ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                      }
                    />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {mostOrderedProducts.length}
              </p>
              <p className="text-sm text-gray-500">Popular Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {mostOrderedProducts.reduce((sum, product) => sum + product.totalSold, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Orders</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
