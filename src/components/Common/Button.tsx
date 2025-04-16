import React from "react";

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className,
  ...props
}) => {
  // Base classes + allowing overrides/additions via className prop
  const baseClasses =
    "py-2 px-4 rounded font-semibold transition-colors duration-150 ease-in-out";
  // Nord theme classes - using Frost for primary actions, works on light/dark
  const themeClasses =
    "bg-nord9 text-nord6 hover:bg-nord10 focus:outline-none focus:ring-2 focus:ring-nord10 focus:ring-opacity-50";

  return (
    <button
      className={`${baseClasses} ${themeClasses} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
