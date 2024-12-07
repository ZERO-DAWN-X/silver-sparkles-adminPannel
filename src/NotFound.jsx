import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden"
    >
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-3xl"
        animate={{
          x: mousePosition.x * 0.1,
          y: mousePosition.y * 0.1,
        }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-indigo-500/20 blur-3xl"
        animate={{
          x: mousePosition.x * -0.1,
          y: mousePosition.y * -0.1,
        }}
      />

      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-[150px] font-bold text-white leading-none tracking-tighter">
            404
          </h1>
          <p className="text-2xl font-light text-white/80 mt-4">
            Oops! The page you're looking for has vanished into thin air.
          </p>
        </motion.div>

        <motion.div 
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <a
            href="/"
            className="group relative px-6 py-3 w-full sm:w-auto text-white font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              Return Home
            </span>
          </a>
          
          <a
            href="/support"
            className="group px-6 py-3 w-full sm:w-auto text-white/90 hover:text-white font-medium rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" 
              />
            </svg>
            Contact Support
          </a>
        </motion.div>

        <motion.p 
          className="mt-8 text-white/60 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Try moving your mouse around 👀
        </motion.p>
      </div>
    </motion.main>
  );
}
