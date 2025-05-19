// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React from "react";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string; // Optional title
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-nord0 bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close modal on backdrop click
    >
      <div
        className="bg-nord6 text-nord0 p-6 rounded-lg shadow-xl relative max-w-lg w-full mx-4 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-enter"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        <button
          className="absolute top-3 right-3 text-nord3 hover:text-nord11 text-2xl leading-none font-semibold outline-none focus:outline-none"
          onClick={onClose}
        >
          &times;
        </button>
        {title && (
          <h3 className="text-xl font-semibold mb-4 text-nord1">{title}</h3>
        )}
        <div>{children}</div>
      </div>
      {/* Add animation keyframes to a global CSS file if needed, e.g., index.css or App.css */}
      {/* 
      @keyframes modal-enter {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      } 
      .animate-modal-enter {
        animation: modal-enter 0.3s ease-out forwards;
      }
      */}
    </div>
  );
};

export default Modal;
