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

  const event = useAppSelector(selectEvent);
  const eventFromList = useAppSelector((state) =>
    selectEventById(state, id || "")
  );
  const currentEvent = event || (id ? eventFromList : null);
  const loading = useAppSelector(selectEventsLoading);
  const error = useAppSelector(selectEventsError);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id));
    }
  }, [dispatch, id]);

  const handleSubmit = async (formData: FormData) => {
    if (!id) return;

    try {
      setFormError(null);
      await dispatch(updateEvent({ id, eventData: formData })).unwrap();
      navigate("/events");
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("An unknown error occurred while updating the event.");
      }
    }
  };

  const handleCancel = () => {
    navigate("/events");
  };

  // If still loading the event
  if (loading === "pending" && !currentEvent) {
    return (
      <div className="min-h-screen bg-nord6 p-6 flex justify-center items-center">
        <div className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-8 w-8 text-nord9"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-nord10 text-xl">Loading event...</p>
        </div>
      </div>
    );
  }

  // If event not found
  if (!currentEvent && loading !== "pending") {
    return (
      <div className="min-h-screen bg-nord6 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/events")}
            className="flex items-center text-nord3 hover:text-nord10 mb-8"
          >
            <FiArrowLeft className="mr-2" />
            Back to events
          </button>

          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FiAlertCircle className="mx-auto text-nord11 mb-4" size={48} />
            <h1 className="text-2xl font-medium text-nord1 mb-2">
              Event not found
            </h1>
            <p className="text-nord3 mb-6">
              The event you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <button
              onClick={() => navigate("/events")}
              className="px-4 py-2 bg-nord9 text-white rounded-lg hover:bg-nord10 transition-colors"
            >
              Return to events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nord6 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/events")}
            className="flex items-center text-nord3 hover:text-nord10 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to events
          </button>
          <h1 className="text-3xl font-garamond font-bold text-nord1">
            Edit Event
          </h1>
        </div>

        {/* Error message */}
        {(error || formError) && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex">
            <FiAlertCircle className="flex-shrink-0 mt-0.5 mr-3" size={18} />
            <div>
              <p className="font-medium">Error updating event</p>
              <p>{formError || error}</p>
            </div>
          </div>
        )}

        {/* Event Form */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {currentEvent && (
            <EventForm
              event={currentEvent}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={loading === "pending"}
              error={formError || error}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;
