import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { logoutUser } from "../../features/auth/authSlice";

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logoutUser());
    setIsMobileMenuOpen(false); // Close mobile menu on logout
  };

  return (
    <nav className="bg-nord0 text-nord6 p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="text-2xl font-bold text-nord8">
          Nikiplan
        </Link>

        {/* Hamburger Button for Mobile */}
        <button
          className="md:hidden text-nord6 focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          <span className="text-2xl">
            {isMobileMenuOpen ? "✕" : "☰"} {/* Simple icons; replace with SVG if preferred */}
          </span>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {!isAuthenticated ? (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-3 py-2 rounded ${
                    isActive ? "bg-nord8 text-nord0" : "text-nord6 hover:bg-nord1"
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `px-3 py-2 rounded ${
                    isActive ? "bg-nord8 text-nord0" : "text-nord6 hover:bg-nord1"
                  }`
                }
              >
                Register
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-3 py-2 rounded ${
                    isActive ? "bg-nord8 text-nord0" : "text-nord6 hover:bg-nord1"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded text-nord6 hover:bg-nord1"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="flex flex-col items-center space-y-2 py-4">
          {!isAuthenticated ? (
            <>
              <NavLink
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                className={({ isActive }) =>
                  `w-full text-center px-3 py-2 rounded ${
                    isActive ? "bg-nord8 text-nord0" : "text-nord6 hover:bg-nord1"
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `w-full text-center px-3 py-2 rounded ${
                    isActive ? "bg-nord8 text-nord0" : "text-nord6 hover:bg-nord1"
                  }`
                }
              >
                Register
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `w-full text-center px-3 py-2 rounded ${
                    isActive ? "bg-nord8 text-nord0" : "text-nord6 hover:bg-nord1"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full text-center px-3 py-2 rounded text-nord6 hover:bg-nord1"
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
