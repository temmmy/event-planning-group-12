// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React, { useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiHelpCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { respondToInvitation } from "../../features/events/eventsSlice";

interface EventRSVPProps {
  eventId: string;
  status?: "pending" | "accepted" | "declined" | "requested";
  onSuccess?: () => void;
  className?: string;
  displayStyle?: "buttons" | "badge" | "both";
}

const EventRSVP: React.FC<EventRSVPProps> = ({
  eventId,
  status = "pending",
  onSuccess,
  className = "",
  displayStyle = "buttons",
}) => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(status);

  const handleResponse = async (newStatus: "accepted" | "declined") => {
    try {
      setIsSubmitting(true);
      setError(null);

      await dispatch(
        respondToInvitation({ id: eventId, status: newStatus })
      ).unwrap();

      setCurrentStatus(newStatus);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError("Failed to update RSVP status. Please try again.");
      console.error("Error responding to invitation:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status badge
  const renderStatusBadge = () => {
    switch (currentStatus) {
      case "accepted":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-nord14/20 text-nord14">
            <FiCheckCircle className="mr-2" />
            Attending
          </span>
        );
      case "declined":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-nord11/20 text-nord11">
            <FiXCircle className="mr-2" />
            Not Attending
          </span>
        );
      case "requested":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-nord13/20 text-nord13">
            <FiHelpCircle className="mr-2" />
            Request Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-nord13/20 text-nord13">
            <FiClock className="mr-2" />
            Pending Response
          </span>
        );
    }
  };

  // Action buttons
  const renderActionButtons = () => {
    if (currentStatus === "accepted" || currentStatus === "declined") {
      return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 w-full">
          <div className="mb-3 sm:mb-0 w-full sm:w-auto">
            {renderStatusBadge()}
          </div>
          <button
            onClick={() =>
              handleResponse(
                currentStatus === "accepted" ? "declined" : "accepted"
              )
            }
            className="px-3 py-1.5 text-sm inline-flex items-center justify-center text-nord9 hover:text-nord10 border border-nord5 rounded-md hover:bg-nord6/50 transition-colors w-full sm:w-auto"
            disabled={isSubmitting}
          >
            <FiRefreshCw className="mr-2" />
            Change Response
          </button>
        </div>
      );
    }

    // Don't show action buttons for requested status
    if (currentStatus === "requested") {
      return (
        <div className="text-sm text-nord3 bg-nord6/50 px-3 py-2 rounded-md border border-nord5 w-full">
          Your request is awaiting organizer approval
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full">
        <button
          onClick={() => handleResponse("accepted")}
          className="px-3 py-2 bg-nord14 text-white rounded-md hover:bg-nord14/90 flex items-center text-sm disabled:opacity-50 transition-colors w-full sm:w-auto justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center w-full">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </span>
          ) : (
            <>
              <FiCheckCircle className="mr-2" />
              Accept
            </>
          )}
        </button>
        <button
          onClick={() => handleResponse("declined")}
          className="px-3 py-2 bg-nord11 text-white rounded-md hover:bg-nord11/90 flex items-center text-sm disabled:opacity-50 transition-colors w-full sm:w-auto justify-center"
          disabled={isSubmitting}
        >
          <FiXCircle className="mr-2" />
          Decline
        </button>
      </div>
    );
  };

  // Show error if there's one
  if (error) {
    return (
      <div
        className={`flex items-center text-nord11 bg-nord11/10 px-3 py-2 rounded-md ${className}`}
      >
        <FiAlertCircle className="mr-2" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  // Display based on style preference
  if (displayStyle === "badge") {
    return <div className={className}>{renderStatusBadge()}</div>;
  }

  if (displayStyle === "both") {
    return <div className={className}>{renderActionButtons()}</div>;
  }

  // Default: just the buttons
  return <div className={`${className} w-full`}>{renderActionButtons()}</div>;
};

export default EventRSVP;
