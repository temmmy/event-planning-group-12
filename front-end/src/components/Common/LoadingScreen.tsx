// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React, { useEffect, useState } from "react";
import "./LoadingScreen.css";
interface LoadingScreenProps {
  isLoading: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // When loading state changes to false, trigger exit animation
    if (!isLoading && !isExiting) {
      setIsExiting(true);
    }
  }, [isLoading, isExiting]);

  // Handle animation end
  const handleAnimationEnd = () => {
    if (isExiting) {
      setIsExiting(false);
      setIsVisible(false);
    }
  };

  // If not visible at all, don't render anything
  if (!isVisible && !isLoading) {
    return null;
  }

  return (
    <div
      className={`loading-screen ${isExiting ? "exiting" : ""}`}
      onAnimationEnd={handleAnimationEnd}
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
