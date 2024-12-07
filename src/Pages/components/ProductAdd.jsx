import React, { useState, useCallback } from "react";
import CustomDropdown from "./CustomDropdown";
import Cropper from "react-easy-crop";
import { AiFillCloseCircle } from "react-icons/ai";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Checkbox from "@mui/material/Checkbox";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ProductAdd = () => {
  const [product, setProduct] = useState({
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

  const[isLoading,setIsLoading] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageIndex, setImageIndex] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (file) {
      if (!validateImage(file)) return;
      
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setImageSrc(reader.result);
          setImageIndex(index);
          setCropping(true);
        };
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Failed to process image');
      }
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    const updatedProduct = { ...product };
    if (
      name === "gold" ||
      name === "silver" ||
      name === "rose gold" ||
      name === "white gold"
    ) {
      
      if (checked) {
        updatedProduct.color.push(name);
      } else {
        for (let i = updatedProduct.color.length - 1; i >= 0; i--) {
          if (updatedProduct.color[i] === name) {
            updatedProduct.color.splice(i, 1);
          }
        }
      }
    } else {
      
      if (checked) {
        updatedProduct.length.push(name);
      } else {
        for (let i = updatedProduct.length.length - 1; i >= 0; i--) {
          if (updatedProduct.length[i] === name) {
            updatedProduct.length.splice(i, 1);
          }
        }
      }
    }

    setProduct(updatedProduct);
    console.log(product);
  };

  const handleImageRemove = (e, index) => {
    e.stopPropagation();
    e.preventDefault();
    const updatedImages = [...product.images];
    updatedImages[index] = null;
    setProduct({ ...product, images: updatedImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    
    if (!product.images.some(img => img !== null)) {
      toast.error("Please add at least one image");
      return;
    }

    const formData = new FormData();

  
    const basicFields = [
      'title', 'category', 'price', 'description', 'stock',
      'metal', 'weight', 'width', 'ring_size', 'stone',
      'gender', 'style'
    ];

    basicFields.forEach(field => {
      if (product[field]) {
        formData.append(field, String(product[field]));
      }
    });

    // images
    try {
      for (let i = 0; i < product.images.length; i++) {
        if (product.images[i]) {
          const response = await fetch(product.images[i]);
          const blob = await response.blob();
          formData.append("images", blob, `image${i}.jpg`);
        }
      }

      // length array
      if (product.length && Array.isArray(product.length)) {
        product.length.forEach(len => {
          formData.append("length[]", String(len));
        });
      }

      // color array
      if (product.color && Array.isArray(product.color)) {
        product.color.forEach(col => {
          formData.append("color[]", String(col));
        });
      }

      // Log FormData
      console.log("Form data entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0], typeof pair[1], pair[1]);
      }

      const backendUrl = import.meta.env.VITE_BACK_END_URL;
      const accessToken = localStorage.getItem("accessToken");
      
      console.log("Sending request to:", `${backendUrl}/api/api/product/add`);
      
      await axios.post(`${backendUrl}/api/api/product/add`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Save locally
      try {
        const existingData = localStorage.getItem('localProducts');
        const products = existingData ? JSON.parse(existingData) : [];

        const newProduct = {
          id: Date.now(),
          ...product,
          images: product.images.filter(img => img !== null)
        };
        products.push(newProduct);

        localStorage.setItem('localProducts', JSON.stringify(products));
        toast.success("Product added successfully!");
        
        // Reset form
        setProduct({
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
        setIsLoading(false);
      } catch (err) {
        console.error('Error saving locally:', err);
        toast.warning("Product saved to backend but local save failed");
        setIsLoading(false);

      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
      setIsLoading(false);

    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
    const image = new Image();
    image.src = imageSrc;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

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

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const fileUrl = URL.createObjectURL(blob);
        resolve(fileUrl);
      }, "image/jpeg");
    });
  };

  const handleCrop = async () => {
    try {
      const croppedImageUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
      const updatedImages = [...product.images];
      updatedImages[imageIndex] = croppedImageUrl;
      setProduct({ ...product, images: updatedImages });
      setCropping(false);
    } catch (e) {
      toast.error("Error cropping image: " + e.message);
    }
  };

  
  const handleRecrop = (index) => {
    if (product.images[index]) {
      setImageSrc(product.images[index]);
      setImageIndex(index);
      setCropping(true);
    }
  };

  
  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 1));
  };

 
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500');
  };

  const handleDrop = async (e, index) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageSrc(reader.result);
        setImageIndex(index);
        setCropping(true);
      };
    }
  };

 
  const validateImage = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return false;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload only image files');
      return false;
    }
    return true;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Product</h2>
        <p className="text-gray-600">Fill in the details to add a new product to your inventory.</p>
      </div>

      {cropping && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-4/5 h-4/5 bg-white rounded-xl p-6">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
            <div className="absolute bottom-6 right-6 flex gap-3">
              <button
                onClick={handleCrop}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Crop Image
              </button>
              <button
                onClick={() => setCropping(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Information Section */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input
                type="text"
                name="title"
                value={product.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter price"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                type="number"
                name="stock"
                value={product.stock}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter stock quantity"
                required
              />
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              value={product.category}
              onChange={handleChange}
              required
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
              value={product.metal}
              onChange={handleChange}
              required
            />

            <CustomDropdown
              label="Stone"
              options={[
                { label: "Natural Diamonds", value: "natural-diamonds" },
                { label: "American Diamonds", value: "american-diamonds" }
              ]}
              name="stone"
              value={product.stone}
              onChange={handleChange}
              required
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
              value={product.style}
              onChange={handleChange}
              required
            />

            <CustomDropdown
              label="Gender"
              options={[
                { label: "Men", value: "men" },
                { label: "Women", value: "women" },
                { label: "Unisex", value: "unisex" }
              ]}
              name="gender"
              value={product.gender}
              onChange={handleChange}
              required
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
              value={product.ring_size}
              onChange={handleChange}
              required={product.category === "rings"}
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
              value={product.width}
              onChange={handleChange}
              required
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
              value={product.weight}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product description"
              required
            />
          </div>
        </div>

        {/* Color and Length Options */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Variations</h3>
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
                          checked={product.color.includes(colorOption)}
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
                          checked={product.length.includes(lengthOption)}
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
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Images</h3>
          <p className="text-sm text-gray-600 mb-6">Upload up to 4 high-quality images. First image will be the main display image.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Image */}
            <div className="lg:col-span-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors">
                <div className="aspect-w-16 aspect-h-12">
                  {product.images[0] ? (
                    <div className="relative group">
                      <img
                        src={product.images[0]}
                        alt="Main product"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleImageRemove(0)}
                            className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRecrop(0)}
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
                      {product.images[index] ? (
                        <div className="relative group">
                          <img
                            src={product.images[index]}
                            alt={`Product view ${index}`}
                            className="w-full h-full object-contain rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleImageRemove(index)}
                                className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleRecrop(index)}
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

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <span>{isLoading ? 'adding product ...' : 'Add Product' }</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductAdd;
