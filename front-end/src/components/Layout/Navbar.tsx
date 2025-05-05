import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import {
  selectIsAuthenticated,
  logoutUser,
} from "../../features/auth/authSlice";

const Navbar: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
    // No need to navigate here, ProtectedRoute will handle redirect if necessary
  };

  // Base classes for links
  const linkBaseClasses =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out";
  // Classes for active link
  const activeLinkClasses = "bg-nord8 text-nord1"; // Active background (accent), dark text
  // Classes for inactive link
  const inactiveLinkClasses = "text-nord5 hover:bg-nord3 hover:text-nord6"; // Light text, darker hover bg

  return (
    <nav className="bg-nord0 shadow-md">
      {" "}
      {/* Darkest background */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-nord8 font-bold text-xl">
              Nikiplan {/* Accent color for brand */}
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {/* Conditional Links based on Auth State */}
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${
                        isActive ? activeLinkClasses : inactiveLinkClasses
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                  {/* Add other authenticated links (Create Event, etc.) */}
                  <button
                    onClick={handleLogout}
                    className={`${linkBaseClasses} ${inactiveLinkClasses} bg-nord11 hover:bg-nord3 hover:text-nord6 text-nord6`} // Logout button style
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${
                        isActive ? activeLinkClasses : inactiveLinkClasses
                      }`
                    }
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${
                        isActive ? activeLinkClasses : inactiveLinkClasses
                      }`
                    }
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
          {/* TODO: Add mobile menu button and logic */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
