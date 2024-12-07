import React, { useState, useEffect } from "react";
import ItemDetails from "./ItemDetails";
import axios from "axios";

const OutOfStock = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const accessToken = localStorage.getItem('accessToken');
  const backendUrl = import.meta.env.VITE_BACK_END_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/api/product/filter?stock=0`,{
          headers: {
              'Authorization': `Bearer ${accessToken}`
          }
      });
        setItems(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);


  const getStatusText = (status) => {
    switch (status) {
      case "Outof Stock":
        return "Out of Stock";
      default:
        return "Unknown";
    }
  };

  const getImageUrl = (item) => {
   
    console.log(JSON.parse(item.images))
    const images = JSON.parse(item.images);
    return images[0].url;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{getStatusText("Outof Stock")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer"
          >
            <div className="relative">
              <img
                src={`${getImageUrl(item)}`}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-0 right-0 bg-yellow-500 text-white py-1 px-3 rounded-bl-lg font-bold">
                Out of Stock
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{item.title}</h2>
              <p className="text-gray-700">Stock: {item.stock}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutOfStock;
