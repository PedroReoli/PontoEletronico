import React from "react";
import { motion } from "framer-motion";

interface LocationOptionProps {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const LocationOption: React.FC<LocationOptionProps> = ({
  icon,
  label,
  isSelected,
  onClick,
}) => {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "bg-blue-100 border-2 border-blue-500"
          : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
          isSelected ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
        }`}
      >
        {icon}
      </div>
      <span className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
        {label}
      </span>
    </motion.div>
  );
};

export default LocationOption;
