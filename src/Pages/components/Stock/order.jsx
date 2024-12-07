import React, { useState, useEffect } from "react";
import ItemDetails from "./ItemDetails";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

const Orders = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [soldItemCount, setSoldItemCount] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const accessToken = localStorage.getItem('accessToken');
  const backendUrl = import.meta.env.VITE_BACK_END_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/api/order/get?status=pending`,{
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

  const handleConform = (itemId) => {
    console.log(itemId);
    console.log(localStorage.getItem("accessToken"));
    const conformOrder = async () => {
      try {
        const response = await axios.put(
          `${backendUrl}/api/api/order/update/${itemId}`, 
          {},
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setItems(items.filter((item) => item.id !== itemId));
        setSoldItemCount({ ...soldItemCount, [itemId]: (soldItemCount[itemId] || 0) + 1 });
      } catch (error) {
        console.error("Error conforming order:", error);
      }
    };
  
    conformOrder();
  
    setSelectedItem(null);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "orders":
        return "Orders";
      default:
        return "Unknown";
    }
  };

  
  const filteredItems = items.filter((item) =>
    item.product.title.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative flex items-center w-full my-5">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search or type Command ..."
          className="outline-none border border-gray-300 rounded-full px-10 py-2 text-md w-full"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      <h1 className="text-2xl font-bold mb-4">{getStatusText("orders")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            <div className="relative">
              <img
                src={`${item.product.images[0].url}`}
                alt={item.product.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-0 right-0 bg-green-500 text-white py-1 px-3 rounded-bl-lg font-bold">
                Orders
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{item.product.title}</h2>
              <p className="text-gray-700">Quantity: {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>
      {selectedItem && (
        <ItemDetails
          selectedItem={selectedItem}
          pageIdentifier={"orders"}
          onClose={() => setSelectedItem(null)}
          onConform={() => handleConform(selectedItem.id)}
          soldCount={soldItemCount[selectedItem.id] || 0}
        />
      )}
    </div>
  );
};

export default Orders;
