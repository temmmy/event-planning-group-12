import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../../features/events/eventsSlice";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiImage,
  FiX,
  FiPlus,
  FiCheck,
} from "react-icons/fi";
import { RiGlobalLine, RiLockLine } from "react-icons/ri";
import { MdOutlineColorLens } from "react-icons/md";

// Color palette for event backgrounds - using Nord colors
const colorPalette = [
  "#88c0d0", // Nord8 (light blue)
  "#8fbcbb", // Nord7 (teal)
  "#a3be8c", // Nord14 (green)
  "#b48ead", // Nord15 (purple)
  "#ebcb8b", // Nord13 (yellow)
  "#d08770", // Nord12 (orange)
  "#bf616a", // Nord11 (red)
  "#5e81ac", // Nord10 (blue)
  "#eceff4", // Nord6 (white)
];

interface EventFormProps {
  event?: Event;
  isSubmitting?: boolean;
  onSubmit: (eventData: FormData) => void;
  onCancel?: () => void;
  error?: string | null;
}

const EventForm: React.FC<EventFormProps> = ({
  event,
  isSubmitting = false,
  onSubmit,
  onCancel,
  error = null,
}) => {
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [date, setDate] = useState(
    event?.date ? new Date(event.date).toISOString().split("T")[0] : ""
  );
  const [time, setTime] = useState(event?.time || "");
  const [location, setLocation] = useState(event?.location || "");
  const [capacity, setCapacity] = useState(event?.capacity?.toString() || "");
  const [visibility, setVisibility] = useState<"public" | "private">(
    event?.visibility || "public"
  );
  const [backgroundColor, setBackgroundColor] = useState(
    event?.backgroundColor || colorPalette[0]
  );

  // Image handling
  const [imagePreview, setImagePreview] = useState<string | null>(
    event?.imageUrl || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    event?.coverImageUrl || null
  );
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  // Color picker state
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  // Refs for file inputs
  const eventImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  // Focus on title on first load
  useEffect(() => {
    const titleElement = document.getElementById("event-title");
    if (titleElement) {
      titleElement.focus();
    }
  }, []);

  // Handle event image change
  const handleEventImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cover image change
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);

      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove event image
  const removeEventImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (eventImageInputRef.current) {
      eventImageInputRef.current.value = "";
    }
  };

  // Remove cover image
  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!title.trim()) {
      alert("Please enter a title for the event");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a description for the event");
      return;
    }

    if (!date) {
      alert("Please select a date for the event");
      return;
    }

    if (!time) {
      alert("Please enter a time for the event");
      return;
    }

    if (!location.trim()) {
      alert("Please enter a location for the event");
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("location", location);
    formData.append("visibility", visibility);
    formData.append("backgroundColor", backgroundColor);

    if (capacity) {
      formData.append("capacity", capacity);
    }

    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (coverImageFile) {
      formData.append("coverImage", coverImageFile);
    }

    // Submit the form data
    onSubmit(formData);
  };

  // Cancel form
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Cover Image (Notion-like) */}
      <div
        className="w-full h-48 bg-cover bg-center relative transition-all duration-300 ease-in-out"
        style={{
          backgroundColor: backgroundColor,
          backgroundImage: coverImagePreview
            ? `url(${coverImagePreview})`
            : "none",
        }}
      >
        {/* Cover image actions */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {coverImagePreview && (
            <button
              onClick={removeCoverImage}
              className="bg-white p-2 rounded-md shadow-sm hover:bg-gray-100"
              title="Remove cover image"
            >
              <FiX className="text-nord3" />
            </button>
          )}

          <button
            onClick={() => coverImageInputRef.current?.click()}
            className="bg-white p-2 rounded-md shadow-sm hover:bg-gray-100"
            title={coverImagePreview ? "Change cover image" : "Add cover image"}
          >
            <FiImage className="text-nord3" />
          </button>

          <input
            type="file"
            ref={coverImageInputRef}
            onChange={handleCoverImageChange}
            className="hidden"
            accept="image/*"
          />

          {/* Color picker button */}
          <div className="relative">
            <button
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              className="bg-white p-2 rounded-md shadow-sm hover:bg-gray-100 flex items-center"
              title="Change background color"
              style={{
                borderLeft: `3px solid ${backgroundColor}`,
              }}
            >
              <MdOutlineColorLens className="text-nord3 mr-1" />
              <span className="text-xs text-nord3">Color</span>
            </button>

            {/* Color picker popover */}
            {isColorPickerOpen && (
              <div className="absolute right-0 bottom-12 bg-white rounded-lg shadow-lg p-3 z-10 border border-gray-200">
                <h4 className="text-xs font-medium text-nord3 mb-2">
                  Background Color
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setBackgroundColor(color);
                        setIsColorPickerOpen(false);
                      }}
                      className={`w-9 h-9 rounded-full cursor-pointer hover:opacity-80 transition-all transform hover:scale-110 ${
                        backgroundColor === color
                          ? "ring-2 ring-offset-2 ring-nord10"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {backgroundColor === color && (
                        <div className="flex items-center justify-center h-full">
                          <FiCheck className="text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto px-8 pb-16 -mt-8"
      >
        <div className="bg-white rounded-t-xl shadow-lg p-8">
          {/* Title - Notion-like large input */}
          <input
            id="event-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title..."
            className="w-full text-3xl md:text-4xl font-garamond font-semibold text-nord1 placeholder-gray-300 bg-transparent border-none focus:outline-none focus:ring-0"
            required
          />

          {/* Event icon/image upload */}
          <div className="mt-6 flex items-center">
            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Event icon"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => eventImageInputRef.current?.click()}
                    className="text-white p-1"
                  >
                    <FiImage size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={removeEventImage}
                    className="text-white p-1"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => eventImageInputRef.current?.click()}
                className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-nord9 transition-colors"
              >
                <FiPlus className="text-gray-400" size={24} />
              </button>
            )}
            <input
              type="file"
              ref={eventImageInputRef}
              onChange={handleEventImageChange}
              className="hidden"
              accept="image/*"
            />

            <p className="ml-4 text-sm text-gray-500">
              {imagePreview
                ? "Event icon - click to change"
                : "Add an event icon"}
            </p>
          </div>

          {/* Event details section */}
          <div className="mt-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Left column: Date & Time */}
              <div className="flex-1 space-y-6">
                {/* Date picker */}
                <div className="flex items-start">
                  <div className="mt-1 mr-4 text-nord9">
                    <FiCalendar size={20} />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="event-date"
                      className="block text-sm font-medium text-nord3 mb-1"
                    >
                      Date
                    </label>
                    <input
                      id="event-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-nord10 text-nord1"
                      required
                    />
                  </div>
                </div>

                {/* Time picker */}
                <div className="flex items-start">
                  <div className="mt-1 mr-4 text-nord9">
                    <FiClock size={20} />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="event-time"
                      className="block text-sm font-medium text-nord3 mb-1"
                    >
                      Time
                    </label>
                    <input
                      id="event-time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-nord10 text-nord1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Right column: Location & Capacity */}
              <div className="flex-1 space-y-6">
                {/* Location */}
                <div className="flex items-start">
                  <div className="mt-1 mr-4 text-nord9">
                    <FiMapPin size={20} />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="event-location"
                      className="block text-sm font-medium text-nord3 mb-1"
                    >
                      Location
                    </label>
                    <input
                      id="event-location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter location"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-nord10 text-nord1 placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div className="flex items-start">
                  <div className="mt-1 mr-4 text-nord9">
                    <FiUsers size={20} />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="event-capacity"
                      className="block text-sm font-medium text-nord3 mb-1"
                    >
                      Capacity (optional)
                    </label>
                    <input
                      id="event-capacity"
                      type="number"
                      min="1"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="Maximum number of attendees"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-nord10 text-nord1 placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visibility toggle */}
            <div className="flex items-start mt-6">
              <div className="mt-1 mr-4 text-nord9">
                {visibility === "public" ? (
                  <RiGlobalLine size={20} />
                ) : (
                  <RiLockLine size={20} />
                )}
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-nord3 mb-2">
                  Visibility
                </label>

                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={visibility === "public"}
                      onChange={() => setVisibility("public")}
                      className="form-radio h-4 w-4 text-nord10 focus:ring-nord10"
                    />
                    <span className="ml-2 text-sm text-nord2">Public</span>
                  </label>

                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={visibility === "private"}
                      onChange={() => setVisibility("private")}
                      className="form-radio h-4 w-4 text-nord10 focus:ring-nord10"
                    />
                    <span className="ml-2 text-sm text-nord2">Private</span>
                  </label>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {visibility === "public"
                    ? "Anyone with the link can view this event"
                    : "Only invited people can view this event"}
                </p>
              </div>
            </div>

            {/* Description - Notion-like textarea */}
            <div className="mt-8">
              <label
                htmlFor="event-description"
                className="block text-sm font-medium text-nord3 mb-2"
              >
                Description
              </label>
              <textarea
                id="event-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a description for your event..."
                className="w-full h-48 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nord10 focus:border-nord10 text-nord1 placeholder-gray-400"
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {/* Form actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-white border border-gray-300 text-nord3 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nord8"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-nord10 text-white rounded-lg hover:bg-nord9 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nord10 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
                    Saving...
                  </>
                ) : (
                  <>{event ? "Update Event" : "Create Event"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
