import React, { useState, useCallback, useEffect } from "react";
import { MdEditSquare } from "react-icons/md";
import { IoCloudDone } from "react-icons/io5";
import CustomDropdown from "./CustomDropdown";
import Cropper from "react-easy-crop";
import { AiFillCloseCircle } from "react-icons/ai";
import axios from "axios";
import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Checkbox from "@mui/material/Checkbox";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiSearch } from "react-icons/fi";
import { BiSortAlt2 } from "react-icons/bi";

const UpdateProduct = () => {
  const [editedProducts, setEditedProducts] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageIndex, setImageIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
    stock: "",
    metal: "",
    weight: "",
    length: [],
    width: "",
    ring_size: "",
    color: [],
    stone: "",
    gender: "",
    style: "",
    images: [null, null, null, null],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });


  useEffect(() => {
    try {
      const localProducts = localStorage.getItem('localProducts');
      if (localProducts) {
        const parsedProducts = JSON.parse(localProducts);
        setEditedProducts(parsedProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    }
  }, []);

  const resetForm = () => {
    setEditFormData({
      title: "",
      category: "",
      price: "",
      description: "",
      stock: "",
      metal: "",
      weight: "",
      length: [],
      width: "",
      ring_size: "",
      color: [],
      stone: "",
      gender: "",
      style: "",
      images: [null, null, null, null],
    });
    setEditIndex(null);
  };

  const handleEdit = (index, field, value) => {
    try {
      const updatedProducts = [...editedProducts];
      updatedProducts[index] = { ...updatedProducts[index], [field]: value };
      setEditedProducts(updatedProducts);
      setEditFormData({ ...editFormData, [field]: value });
      
     
      localStorage.setItem('localProducts', JSON.stringify(updatedProducts));
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        
        setImageSrc(base64);
        setImageIndex(index);
        setCropping(true);
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Failed to process image');
      }
    }
  };

  const handleImageRemove = (index) => {
    try {
      const newImages = [...editFormData.images];
      newImages[index] = null;
      setEditFormData({ ...editFormData, images: newImages });
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    try {
      const updatedFormData = { ...editFormData };
      
      if (["gold", "silver", "rose gold", "white gold"].includes(name)) {
        if (checked) {
          updatedFormData.color.push(name);
        } else {
          updatedFormData.color = updatedFormData.color.filter(c => c !== name);
        }
      } else {
        if (checked) {
          updatedFormData.length.push(name);
        } else {
          updatedFormData.length = updatedFormData.length.filter(l => l !== name);
        }
      }

      setEditFormData(updatedFormData);
    } catch (error) {
      console.error('Error updating checkbox:', error);
      toast.error('Failed to update selection');
    }
  };

  const handleSave = async () => {
    try {
      const updatedProducts = editedProducts.map((product, idx) => 
        idx === editIndex ? { ...product, ...editFormData } : product
      );
      
      setEditedProducts(updatedProducts);
      localStorage.setItem('localProducts', JSON.stringify(updatedProducts));
      
      toast.success('Product updated successfully');
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    const selectedProduct = editedProducts[index];
    setEditFormData({
      ...selectedProduct,
      images: Array.isArray(selectedProduct.images) 
        ? [...selectedProduct.images] 
        : [null, null, null, null],
      color: Array.isArray(selectedProduct.color) ? [...selectedProduct.color] : [],
      length: Array.isArray(selectedProduct.length) ? [...selectedProduct.length] : []
    });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
    return new Promise((resolve) => {
      const image = new Image();
      image.src = imageSrc;
      
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        resolve(canvas.toDataURL('image/jpeg'));
      };
    });
  };

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      const newImages = [...editFormData.images];
      newImages[imageIndex] = croppedImage;
      setEditFormData({ ...editFormData, images: newImages });
      setCropping(false);
    } catch (e) {
      console.error('Error cropping image:', e);
      toast.error('Failed to crop image');
    }
  };

 
  useEffect(() => {
    return () => {
      
      editFormData.images.forEach(image => {
        if (image && image.startsWith('blob:')) {
          URL.revokeObjectURL(image);
        }
      });
    };
  }, [editFormData.images]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...editedProducts].sort((a, b) => {
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
    <div className="bg-white rounded-xl shadow-lg">
      {/* Products List Section */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Update Products</h2>
            <p className="text-gray-600 mt-1">Select a product to edit its details</p>
          </div>
          <div className="text-sm text-gray-600">
            Total Products: {filteredProducts.length}
          </div>
        </div>

        <div className="mb-6">
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
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'title', label: 'Product Name' },
                  { key: 'category', label: 'Category' },
                  { key: 'id', label: 'Product ID' },
                  { key: 'price', label: 'Price' },
                  { key: 'stock', label: 'Stock' }
                ].map(({ key, label }) => (
                  <th 
                    key={key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(key)}
                  >
                    <div className="flex items-center gap-2">
                      {label}
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
              {filteredProducts.map((product, index) => (
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
                    {product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(index)}
                      className="text-blue-600 hover:text-blue-900 transition-colors duration-200 flex items-center gap-1 ml-auto"
                    >
                      <MdEditSquare className="text-xl" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Form Section */}
      {editIndex !== null && (
        <div className="p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Edit Product Details</h3>
            
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => handleEdit(editIndex, "title", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Product ID
                  </label>
                  <input
                    type="text"
                    value={editFormData.id}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="text"
                    value={editFormData.price}
                    onChange={(e) => handleEdit(editIndex, "price", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Product Details Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Product Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CustomDropdown
                  label="Category"
                  options={[
                    { label: "Rings", value: "rings" },
                    { label: "Chains", value: "chains" },
                    { label: "Pendants", value: "pendants" },
                    { label: "Earrings", value: "earrings" },
                    { label: "Bracelets", value: "bracelets" },
                    { label: "Anklets", value: "anklets" },
                    { label: "Bundles", value: "bundles" },
                    { label: "Watches", value: "watches" }
                  ]}
                  name="category"
                  value={editFormData.category}
                  onChange={(e) => handleEdit(editIndex, "category", e.target.value)}
                />

                <CustomDropdown
                  label="Metal"
                  options={[
                    { label: "Gold", value: "gold" },
                    { label: "Silver", value: "silver" },
                    { label: "Platinum", value: "platinum" },
                    { label: "Titanium", value: "titanium" },
                    { label: "Rose Gold", value: "rose gold" }
                  ]}
                  name="metal"
                  value={editFormData.metal}
                  onChange={(e) => handleEdit(editIndex, "metal", e.target.value)}
                />

                <CustomDropdown
                  label="Stone"
                  options={[
                    { label: "Natural Diamonds", value: "natural-diamonds" },
                    { label: "American Diamonds", value: "american-diamonds" }
                  ]}
                  name="stone"
                  value={editFormData.stone}
                  onChange={(e) => handleEdit(editIndex, "stone", e.target.value)}
                />

                <CustomDropdown
                  label="Style"
                  options={[
                    { label: "Cuban", value: "Cuban" },
                    { label: "Tennis", value: "Tennis" },
                    { label: "Figaro", value: "Figaro" },
                    { label: "Rope", value: "Rope" },
                    { label: "Palm", value: "Palm" },
                    { label: "Our Exclusive", value: "Our Exclusive" }
                  ]}
                  name="style"
                  value={editFormData.style}
                  onChange={(e) => handleEdit(editIndex, "style", e.target.value)}
                />

                <CustomDropdown
                  label="Gender"
                  options={[
                    { label: "Men", value: "men" },
                    { label: "Women", value: "women" },
                    { label: "Unisex", value: "unisex" }
                  ]}
                  name="gender"
                  value={editFormData.gender}
                  onChange={(e) => handleEdit(editIndex, "gender", e.target.value)}
                />

                <CustomDropdown
                  label="Ring Size"
                  options={[
                    { label: "5", value: "5" },
                    { label: "6", value: "6" },
                    { label: "7", value: "7" },
                    { label: "8", value: "8" },
                    { label: "9", value: "9" }
                  ]}
                  name="ring_size"
                  value={editFormData.ring_size}
                  onChange={(e) => handleEdit(editIndex, "ring_size", e.target.value)}
                />

                <CustomDropdown
                  label="Width"
                  options={[
                    { label: "100cm", value: "100cm" },
                    { label: "200cm", value: "200cm" },
                    { label: "300cm", value: "300cm" },
                    { label: "400cm", value: "400cm" },
                    { label: "500cm", value: "500cm" }
                  ]}
                  name="width"
                  value={editFormData.width}
                  onChange={(e) => handleEdit(editIndex, "width", e.target.value)}
                />

                <CustomDropdown
                  label="Weight"
                  options={[
                    { label: "< 100g", value: "< 100g" },
                    { label: "100g", value: "100g" },
                    { label: "200g", value: "200g" },
                    { label: "300g", value: "300g" },
                    { label: "400g", value: "400g" },
                    { label: "500g", value: "500g" }
                  ]}
                  name="weight"
                  value={editFormData.weight}
                  onChange={(e) => handleEdit(editIndex, "weight", e.target.value)}
                />

                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => handleEdit(editIndex, "description", e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product description"
                  />
                </div>
              </div>
            </div>

            {/* Product Variations */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Product Variations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormControl component="fieldset" variant="standard">
                    <FormLabel component="legend" className="text-gray-700">Available Colors</FormLabel>
                    <FormGroup className="mt-2 space-y-2">
                      {["gold", "silver", "rose gold", "white gold"].map((colorOption) => (
                        <FormControlLabel
                          key={colorOption}
                          control={
                            <Checkbox
                              checked={editFormData.color.includes(colorOption)}
                              onChange={handleCheckboxChange}
                              name={colorOption}
                            />
                          }
                          label={colorOption}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                </div>

                <div>
                  <FormControl component="fieldset" variant="standard">
                    <FormLabel component="legend" className="text-gray-700">Available Lengths</FormLabel>
                    <FormGroup className="mt-2 space-y-2">
                      {["100cm", "200cm", "300cm", "400cm"].map((lengthOption) => (
                        <FormControlLabel
                          key={lengthOption}
                          control={
                            <Checkbox
                              checked={editFormData.length.includes(lengthOption)}
                              onChange={handleCheckboxChange}
                              name={lengthOption}
                            />
                          }
                          label={lengthOption}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Product Images</h4>
              <p className="text-sm text-gray-600 mb-6">Upload up to 4 high-quality images. First image will be the main display image.</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Image */}
                <div className="lg:col-span-8">
                  <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors">
                    <div className="aspect-w-16 aspect-h-12">
                      {editFormData.images[0] ? (
                        <div className="relative group">
                          <img
                            src={editFormData.images[0]}
                            alt="Main product"
                            className="w-full h-full object-contain rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleImageRemove(0)}
                                className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setImageSrc(editFormData.images[0]);
                                  setImageIndex(0);
                                  setCropping(true);
                                }}
                                className="p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">Drop main product image here or click to upload</p>
                          <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleImageChange(e, 0)}
                            accept="image/*"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Images */}
                <div className="lg:col-span-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="bg-white p-3 rounded-lg shadow-sm border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors">
                        <div className="aspect-w-1 aspect-h-1">
                          {editFormData.images[index] ? (
                            <div className="relative group">
                              <img
                                src={editFormData.images[index]}
                                alt={`Product view ${index}`}
                                className="w-full h-full object-contain rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleImageRemove(index)}
                                    className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setImageSrc(editFormData.images[index]);
                                      setImageIndex(index);
                                      setCropping(true);
                                    }}
                                    className="p-1.5 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleImageChange(e, index)}
                                accept="image/*"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => resetForm()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {cropping && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Crop Image
                    </h3>
                    <div className="relative w-full h-[60vh]">
                      <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={4/3}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCrop}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Apply Crop
                </button>
                <button
                  type="button"
                  onClick={() => setCropping(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateProduct;

