import React, { useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import {
  handleJoinRequest,
  EventUser,
} from "../../features/events/eventsSlice";
import { FiCheck, FiX, FiInfo } from "react-icons/fi";

interface JoinRequestsManagerProps {
  eventId: string;
  requests: EventUser[];
  onSuccess?: () => void;
}

const JoinRequestsManager: React.FC<JoinRequestsManagerProps> = ({
  eventId,
  requests,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <p className="text-center text-nord3 py-4">
            No pending join requests for this event.
          </p>
        </div>
      </div>
    );
  }

  const handleRequest = async (
    userId: string,
    status: "accepted" | "declined"
  ) => {
    setLoadingStates((prev) => ({ ...prev, [userId]: true }));
    setError(null);

    try {
      await dispatch(
        handleJoinRequest({
          eventId,
          userId,
          status,
        })
      ).unwrap();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to process request");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        {requests.length > 0 && (
          <div className="mb-4 inline-flex items-center bg-nord9/10 text-nord9 text-xs font-medium px-2.5 py-1 rounded-full">
            {requests.length} pending request{requests.length !== 1 ? "s" : ""}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-nord11/10 text-nord11 rounded-lg flex items-center">
            <FiInfo className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="p-4 bg-nord6/50 rounded-lg border border-nord5 flex flex-col sm:flex-row items-start sm:items-center justify-between"
            >
              <div className="flex items-center mb-3 sm:mb-0">
                <div className="w-10 h-10 bg-nord9 rounded-full flex items-center justify-center text-white overflow-hidden mr-3 flex-shrink-0">
                  {request.profileImage ? (
                    <img
                      src={
                        request.profileImage
                          ? `${import.meta.env.VITE_API_URL || "/api"}/${
                              request.profileImage
                            }`
                          : undefined
                      }
                      alt={request.name || request.email}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {(request.name || request.email).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="max-w-[160px] sm:max-w-[200px]">
                  <p className="font-medium text-nord1 line-clamp-1">
                    {request.name}
                  </p>
                  <p className="text-sm text-nord3 line-clamp-1">
                    {request.email}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
                <button
                  type="button"
                  className="flex-1 sm:flex-initial px-3 py-1.5 bg-nord14 hover:bg-nord14/90 text-white rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
                  onClick={() => handleRequest(request._id, "accepted")}
                  disabled={loadingStates[request._id]}
                >
                  {loadingStates[request._id] ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FiCheck className="mr-1.5" />
                      Approve
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="flex-1 sm:flex-initial px-3 py-1.5 border border-nord11 text-nord11 hover:bg-nord11/10 rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
                  onClick={() => handleRequest(request._id, "declined")}
                  disabled={loadingStates[request._id]}
                >
                  <FiX className="mr-1.5" />
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JoinRequestsManager;
