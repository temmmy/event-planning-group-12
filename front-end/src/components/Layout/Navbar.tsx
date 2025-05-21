// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { logoutUser, selectUser } from "../../features/auth/authSlice";
import NotificationsDropdown from "../Notifications/NotificationsDropdown";

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector(selectUser);
  const isAdmin = user?.role === "admin";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsMobileMenuOpen(false);
  };

  // Consistent NavLink styling function
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors duration-150 ease-in-out px-1 py-0.5 rounded-sm focus:outline-none focus:ring-2 focus:ring-nord8 focus:ring-opacity-50 ${
      isActive
        ? "text-nord10 underline underline-offset-4 decoration-nord10 decoration-2"
        : "text-nord2 hover:text-nord10"
    }`;

  // Consistent Mobile NavLink styling function
  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2.5 rounded-md text-base font-medium transition-colors duration-150 ease-in-out ${
      isActive
        ? "bg-nord9 text-white" // Active mobile links with a distinct background
        : "text-nord1 hover:bg-nord5 hover:text-nord0"
    }`;

  return (
    <nav className="bg-gradient-to-r from-nord6 via-nord5 to-nord4 border-b border-nord4 shadow-md sticky top-0 z-50 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between h-16">
          {/* Left Navigation Links */}
          <div className="flex items-center space-x-6">
            <NavLink to="/events" className={navLinkClasses}>
              Events
            </NavLink>
            {/* Add other primary desktop links here if needed */}
          </div>

          {/* Logo in the Middle */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="flex items-center group" title="Home">
              <h1 className="text-2xl font-garamond font-bold text-nord1 group-hover:text-nord10 transition-colors">
                Nikiplan
              </h1>
            </Link>
          </div>

          {/* Right Navigation Links & Actions */}
          <div className="flex items-center space-x-5">
            {!isAuthenticated ? (
              <>
                <NavLink to="/login" className={navLinkClasses}>
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  // Applying primary action button style
                  className="btn group inline-flex items-center justify-center px-4 py-2 bg-gradient-to-t from-nord10 to-nord9 text-white rounded-lg shadow-[inset_0px_1px_0px_0px_hsla(207,33%,60%,0.3)] hover:from-nord9 hover:to-nord8 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 ease-in-out text-sm font-medium"
                >
                  Sign Up
                </NavLink>
              </>
            ) : (
              <>
                {isAdmin && (
                  <NavLink to="/admin/settings" className={navLinkClasses} title="Admin Settings">
                    Admin
                  </NavLink>
                )}
                {/* Example: Profile Link - Assuming user object has a username */}
                {user && (
                    <NavLink to={`/profile/${user.id}`} className={navLinkClasses} title="My Profile">
                        {user.username || "Profile"}
                    </NavLink>
                )}
                <NotificationsDropdown /> {/* Assuming this component is styled or adapts */}
                <button
                  onClick={handleLogout}
                  className={`${navLinkClasses({ isActive: false})} !text-nord11 hover:!text-nord11/80 hover:underline`} // Use !important for override if needed, or ensure specificity
                  title="Logout"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between h-16">
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-xl font-garamond font-bold text-nord1">Nikiplan</h1>
          </Link>

          <div className="flex items-center">
            {/* Conditionally render notifications for mobile if authenticated */}
            {isAuthenticated && (
              <div className="mr-2"> {/* Add some spacing if needed */}
                <NotificationsDropdown /> {/* Render as is, without new props */}
              </div>
            )}
            <button
              className="p-2 rounded-md text-nord2 hover:text-nord1 hover:bg-nord5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-nord9 transition"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden absolute top-16 inset-x-0 z-40 bg-nord5 shadow-lg rounded-b-lg overflow-hidden ring-1 ring-nord4 ring-opacity-20 transform transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen
            ? "max-h-screen opacity-100 scale-y-100" // Adjusted max-h for content
            : "max-h-0 opacity-0 scale-y-95 pointer-events-none"
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NavLink to="/events" onClick={toggleMobileMenu} className={mobileNavLinkClasses}>
            Events
          </NavLink>

          {/* You can add more primary links for mobile here if needed */}

          <div className="border-t border-nord4 my-2"></div> {/* Themed separator */}

          {!isAuthenticated ? (
            <>
              <NavLink to="/login" onClick={toggleMobileMenu} className={mobileNavLinkClasses}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={toggleMobileMenu}
                // Consistent Sign Up button styling for mobile
                className="block w-full text-center mt-2 px-4 py-2.5 bg-gradient-to-t from-nord10 to-nord9 text-white rounded-lg shadow-[inset_0px_1px_0px_0px_hsla(207,33%,60%,0.3)] hover:from-nord9 hover:to-nord8 text-base font-medium transition-all"
              >
                Sign Up
              </NavLink>
            </>
          ) : (
            <>
              {/* User-specific links for mobile */}
              {user && (
                <NavLink to={`/profile/${user.id}`} onClick={toggleMobileMenu} className={mobileNavLinkClasses}>
                  My Profile
                </NavLink>
              )}
              {isAdmin && (
                <NavLink to="/admin/settings" onClick={toggleMobileMenu} className={mobileNavLinkClasses}>
                  Admin Settings
                </NavLink>
              )}
              {/* Logout button last */}
              <div className="border-t border-nord4 my-2"></div>
              <button
                onClick={handleLogout}
                className={`${mobileNavLinkClasses({ isActive: false})} w-full text-left !text-nord11 hover:!bg-nord11/10 hover:!text-nord11`}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;