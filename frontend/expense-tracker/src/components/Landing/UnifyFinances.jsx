import React from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';

const UnifyFinances = () => {
  const { scrollYProgress } = useScroll({
    offset: ["start end", "end start"]
  });
  
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001
  });

  const floatAnimation = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Background Animation */}
      <motion.div 
        className="absolute inset-0 opacity-10"
        initial={{ backgroundPosition: "0% 0%" }}
        animate={{ backgroundPosition: "100% 100%" }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        style={{
          backgroundImage: "radial-gradient(circle at center, #ff3b2f 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }}
      />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: false, margin: "-100px" }}
            className="space-y-8"
          >
            <motion.h2 
              className="text-7xl md:text-8xl font-bold leading-tight"
            >
              <motion.span 
                className="inline-block bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent"
                {...pulseAnimation}
              >
                Unify your
              </motion.span>
              <br />
              <motion.span 
                className="inline-block bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                expenses
              </motion.span>
            </motion.h2>
          </motion.div>

          {/* Cards Animation Container */}
          <div className="relative h-[500px] flex items-center justify-center perspective-1000">
            <AnimatePresence mode="wait">
              {/* Expense Card */}
              <motion.div
                key="expense-card"
                {...floatAnimation}
                initial={{ opacity: 0, rotateY: 90 }}
                whileInView={{ 
                  opacity: 1,
                  rotateY: 0,
                  transition: {
                    duration: 1,
                    ease: "easeOut"
                  }
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className="absolute w-80 h-48 bg-white rounded-2xl shadow-2xl p-6"
                style={{
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden"
                }}
              >
                {/* Card content */}
              </motion.div>

              {/* Income Card */}
              <motion.div
                key="income-card"
                {...floatAnimation}
                initial={{ opacity: 0, rotateY: -90 }}
                whileInView={{
                  opacity: 1,
                  rotateY: 0,
                  transition: {
                    duration: 1,
                    delay: 0.3,
                    ease: "easeOut"
                  }
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className="absolute w-80 h-48 bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-2xl p-6 text-white"
                style={{
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden"
                }}
              >
                {/* Card content */}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UnifyFinances;