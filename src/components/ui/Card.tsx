import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  hoverable = true,
}) => {
  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ${className}`}
      whileHover={hoverable ? { y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" } : {}}
      transition={{ duration: 0.2 }}
    >
      {title && (
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-base font-medium text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </motion.div>
  );
};

export default Card;
