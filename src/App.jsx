import "./App.css";
import Header from "./components/Header";
import SideNavBar from "./components/SideNavBar";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import useAuth from "./auth/useAuth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50/30">
      {/* Sidebar larger screens */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="fixed w-64 h-full">
          <SideNavBar />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              <SideNavBar />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} />
        
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`
            flex-1 px-4 py-6
            transition-all duration-300 ease-in-out
            lg:pl-8 lg:pr-6
            ${isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}
          `}
        >
          <div className="max-w-[1920px] mx-auto w-full">
            <Outlet />
          </div>
        </motion.main>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="!-translate-y-4 !translate-x-[-1rem]"
      />
    </div>
  );
}

export default App;
