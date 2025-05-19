// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React, { ReactNode } from "react";
import hangOutSvg from "../../assets/hang-out.svg";

interface AuthLayoutProps {
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
  type: "login" | "register";
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  type,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-nord6 p-4 md:p-8">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left side - Image */}
        <div className="w-full md:w-1/2 bg-nord8/10  flex items-center justify-center">
          <img
            src={hangOutSvg}
            alt="People collaborating"
            className="max-w-full h-auto drop-shadow-lg"
          />
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <p className="text-nord10 text-sm font-medium mb-1 uppercase tracking-wider">
              {type === "register" ? "Register Now" : "Welcome Back"}
            </p>
            <h1 className="font-garamond text-3xl md:text-4xl font-bold text-nord1 mb-2">
              {title}
            </h1>
            {subtitle && <p className="text-nord3 text-sm">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
