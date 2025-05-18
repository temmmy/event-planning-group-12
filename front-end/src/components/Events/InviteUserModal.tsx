import React, { useState } from "react";
import { FiX, FiMail, FiSend, FiUserPlus } from "react-icons/fi";
import { useAppDispatch } from "../../store/hooks";
import { inviteToEvent } from "../../features/events/eventsSlice";

interface InviteUserModalProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  eventId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();

  // State for the form
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Handle invitation submit
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventId || !inviteEmails.trim()) return;

    try {
      setInviteLoading(true);
      setInviteError(null);
      setInviteSuccess(null);

      // Split emails by comma, newline, or space and trim whitespace
      const emails = inviteEmails
        .split(/[,\s]+/)
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      if (emails.length === 0) {
        setInviteError("Please enter at least one valid email address");
        setInviteLoading(false);
        return;
      }

      await dispatch(inviteToEvent({ id: eventId, emails })).unwrap();
      setInviteSuccess(
        `Successfully sent invitations to ${emails.length} user(s)`
      );
      setInviteEmails("");

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      if (err instanceof Error) {
        setInviteError(err.message);
      } else {
        setInviteError("An error occurred while sending invitations");
      }
    } finally {
      setInviteLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-nord1">Invite People</h3>
          <button onClick={onClose} className="text-nord3 hover:text-nord0">
            <FiX size={24} />
          </button>
        </div>

        {inviteError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-100">
            {inviteError}
          </div>
        )}

        {inviteSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-100">
            {inviteSuccess}
          </div>
        )}

        <form onSubmit={handleInviteSubmit}>
          <div className="mb-4">
            <label
              htmlFor="invite-emails"
              className="block text-sm font-medium text-nord3 mb-1"
            >
              Email Addresses
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="invite-emails"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder="Enter email addresses (separated by commas or new lines)"
                className="block w-full pl-10 pr-4 py-2.5 text-nord1 bg-white border border-nord5 rounded-lg focus:ring-2 focus:ring-nord10 focus:border-nord10 sm:text-sm transition-colors"
                rows={3}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Enter email addresses of people to invite. They'll receive an
              email with instructions to join.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-nord3 rounded-lg hover:bg-gray-50"
              disabled={inviteLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-nord10 text-white rounded-lg hover:bg-nord9 flex items-center"
              disabled={inviteLoading}
            >
              {inviteLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Sending...
                </>
              ) : (
                <>
                  <FiSend className="mr-2" />
                  Send Invitations
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;

// Exportable button to trigger the modal
export const InviteButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => {
  return (
    <button
      className="text-nord10 hover:text-nord9 font-medium flex items-center"
      onClick={onClick}
    >
      <FiUserPlus className="mr-2" />
      Invite people
    </button>
  );
};
