import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdDeleteForever } from "react-icons/md";
import { toast } from "react-toastify";
import { FiSearch } from "react-icons/fi";
import { BiSortAlt2 } from "react-icons/bi";
import { TbLoader } from "react-icons/tb";

const DeleteProducts = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const backendUrl = import.meta.env.VITE_BACK_END_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/api/product/all`);
        
       
        const localProducts = localStorage.getItem('localProducts');
        let allProducts = [...response.data];
        
        if (localProducts) {
          const parsedLocalProducts = JSON.parse(localProducts);
          parsedLocalProducts.forEach(localProduct => {
            if (!allProducts.find(p => p.id === localProduct.id)) {
              allProducts.push(localProduct);
            }
          });
        }

        setProducts(allProducts);
        setError(null);
      } catch (error) {
        console.error("Error fetching products:", error);
       
        try {
          const localProducts = localStorage.getItem('localProducts');
          if (localProducts) {
            setProducts(JSON.parse(localProducts));
          }
        } catch (localError) {
          setError("Failed to fetch products. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [backendUrl]);

  const handleDelete = async (productId) => {
    try {
      
      if (!window.confirm("Are you sure you want to delete this product?")) {
        return;
      }

      
      const accessToken = localStorage.getItem("accessToken");
      try {
        await axios.delete(`${backendUrl}/api/api/product/delete/${productId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } catch (backendError) {
        console.error("Backend delete failed:", backendError);
      }

      
      const localProducts = localStorage.getItem('localProducts');
      if (localProducts) {
        const parsedProducts = JSON.parse(localProducts);
        const updatedProducts = parsedProducts.filter(product => product.id !== productId);
        localStorage.setItem('localProducts', JSON.stringify(updatedProducts));
      }

    
      setProducts(products.filter((product) => product.id !== productId));
      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product. Please try again.");
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aVal = a[sortConfig.key]?.toString().toLowerCase() || '';
    const bVal = b[sortConfig.key]?.toString().toLowerCase() || '';
    
    if (sortConfig.direction === 'asc') {
      return aVal.localeCompare(bVal);
    }
    return bVal.localeCompare(aVal);
  });

  const filteredProducts = sortedProducts.filter(product => 
    product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id?.toString().includes(searchTerm)
  );

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Management</h2>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-600">
            Total Products: {filteredProducts.length}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <TbLoader className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['title', 'category', 'id', 'gender'].map((key) => (
                  <th 
                    key={key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(key)}
                  >
                    <div className="flex items-center gap-2">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                      <BiSortAlt2 className={`transition-transform ${
                        sortConfig.key === key && sortConfig.direction === 'desc' ? 'transform rotate-180' : ''
                      }`} />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center gap-1 ml-auto"
                    >
                      <MdDeleteForever className="text-xl" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeleteProducts;
