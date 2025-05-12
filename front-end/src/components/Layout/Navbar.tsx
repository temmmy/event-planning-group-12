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
    <nav className="bg-white border-b border-gray-100 py-4 px-6 shadow-nav sticky top-0 z-50">
      <div className="container mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between">
          {/* Left Navigation Links */}
          <div className="flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-nord10" : "text-nord2 hover:text-nord10"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-nord10" : "text-nord2 hover:text-nord10"
                }`
              }
            >
              Events
            </NavLink>
          </div>

          {/* Logo in the Middle */}
          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-2xl font-garamond font-bold text-nord1">
              Nikiplan
            </h1>
          </Link>

          {/* Right Navigation Links */}
          <div className="flex items-center space-x-8">
            {!isAuthenticated ? (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive ? "text-nord10" : "text-nord2 hover:text-nord10"
                    }`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-button ${
                      isActive
                        ? "bg-nord10 text-white"
                        : "bg-nord8/10 text-nord10 hover:bg-nord8/20"
                    }`
                  }
                >
                  Sign Up
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive ? "text-nord10" : "text-nord2 hover:text-nord10"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-nord2 hover:text-nord10 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            className="text-nord2 focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Logo in the Middle for Mobile */}
          <Link to="/" className="mx-auto">
            <h1 className="text-xl font-garamond font-bold text-nord1">
              Nikiplan
            </h1>
          </Link>

          {/* Empty div to balance the flex layout */}
          <div className="w-6"></div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="container mx-auto pt-4 pb-6 space-y-4">
          <NavLink
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-2 py-2 text-sm font-medium transition-colors ${
                isActive ? "text-nord10" : "text-nord2 hover:text-nord10"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/events"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-2 py-2 text-sm font-medium transition-colors ${
                isActive ? "text-nord10" : "text-nord2 hover:text-nord10"
              }`
            }
          >
            Events
          </NavLink>

          <div className="border-t border-gray-200 my-4"></div>

          {!isAuthenticated ? (
            <>
              <NavLink
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-2 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-nord10" : "text-nord2 hover:text-nord10"
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 mt-2 text-center rounded-full text-sm font-medium bg-nord8/10 text-nord10 hover:bg-nord8/20 transition-colors shadow-button"
              >
                Sign Up
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-2 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-nord10" : "text-nord2 hover:text-nord10"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-2 py-2 text-sm font-medium text-nord2 hover:text-nord10 transition-colors"
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
