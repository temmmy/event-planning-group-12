// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchEventById,
  updateEvent,
  selectEvent,
  selectEventById,
  selectEventsLoading,
  selectEventsError,
} from "../features/events/eventsSlice";
import EventForm from "../components/Events/EventForm";
import { FiArrowLeft, FiAlertCircle } from "react-icons/fi";

const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const eventFromStore = useAppSelector(selectEvent);
  const eventFromList = useAppSelector((state) =>
    selectEventById(state, id || "")
  );
  
  const currentEvent = (eventFromStore && "id" in eventFromStore && eventFromStore.id === id)
    ? eventFromStore
    : (id ? eventFromList : null);

  const loading = useAppSelector(selectEventsLoading);
  const sliceError = useAppSelector(selectEventsError);
  const [formSubmissionError, setFormSubmissionError] = useState<string | null>(null);

  
  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id));
    }
  }, [dispatch, id]);

  const handleSubmit = async (formData: FormData) => {
    if (!id) return;
    try {
      setFormSubmissionError(null);
      await dispatch(updateEvent({ id, eventData: formData })).unwrap();
      navigate(`/events/${id}`, { state: { successMessage: "Event updated successfully!" } });
    } catch (err: any) {
      console.error("Edit event submission error:", err);
      if (err?.message) {
        setFormSubmissionError(err.message);
      } else if (typeof err === 'string') {
        setFormSubmissionError(err);
      } else {
        setFormSubmissionError("An unknown error occurred while updating the event.");
      }
    }
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/events/${id}`);
    } else {
      navigate("/events");
    }
  };

  const displayError = formSubmissionError || sliceError;

  if (loading === "pending" && !currentEvent) {
    return (
     
      <div className="min-h-screen bg-gradient-to-b from-nord6 to-nord5 p-6 flex flex-col justify-center items-center text-center font-sans">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-nord9 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-nord1 text-lg font-medium">Loading Event Data for Editing...</p>
          <p className="text-nord3 text-sm">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  if (!currentEvent && loading !== "pending") {
    return (
      
      <div className="min-h-screen bg-gradient-to-b from-nord6 to-nord5 p-6 flex flex-col justify-center items-center font-sans">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-xl shadow-xl border border-nord5">
          <FiAlertCircle className="mx-auto text-nord11 mb-5" size={56} />
          <h1 className="text-2xl font-semibold text-nord1 mb-3">Event Not Found</h1>
          <p className="text-nord3 mb-8">
            The event you are trying to edit could not be found. It might have been deleted or you may not have permission to access it.
          </p>
          <button
            onClick={() => navigate("/events")}
            className="btn group px-6 py-3 bg-nord9 text-white rounded-lg hover:bg-nord10 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg font-medium flex items-center justify-center"
          >
            <FiArrowLeft className="mr-2 inline-block transition-transform duration-300 group-hover:-translate-x-1" />
            Return to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-gradient-to-b from-nord6 to-nord5 p-4 md:p-8 font-sans">
      
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-nord10 hover:text-nord9 mb-6 md:mb-8 group"
          >
            <FiArrowLeft className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-medium text-sm">
              {id ? "Back to Event Details" : "Back to Events"}
            </span>
          </button>
          <h1 className="text-3xl md:text-4xl font-garamond font-bold text-nord1 leading-tight">
            Edit Event
          </h1>
          {currentEvent && (
            <p className="text-nord3 mt-1">
              Currently editing: <span className="text-nord1 font-semibold">{currentEvent.title}</span>
            </p>
          )}
        </div>

        {displayError && (
          <div className="mb-6 p-4 bg-nord11/10 text-nord11 rounded-lg border border-nord11/30 flex items-start shadow-sm">
            <FiAlertCircle className="flex-shrink-0 mt-0.5 mr-3 h-5 w-5" />
            <div>
              <p className="font-semibold text-nord0">Error Updating Event</p>
              <p className="text-sm text-nord1">{typeof displayError === 'object' ? JSON.stringify(displayError) : displayError}</p>
            </div>
          </div>
        )}

        {/* Event Form Container */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-nord5">
          {currentEvent ? (
            <EventForm
              event={currentEvent}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={loading === "pending"}
              
            />
          ) : (
            <div className="p-10 text-center text-nord3">
              <FiAlertCircle className="mx-auto text-nord12 mb-4" size={48} />
              <p className="text-lg">The event data is not available for editing.</p>
              <p className="text-sm mt-2">Please ensure the event ID is correct or try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;