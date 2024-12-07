import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-lg font-bold text-indigo-600">
          LKR {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const SalesChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const backendUrl = import.meta.env.VITE_BACK_END_URL;
    const fetchSalesData = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/api/order/income-chart-data`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        setSalesData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={chartVariants}
      className="bg-white rounded-xl shadow-sm border border-gray-100"
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Sales Analytics</h2>
            <p className="text-sm text-gray-500 mt-1">Revenue over time</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedPeriod("weekly")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                selectedPeriod === "weekly"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setSelectedPeriod("monthly")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                selectedPeriod === "monthly"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPeriod("yearly")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                selectedPeriod === "yearly"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={salesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  type="category"
                  allowDuplicatedCategory={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(value) => `LKR ${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="totalSales"
                  name="Total Sales"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', strokeWidth: 2 }}
                  activeDot={{
                    r: 6,
                    fill: '#6366f1',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                  fill="url(#salesGradient)"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <div className="text-sm font-medium text-indigo-600">
                  Total Revenue
                </div>
                <div className="mt-2 text-2xl font-bold text-indigo-900">
                  LKR {salesData.reduce((sum, item) => sum + item.totalSales, 0).toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="text-sm font-medium text-emerald-600">
                  Average Sale
                </div>
                <div className="mt-2 text-2xl font-bold text-emerald-900">
                  LKR {Math.round(
                    salesData.reduce((sum, item) => sum + item.totalSales, 0) / salesData.length
                  ).toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                <div className="text-sm font-medium text-purple-600">
                  Growth Rate
                </div>
                <div className="mt-2 text-2xl font-bold text-purple-900">
                  {salesData.length > 1 
                    ? `${Math.round(
                        ((salesData[salesData.length - 1].totalSales - salesData[0].totalSales) 
                        / salesData[0].totalSales) * 100
                      )}%`
                    : '0%'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SalesChart;
