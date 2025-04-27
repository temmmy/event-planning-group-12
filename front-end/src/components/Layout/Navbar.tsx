import React from "react";
import { Link, NavLink } from "react-router-dom";

const Navbar: React.FC = () => {
  const linkBaseClasses =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out";
  const activeLinkClasses = "bg-nord4 text-nord0";
  const inactiveLinkClasses = "text-nord3 hover:bg-nord5 hover:text-nord0";

  return (
    <nav className="bg-nord5 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-nord0 font-bold text-xl">
              Nikiplan
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `${linkBaseClasses} ${
                    isActive ? activeLinkClasses : inactiveLinkClasses
                  }`
                }
              >
                Home
              </NavLink>
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
              {/* TODO: Add links for Events, Dashboard, Admin (conditionally) */}
            </div>
          </div>
          {/* TODO: Add mobile menu button and logic */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
