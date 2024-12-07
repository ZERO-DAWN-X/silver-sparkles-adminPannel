import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import { FaProductHunt, FaGifts, FaRegStar, FaPlus } from "react-icons/fa";
import { MdPermMedia } from "react-icons/md";
import { TfiHelpAlt } from "react-icons/tfi";
import { FiLogOut } from "react-icons/fi";
import { motion } from "framer-motion";

export default function SideNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState("");

  useEffect(() => {
    setActive(location.pathname);
  }, [location]);

  const handleLogout = () => {
    try {
      
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      
      
     
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      
      window.location.href = "/login";
    }
  };

  const menu = [
    { id: 1, name: "Home", path: "/", icon: <IoHome /> },
    { id: 2, name: "Products", path: "/Products", icon: <FaProductHunt /> },
    { id: 3, name: "Orders", path: "/Order", icon: <FaGifts /> },
    { id: 5, name: "Media Manager", path: "/Media_Manager", icon: <MdPermMedia /> },
    { id: 6, name: "Best Deals", path: "/BestDeals", icon: <FaRegStar /> },
    { id: 7, name: "Best Deals Add", path: "/BestDealsAdd", icon: <FaPlus /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative min-h-screen bg-white border-r border-gray-100"
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <motion.div 
          variants={itemVariants}
          className="p-6 border-b border-gray-100"
        >
          <img
            src="/logo.svg"
            alt="logo"
            className="w-32 h-auto"
          />
        </motion.div>

        {/* Navigation Menu */}
        <div className="flex-1 px-4 py-6">
          <div className="space-y-1.5">
            {menu.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
              >
                <Link
                  to={item.path}
                  onClick={() => setActive(item.path)}
                  className={`relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${active === item.path 
                      ? "bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-lg" 
                      : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {active === item.path && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-full bg-indigo-500 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className={`text-lg ${
                    active === item.path ? "text-white" : "text-gray-400"
                  }`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <motion.div 
          variants={itemVariants}
          className="p-4 mt-auto border-t border-gray-100"
        >
          <div className="space-y-2">
            <Link
              to="/Help"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <span className="text-lg text-gray-400">
                <TfiHelpAlt />
              </span>
              Help Center
            </Link>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 group"
            >
              <span className="text-lg group-hover:rotate-12 transition-transform duration-300">
                <FiLogOut />
              </span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                Sign Out
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
