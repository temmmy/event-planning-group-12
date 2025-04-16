import React from "react";

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-4xl font-bold text-nord0 mb-4">
        Welcome to the Nikiplan System
      </h1>
      <p className="text-lg text-nord1">
        Manage your events, participants, and communication all in one place.
      </p>
      {/* TODO: Add links to relevant sections like Events List, Create Event (if organizer), etc. */}
    </div>
  );
};

export default HomePage;
