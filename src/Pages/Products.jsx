import { useState } from "react";
import DeleteProducts from "./components/DeleteProducts";
import UpdateProduct from "./components/UpdateProduct";
import ProductAdd from "./components/ProductAdd";
import ProductsList from "./components/ProductsList";
import { FiPlusCircle, FiEdit, FiTrash2 } from "react-icons/fi";

const Products = () => {
  const [currentView, setCurrentView] = useState("Add Product");

  const renderContent = () => {
    switch (currentView) {
      case "Product List":
        return <ProductsList />;
      case "Delete Product":
        return <DeleteProducts />;
      case "Update Product":
        return <UpdateProduct />;
      case "Add Product":
      default:
        return <ProductAdd />;
    }
  };

  const navButtons = [
    {
      name: "Add Product",
      icon: <FiPlusCircle className="text-xl" />,
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      name: "Update Product",
      icon: <FiEdit className="text-xl" />,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      name: "Delete Product",
      icon: <FiTrash2 className="text-xl" />,
      color: "bg-red-500 hover:bg-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Product Management</h1>
          
          <div className="flex flex-wrap gap-4 mb-6">
            {navButtons.map((button) => (
              <button
                key={button.name}
                onClick={() => setCurrentView(button.name)}
                className={`${button.color} ${
                  currentView === button.name 
                    ? "ring-4 ring-opacity-50" 
                    : ""
                } text-white px-6 py-3 rounded-lg transition-all duration-200 ease-in-out
                flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
              >
                {button.icon}
                <span className="font-semibold">{button.name}</span>
              </button>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
