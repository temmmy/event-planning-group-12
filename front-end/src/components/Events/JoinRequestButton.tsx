// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React, { useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { requestToJoinEvent } from "../../features/events/eventsSlice";
import { FiCheck, FiAlertCircle, FiCalendar, FiX } from "react-icons/fi";

interface JoinRequestButtonProps {
  eventId: string;
  eventTitle: string;
  onSuccess?: () => void;
  buttonText?: string;
  className?: string;
}

const JoinRequestButton: React.FC<JoinRequestButtonProps> = ({
  eventId,
  eventTitle,
  onSuccess,
  buttonText = "Request to Join",
  className,
}) => {
  const dispatch = useAppDispatch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCloseDialog = () => {
    if (!isLoading) {
      setIsDialogOpen(false);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleRequestJoin = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const resultAction = await dispatch(requestToJoinEvent(eventId));

      if (requestToJoinEvent.fulfilled.match(resultAction)) {
        // Success case
        setSuccessMessage("Request to join has been sent successfully!");

        // Wait a moment before closing to show success message
        setTimeout(() => {
          setIsDialogOpen(false);
          if (onSuccess) {
            onSuccess();
          }
        }, 1500);
      } else if (requestToJoinEvent.rejected.match(resultAction)) {
        // Error case - extract the error message
        const errorMsg =
          resultAction.payload || "Failed to request to join event";
        setError(
          typeof errorMsg === "string"
            ? errorMsg
            : "Failed to request to join event"
        );
      }
    } catch (err) {
      console.error("Error in requestToJoinEvent:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenDialog}
        className={`px-4 py-2 bg-nord9 hover:bg-nord10 text-white rounded-md transition-colors shadow-sm font-medium ${className}`}
      >
        {buttonText}
      </button>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50 backdrop-blur-sm">
          <div className="bg-nord6 rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-nord6 px-6 py-4 border-b border-nord5 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-nord1">
                Request to Join Event
              </h3>
              <button
                className="text-nord3 hover:text-nord11 focus:outline-none"
                onClick={isLoading ? undefined : handleCloseDialog}
                disabled={isLoading}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <div className="flex items-center mb-2 text-nord9">
                <FiCalendar className="mr-2" size={18} />
                <span className="text-nord1 font-medium">
                  Join {eventTitle}
                </span>
              </div>

              <div className="space-y-4">
                {successMessage ? (
                  <div className="p-4 bg-nord14/10 text-nord14 rounded-lg flex items-center">
                    <FiCheck
                      className="mr-2 flex-shrink-0 text-nord14"
                      size={18}
                    />
                    <span>{successMessage}</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <p className="text-sm text-nord1 bg-nord6/50 p-4 rounded-lg border border-nord5">
                        You are about to request to join{" "}
                        <span className="font-semibold">"{eventTitle}"</span>.
                        <br className="hidden sm:block" />
                        Your request will need to be approved by the event
                        organizer.
                      </p>

                      <p className="text-sm text-nord3">
                        Once approved, you'll receive a notification and be able
                        to see all event details.
                      </p>
                    </div>

                    {error && (
                      <div className="mt-4 p-4 bg-nord11/10 text-nord11 rounded-lg flex items-center">
                        <FiAlertCircle
                          className="mr-2 flex-shrink-0"
                          size={18}
                        />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            {!successMessage && (
              <div className="px-6 py-4 bg-nord6 border-t border-nord5 flex flex-col sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-nord3 bg-white hover:bg-nord5 border border-nord5 rounded-md transition-colors w-full sm:w-auto"
                  onClick={handleCloseDialog}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-nord9 hover:bg-nord10 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto"
                  onClick={handleRequestJoin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Request to Join"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default JoinRequestButton;
