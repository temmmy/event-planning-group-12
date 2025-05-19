// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEventDiscussion,
  addMessage,
  deleteMessage,
  selectDiscussion,
  selectDiscussionLoading,
  selectDiscussionError,
  Message,
} from "../../features/discussions/discussionSlice";
import { selectUser } from "../../features/auth/authSlice";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import InfoIcon from "@mui/icons-material/Info";
import { format } from "date-fns";
import { AppDispatch } from "../../store";

interface DiscussionBoardProps {
  eventId: string;
}

const DiscussionBoard: React.FC<DiscussionBoardProps> = ({ eventId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const discussion = useSelector(selectDiscussion);
  const loading = useSelector(selectDiscussionLoading);
  const error = useSelector(selectDiscussionError);
  const currentUser = useSelector(selectUser);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventDiscussion(eventId));
    }
  }, [dispatch, eventId]);

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await dispatch(addMessage({ eventId, content: message })).unwrap();
      setMessage("");
    } catch (error) {
      console.error("Failed to add message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await dispatch(deleteMessage({ eventId, messageId })).unwrap();
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const canDeleteMessage = (message: Message) => {
    return (
      currentUser &&
      (currentUser.id === message.author._id || currentUser.role === "admin")
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
  };

  if (loading === "pending" && !discussion) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin w-8 h-8 border-4 border-nord9 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Check specifically for 403 error message (authorization error)
  if (error?.includes("organizer or an attendee")) {
    return (
      <div className="mt-2 p-4 bg-nord12/10 text-nord12 rounded-lg flex items-center">
        <InfoIcon className="mr-2" />
        <p>
          You need to accept your invitation to this event to join the
          discussion.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-2 p-4 bg-nord11/10 text-nord11 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="max-h-96 overflow-y-auto mb-4 pr-1">
          {discussion?.messages && discussion.messages.length > 0 ? (
            <div className="space-y-3">
              {discussion.messages.map((msg) => (
                <div
                  key={msg._id}
                  className="p-4 bg-nord6/50 rounded-lg border border-nord5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <Avatar
                        src={
                          msg.author.profileImage
                            ? `${import.meta.env.VITE_API_URL || "/api"}/${
                                msg.author.profileImage
                              }`
                            : undefined
                        }
                        alt={msg.author.username || msg.author.email}
                        sx={{ bgcolor: "#5E81AC" }}
                        className="mr-3"
                      >
                        {msg.author.username?.charAt(0) ||
                          msg.author.email.charAt(0)}
                      </Avatar>
                      <div>
                        <p className="font-medium text-nord1">
                          {msg.author.username || msg.author.email}
                        </p>
                        <p className="text-xs text-nord3">
                          {formatTimestamp(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                    {canDeleteMessage(msg) && (
                      <IconButton
                        onClick={() => handleDeleteMessage(msg._id)}
                        aria-label="delete"
                        size="small"
                        className="text-nord3 hover:text-nord11"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </div>
                  <div className="mt-1 pl-12">
                    <p className="text-nord1 text-left whitespace-pre-line">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-nord3">
              No messages yet. Start the conversation!
            </div>
          )}
        </div>

        {currentUser && (
          <form onSubmit={handleSubmitMessage} className="mt-4">
            <div className="relative">
              <textarea
                className="w-full px-3 py-2 border border-nord5 rounded-lg focus:outline-none focus:ring-2 focus:ring-nord9/20 focus:border-nord9 transition-colors resize-none text-nord1 bg-white placeholder-nord3"
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                disabled={isSubmitting}
              ></textarea>
              <button
                type="submit"
                disabled={!message.trim() || isSubmitting}
                className="mt-2 px-4 py-2 bg-nord9 hover:bg-nord10 text-white rounded-md transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <SendIcon className="mr-1" fontSize="small" />
                )}
                Send
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DiscussionBoard;
