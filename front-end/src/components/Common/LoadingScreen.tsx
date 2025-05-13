import React, { useEffect, useState } from "react";
import "./LoadingScreen.css";

interface LoadingScreenProps {
  isLoading: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // When loading state changes to false, trigger exit animation
    if (!isLoading && !isExiting) {
      setIsExiting(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // If not loading and exit animation completed, don't render anything
  if (!isLoading && !isExiting) {
    return null;
  }

  return (
    <div
      className={`loading-screen ${isExiting ? "exiting" : ""}`}
      onAnimationEnd={() => {
        if (isExiting) setIsExiting(false);
      }}
    >
      <div className="loading-content">
        <h1 className="font-garamond text-4xl md:text-5xl font-bold text-white mb-12">
          Niki<span className="text-nord8">plan</span>
        </h1>

        <div className="loader">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>

        <p className="text-nord4 mt-16 font-medium">
          Preparing your experience...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
