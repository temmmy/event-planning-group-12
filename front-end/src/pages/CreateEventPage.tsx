import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  createEvent,
  selectEventsLoading,
  selectEventsError,
} from "../features/events/eventsSlice";
import EventForm from "../components/Events/EventForm";
import { FiArrowLeft, FiAlertCircle } from "react-icons/fi";

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectEventsLoading);
  const error = useAppSelector(selectEventsError);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      setFormError(null);
      await dispatch(createEvent(formData)).unwrap();
      navigate("/events");
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("An unknown error occurred while creating the event.");
      }
    }
  };

  const handleCancel = () => {
    navigate("/events");
  };

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
            Create a New Event
          </h1>
        </div>

        {/* Error message */}
        {(error || formError) && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex">
            <FiAlertCircle className="flex-shrink-0 mt-0.5 mr-3" size={18} />
            <div>
              <p className="font-medium">Error creating event</p>
              <p>{formError || error}</p>
            </div>
          </div>
        )}

        {/* Event Form */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
