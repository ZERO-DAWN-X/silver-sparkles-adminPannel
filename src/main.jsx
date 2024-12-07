import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from 'react';

const NotFound = lazy(() => import("./NotFound"));
const Products = lazy(() => import("./Pages/Products.jsx"));
const Order = lazy(() => import("./Pages/Order.jsx"));
const MediaManager = lazy(() => import("./Pages/MediaManager.jsx"));
const Home = lazy(() => import("./Pages/Home"));
const Login = lazy(() => import("./auth/Login.jsx"));
const BestDeals = lazy(() => import("./Pages/components/BestDeals.jsx"));
const BestDealsAdd = lazy(() => import("./Pages/components/BestDealsAdd.jsx"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="space-y-4 text-center">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
      <p className="text-gray-500">Loading...</p>
    </div>
  </div>
);

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="Products" element={<Products />} />
            <Route path="Order" element={<Order />} />
            <Route path="Media_Manager" element={<MediaManager />} />
            <Route path="BestDeals" element={<BestDeals />} />
            <Route path="BestDealsAdd" element={<BestDealsAdd />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </Suspense>
    </Router>
  </React.StrictMode>
);
