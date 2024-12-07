import { useState, useEffect } from "react";
import {
  FaSearch,
  FaBell,
  FaUserCircle,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

function Header({ toggleSidebar }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const backendUrl = import.meta.env.VITE_BACK_END_URL;
        
        const response = await axios.get(
          `${backendUrl}/api/api/notifications`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        setNotifications(response.data);
        setUnreadNotifications(response.data.filter(notif => !notif.isRead).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };


    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
    toggleSidebar();
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const backendUrl = import.meta.env.VITE_BACK_END_URL;
      
     
      await axios.put(
        `${backendUrl}/api/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

    
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-white border-b border-gray-100"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors lg:hidden"
          >
            <FaBars className="text-gray-600 text-xl" />
          </motion.button>
          
          {/* Search Bar */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px] px-4 py-2 pl-10 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Toggle */}
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-xl">
            <FaSearch className="text-gray-600 text-lg" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FaBell className="text-gray-600 text-xl" />
              {unreadNotifications > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full"
                >
                  {unreadNotifications}
                </motion.span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No new notifications
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.isRead ? 'bg-indigo-50/50' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification.id)}
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <FaUserCircle className="text-gray-600 text-2xl" />
              <span className="hidden md:block text-sm font-medium text-gray-700">
                Admin
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
