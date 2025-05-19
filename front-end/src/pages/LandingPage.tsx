import React,{ useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/Common/LoadingScreen';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const handleGetStartedClick = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/register');
      
    }, 1000); 
  };
    if (isNavigating) {
    
    return <LoadingScreen isLoading={true} />;
  }

  return (
    <section className="bg-nord6 text-nord1">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute inset-0 h-full w-full text-nord4/10" 
          viewBox="0 0 1024 1024"
          preserveAspectRatio="xMidYMid slice"
          fill="currentColor"
        >
          <path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm0 960c-246.4 0-448-201.6-448-448S265.6 64 512 64s448 201.6 448 448-201.6 448-448 448z" />
        </svg>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-20 text-center md:pb-20 md:pt-28">
          <div className="pb-12 md:pb-16">
            <h1
              className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,theme('colors.nord7'),theme('colors.nord9'),theme('colors.nord10'),theme('colors.nord8'),theme('colors.nord7'))] bg-[length:200%_auto] bg-clip-text pb-5 font-nacelle text-4xl font-semibold text-transparent md:text-5xl lg:text-6xl"
            >
              Your Event Management Platform
            </h1>
            <div className="mx-auto max-w-3xl">
              <p
                className="mb-8 text-lg text-nord3 md:text-xl"
              >
                Discover, create, and manage your events. Join our community and elevate your event experiences today!
              </p>
              <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
                <div>
                  <button
                    onClick={handleGetStartedClick}
                    className="btn group mb-4 w-full
                               bg-gradient-to-t from-nord10 to-nord9 text-white
                               shadow-[inset_0px_1px_0px_0px_hsla(192,47%,74%,0.3)]
                               hover:from-nord9 hover:to-nord8 /* Gradient color fade */
                               hover:-translate-y-0.5 hover:shadow-lg
                               transition-all duration-300 ease-in-out
                               sm:mb-0 sm:w-auto"
                  >
                    <span className="relative inline-flex items-center px-6 py-3">
                      Get Started
                      <span
                        className="ml-1 tracking-normal text-nord4/70
                                   transition-transform duration-300 ease-in-out
                                   group-hover:translate-x-0.5"
                      >
                        
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="mb-12 text-3xl font-bold text-nord0 md:text-4xl">
            Awesome Features
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
           
            <div className="group rounded-lg bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl"> {/* Added group and hover:shadow-xl to card */}
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-nord8 text-white transition-colors duration-300 ease-in-out group-hover:bg-nord7 group-hover:text-nord4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-nord1">Easy Event Creation</h3>
              <p className="text-nord3">
                Quickly set up and customize your events with our intuitive interface.
              </p>
            </div>
            
            <div className="group rounded-lg bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-nord9 text-white transition-colors duration-300 ease-in-out group-hover:bg-nord8 group-hover:text-nord4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-nord1">Manage Attendees</h3>
              <p className="text-nord3">
                Track RSVPs, send updates, and engage with your attendees effortlessly.
              </p>
            </div>
            
            <div className="group rounded-lg bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
               <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-nord10 text-white transition-colors duration-300 ease-in-out group-hover:bg-nord9 group-hover:text-nord4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-nord1">Notifications & Discussions</h3>
              <p className="text-nord3">
                Stay updated with instant event alerts and engage with attendees through integrated discussion boards.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-nord5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="mb-4 text-3xl font-bold text-nord0 md:text-4xl">
            Why Choose Our Platform?
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-nord2 md:text-xl">
            We provide a comprehensive and user-friendly solution to make your event management a breeze. Focus on creating memorable experiences, we'll handle the rest.
          </p>
          <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
            <button
              onClick={handleGetStartedClick}
              className="btn group w-full
                           bg-nord8 hover:bg-nord7 text-white /* This already has a color fade */
                           shadow-md hover:shadow-lg hover:-translate-y-0.5
                           transition-all duration-300 ease-in-out
                           px-8 py-3 text-lg font-medium
                           sm:w-auto"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      <div className="py-32">
        
      </div>
    </section>
  );
};

export default LandingPage;