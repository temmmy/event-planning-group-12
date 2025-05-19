// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/Common/LoadingScreen";
import {
  FiSearch,
  FiEdit,
  FiUsers,
  FiMessageSquare,
  FiThumbsUp,
  FiZap,
  FiHeart,
  FiTrendingUp,
  FiStar,
  FiSmile,
} from "react-icons/fi";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleGetStartedClick = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate("/register");
    }, 1000);
  };
  if (isNavigating) {
    return <LoadingScreen isLoading={true} />;
  }

  return (
    <section className="bg-nord6 text-nord1 min-h-screen">
      {/* Hero Section */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <svg
          className="absolute inset-0 h-full w-full text-nord5 opacity-20"
          viewBox="0 0 1024 1024"
          preserveAspectRatio="xMidYMid slice"
          fill="currentColor"
        >
          <path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm0 960c-246.4 0-448-201.6-448-448S265.6 64 512 64s448 201.6 448 448-201.6 448-448 448z" />
          <circle cx="256" cy="256" r="64" />
          <circle cx="768" cy="768" r="64" />
          <circle cx="256" cy="768" r="32" />
          <circle cx="768" cy="256" r="32" />
        </svg>
      </div>
      <div className="relative mx-auto max-w-full text-center pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        <div className="relative z-10 px-4 sm:px-6">
          <h1 className="bg-white font-garamond animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,theme('colors.nord7'),theme('colors.nord9'),theme('colors.nord10'),theme('colors.nord8'),theme('colors.nord7'))] bg-[length:200%_auto] bg-clip-text pb-6 text-5xl font-semibold text-transparent md:text-6xl lg:text-7xl">
            Elevate Your Event Experience
          </h1>
          <div className="mx-auto max-w-3xl">
            <p className="mb-10 text-lg text-nord3 md:text-xl">
              Discover, create, and manage unforgettable events with seamless
              tools and a vibrant community. Your next great experience starts
              here.
            </p>
            <button
              onClick={handleGetStartedClick}
              className="w-full sm:w-auto px-10 py-4 font-medium rounded-lg shadow-lg
                         bg-nord8 text-white text-lg hover:bg-nord7
                         transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-nord8 focus:ring-opacity-50"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>

      <div className="py-16 md:py-24 bg-nord6">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="mb-4 text-base text-nord9 font-semibold uppercase tracking-wider">
            Everything You Need
          </p>
          <h2 className="font-garamond mb-12 text-4xl font-bold text-nord0 md:text-5xl md:mb-16">
            Packed with Awesome Features
          </h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <FiEdit size={28} />,
                title: "Easy Event Creation",
                description:
                  "Set up and customize events in minutes with our intuitive drag-and-drop interface.",
                bgColor: "bg-nord14",
                hoverColor: "hover:bg-nord13",
              },
              {
                icon: <FiUsers size={28} />,
                title: "Attendee Management",
                description:
                  "Track RSVPs, send targeted updates, and engage with your attendees effortlessly.",
                bgColor: "bg-nord8",
                hoverColor: "hover:bg-nord7",
              },
              {
                icon: <FiMessageSquare size={28} />,
                title: "Seamless Communication",
                description:
                  "Utilize built-in notifications and discussion boards to keep everyone informed.",
                bgColor: "bg-nord10",
                hoverColor: "hover:bg-nord9",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group rounded-xl bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 hover:ring-2 hover:ring-nord9"
              >
                <div
                  className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full text-white ${feature.bgColor} transition-colors duration-300 ease-in-out`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-garamond mb-3 text-2xl font-semibold text-nord1">
                  {feature.title}
                </h3>
                <p className="text-nord3 text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 md:py-24 bg-nord5">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="mb-4 text-base text-nord7 font-semibold uppercase tracking-wider">
            Simple & Effective
          </p>
          <h2 className="font-garamond mb-16 text-4xl font-bold text-nord0 md:text-5xl">
            Get Started in 3 Easy Steps
          </h2>
          <div className="grid md:grid-cols-3 gap-10 text-left">
            {[
              {
                icon: <FiSearch size={32} />,
                title: "1. Discover & Plan",
                description:
                  "Browse existing events or start planning your own. Define details, set your audience, and outline your schedule with ease.",
              },
              {
                icon: <FiZap size={32} />,
                title: "2. Launch & Promote",
                description:
                  "Publish your event to the community or a private group. Utilize our tools to share and attract attendees.",
              },
              {
                icon: <FiTrendingUp size={32} />,
                title: "3. Engage & Manage",
                description:
                  "Keep attendees informed with updates and reminders. Manage RSVPs, discussions, and post-event feedback seamlessly.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center md:items-start p-6 bg-white rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-nord9 text-white mb-5">
                  {step.icon}
                </div>
                <h3 className="font-garamond mb-3 text-2xl font-semibold text-nord1 text-center md:text-left">
                  {step.title}
                </h3>
                <p className="text-nord3 text-base leading-relaxed text-center md:text-left">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 md:py-24 bg-nord6">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="mb-4 text-base text-nord9 font-semibold uppercase tracking-wider">
            Community Voices
          </p>
          <h2 className="font-garamond mb-16 text-4xl font-bold text-nord0 md:text-5xl">
            Loved by Organizers & Attendees
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                name: "Alex P.",
                role: "Event Organizer",
                quote:
                  "This platform revolutionized how I manage my workshops. So intuitive and powerful!",
                icon: <FiStar className="text-nord10" />,
              },
              {
                name: "Jamie L.",
                role: "Attendee",
                quote:
                  "Finding and RSVPing to local meetups has never been easier. Love the notification system!",
                icon: <FiThumbsUp className="text-nord14" />,
              },
              {
                name: "Casey B.",
                role: "Community Manager",
                quote:
                  "The discussion boards are fantastic for pre-event engagement. Highly recommended!",
                icon: <FiSmile className="text-nord8" />,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-nord5 flex items-center justify-center text-xl">
                    {testimonial.icon}
                  </div>
                  <div className="ml-4 text-left">
                    <h4 className="font-garamond text-lg font-semibold text-nord1">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-nord3">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-nord2 italic leading-relaxed text-left">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 md:py-32 bg-nord8 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <FiHeart className="mx-auto mb-6 h-16 w-16 opacity-80" />
          <h2 className="font-garamond mb-6 text-4xl font-bold md:text-5xl">
            Ready to Create Something Amazing?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-nord6 opacity-90 md:text-xl">
            Join thousands of organizers and attendees who are making event
            experiences better. Sign up today and unlock a world of
            possibilities.
          </p>
          <button
            onClick={handleGetStartedClick}
            className="w-full sm:w-auto px-10 py-4 font-medium rounded-lg shadow-xl
                       bg-nord0 text-nord6 text-lg hover:bg-nord1
                       transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-nord0 focus:ring-opacity-50"
          >
            Start Your Journey
          </button>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
