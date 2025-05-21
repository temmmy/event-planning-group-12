// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createEvent,
  selectEventsLoading,
  selectEventsError,
} from "../features/events/eventsSlice";
import EventForm from "../components/Events/EventForm"; 
import { FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../store/hooks";

// Nord Color Palette (for reference, ideally these are in your tailwind.config.js)
// const nordColors = {
//   nord0: "#2E3440", nord1: "#3B4252", nord2: "#434C5E", nord3: "#4C566A",
//   nord4: "#D8DEE9", nord5: "#E5E9F0", nord6: "#ECEFF4",
//   nord7: "#8FBCBB", nord8: "#88C0D0", nord9: "#81A1C1", nord10: "#5E81AC",
//   nord11: "#BF616A", nord12: "#D08770", nord13: "#EBCB8B", nord14: "#A3BE8C", nord15: "#B48EAD",
// };

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectEventsLoading); 
  const sliceError = useAppSelector(selectEventsError); 
  const [formSubmissionError, setFormSubmissionError] = useState<string | null>(null); 

  const handleSubmit = async (formData: FormData) => {
    try {
      setFormSubmissionError(null);
      await dispatch(createEvent(formData)).unwrap(); 
      navigate("/events", { state: { successMessage: "Event created successfully!" } }); 
    } catch (err: any) { 
      console.error("Create event submission error:", err);
      if (err?.message) { 
        setFormSubmissionError(err.message);
      } else if (typeof err === 'string') { 
        setFormSubmissionError(err);
      }
      else {
        setFormSubmissionError("An unknown error occurred while creating the event. Please check server logs.");
      }
    }
  };

  const handleCancel = () => {
    navigate("/events");
  };

  
  const displayError = formSubmissionError || sliceError;

  return (
    <div className="min-h-screen bg-nord6 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/events")}
            className="flex items-center text-nord10 hover:text-nord9 mb-5 group" 
          >
            <FiArrowLeft className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-medium text-sm">Back to Events</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-garamond font-bold text-nord1"> 
            Create a New Event
          </h1>
        </div>

        {/* Error message display */}
        {displayError && (
          <div className="mb-6 p-4 bg-nord11/10 text-nord11 rounded-lg border border-nord11/30 flex items-start shadow-sm">
            <FiAlertCircle className="flex-shrink-0 mt-0.5 mr-3 h-5 w-5" />
            <div>
              <p className="font-semibold text-nord0">Error Creating Event</p> {/* nord0 for contrast */}
              <p className="text-sm text-nord1">{typeof displayError === 'object' ? JSON.stringify(displayError) : displayError}</p> 
            </div>
          </div>
        )}

        {/* Event Form Container */}
        
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-nord5"> 
          <EventForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={loading === "pending"} 
            
          />
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;