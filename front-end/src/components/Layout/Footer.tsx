import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-nord2 text-nord5 py-4 mt-auto shadow-inner">
      <div className="container mx-auto text-center text-sm">
        &copy; {new Date().getFullYear()} Nikiplan. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
