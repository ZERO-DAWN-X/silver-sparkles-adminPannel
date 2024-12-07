import React, { useState, useEffect } from "react";
import axios from 'axios';
import SideBanner from "../components/SideBanner";
import LineChart from "../components/Ui/LineChart";
import { motion } from "framer-motion";

function Home() {
  const [customersAmount, setCustomersAmount] = useState(0);
  const [income, setIncome] = useState(0);
  const [prevCustomersAmount, setPrevCustomersAmount] = useState(0);
  const [prevIncome, setPrevIncome] = useState(0);
  const [customersChange, setCustomersChange] = useState(0);
  const [incomeChange, setIncomeChange] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACK_END_URL;
  const [monthlySales, setMonthlySales] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const customersResponse = await axios.get(
          `${backendUrl}/api/api/user/total-customers`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        const totalCustomers = customersResponse.data.totalCustomers;
        setCustomersAmount(totalCustomers);

        const incomeResponse = await axios.get(
          `${backendUrl}/api/api/order/total-income`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        const totalIncome = incomeResponse.data[0].totalIncome;
        setIncome(totalIncome);

        setCustomersChange((totalCustomers - prevCustomersAmount) / prevCustomersAmount * 100);
        setIncomeChange((totalIncome - prevIncome) / prevIncome * 100);

        setPrevCustomersAmount(totalCustomers);
        setPrevIncome(totalIncome);

        const monthlySalesResponse = await axios.get(
          `${backendUrl}/api/api/order/monthly-sales`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        setMonthlySales(monthlySalesResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [backendUrl]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gray-50/30 p-6"
    >
      <motion.div 
        variants={cardVariants}
        className="grid lg:grid-cols-4 gap-6"
      >
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Overview Section */}
          <motion.div 
            variants={cardVariants}
            className="bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
                <div className="flex items-center space-x-2">
                  <select className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <motion.div 
                variants={cardVariants}
                className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100">Total Customers</p>
                    <h2 className="text-3xl font-bold mt-2">{customersAmount}</h2>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={cardVariants}
                className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">Total Income</p>
                    <h2 className="text-3xl font-bold mt-2">LKR {income}</h2>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Monthly Sales Section */}
            <div className="p-6">
              <div className="bg-white rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Monthly Sales</h2>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {monthlySales.map((sale, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">
                            {new Date(sale.month).toLocaleString('default', { month: 'short' })}
                          </span>
                          <div className={`h-1.5 w-1.5 rounded-full ${
                            sale.totalAmount > 15000 ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            LKR {sale.totalAmount?.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {sale.orderCount} orders
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full rounded-full"
                              style={{ width: `${(sale.totalAmount / 20000) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-500">
                            {Math.round((sale.totalAmount / 20000) * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <svg 
                          className={`w-8 h-8 ${
                            sale.totalAmount > 15000 ? 'text-green-500' : 'text-yellow-500'
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d={sale.totalAmount > 15000 
                              ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                              : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                            } 
                          />
                        </svg>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Performance Indicators */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-indigo-50">
                    <h3 className="text-sm font-medium text-indigo-600">Best Month</h3>
                    <p className="mt-2 text-2xl font-bold text-indigo-900">
                      {monthlySales.length > 0 && 
                        new Date(monthlySales.reduce((max, sale) => 
                          sale.totalAmount > max.totalAmount ? sale : max
                        ).month).toLocaleString('default', { month: 'short' })}
                    </p>
                    <p className="text-sm text-indigo-600">
                      LKR {monthlySales.length > 0 && 
                        monthlySales.reduce((max, sale) => 
                          sale.totalAmount > max.totalAmount ? sale : max
                        ).totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-50">
                    <h3 className="text-sm font-medium text-green-600">Total Orders</h3>
                    <p className="mt-2 text-2xl font-bold text-green-900">
                      {monthlySales.reduce((sum, sale) => sum + sale.orderCount, 0)}
                    </p>
                    <p className="text-sm text-green-600">All time</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50">
                    <h3 className="text-sm font-medium text-purple-600">Avg. Order</h3>
                    <p className="mt-2 text-2xl font-bold text-purple-900">
                      LKR {monthlySales.length > 0 ? 
                        Math.round(monthlySales.reduce((sum, sale) => 
                          sum + sale.totalAmount, 0) / 
                          monthlySales.reduce((sum, sale) => 
                          sum + sale.orderCount, 0)
                        ).toLocaleString() : 0}
                    </p>
                    <p className="text-sm text-purple-600">Per order</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <motion.div 
              variants={cardVariants}
              className="p-6 border-t border-gray-100"
            >
              <div className="bg-gray-50 rounded-xl p-4">
                <LineChart />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Side Banner */}
        <motion.div 
          variants={cardVariants}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <SideBanner />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Home;
