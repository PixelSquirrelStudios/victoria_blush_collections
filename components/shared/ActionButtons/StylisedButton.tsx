import React from "react";

interface StylisedButtonProps {
  children: React.ReactNode;
}

const StylisedButton = ({ children }: StylisedButtonProps) => {
  return (
    <div className="group relative inline-block transition-transform duration-300 ease-in-out hover:-translate-y-1">
      {/* Outer Layer - Blue Gradient Offset */}
      <div className="absolute inset-0 bg-rose-300 transition-transform duration-300 ease-in-out 
                      translate-x-[3px] translate-y-[3px] group-hover:translate-x-1 group-hover:translate-y-1"></div>

      {/* Middle Layer - Pink Gradient Offset */}
      <div className="absolute inset-0 bg-rose-400 transition-transform duration-300 ease-in-out 
                      -translate-x-[3px] -translate-y-[3px] group-hover:-translate-x-1 group-hover:-translate-y-1"></div>
      {/* Button Wrapper - White Background on Top */}
      <div className="relative p-0.5 bg-white">
        {children}
      </div>
    </div>
  );
};

export default StylisedButton;
