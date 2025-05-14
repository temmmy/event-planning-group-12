import React from "react";
import { Link } from "react-router-dom";

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-nord0 text-nord6">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4 text-nord11">Unauthorized Access</h1>
        <p className="text-xl mb-8">
          You do not have permission to access this page.
        </p>
        <Link
          to="/"
          className="bg-nord9 hover:bg-nord10 text-nord0 font-bold py-2 px-6 rounded"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;