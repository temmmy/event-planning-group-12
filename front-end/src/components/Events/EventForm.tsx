import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../../features/events/eventsSlice"; // Assuming this path is correct
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiImage,
  FiX,
  FiPlus,
  FiCheck,
  FiArrowLeft,
  FiArrowRight,
  FiAlertCircle, // For error icons
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

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

interface EventFormProps {
  event?: Event;
  isSubmitting?: boolean;
  onSubmit: (eventData: FormData) => void;
  onCancel?: () => void;
  error?: string | null; 
}

interface FormErrors {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  capacity?: string;
  imageFile?: string;
  coverImageFile?: string;
  [key: string]: string | undefined; 
}

const generateInputId = (name: string) => `event-${name}`;

const EventForm: React.FC<EventFormProps> = ({
  event,
  isSubmitting = false,
  onSubmit,
  onCancel,
  error: backendError = null, 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    date: event?.date ? new Date(event.date).toISOString().split("T")[0] : "",
    time: event?.time || "",
    location: event?.location || "",
    capacity: event?.capacity?.toString() || "",
    visibility: event?.visibility || "public" as "public" | "private",
    backgroundColor: event?.backgroundColor || colorPalette[0],
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Image handling
  const [imagePreview, setImagePreview] = useState<string | null>(event?.imageUrl || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(event?.coverImageUrl || null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const eventImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null); 

  const navigate = useNavigate();

  // ---- FORM STEPS DEFINITION ----
  const formSteps = [
    {
      title: "Event Basics",
      fields: ["title", "description"],
      refToFocus: generateInputId("title"),
    },
    {
      title: "Date & Time",
      fields: ["date", "time"],
      refToFocus: generateInputId("date"),
    },
    {
      title: "Location & Capacity",
      fields: ["location", "capacity"],
      refToFocus: generateInputId("location"),
    },
    {
      title: "Visuals & Visibility",
      fields: ["imageFile", "coverImageFile", "backgroundColor", "visibility"], 
      refToFocus: "event-image-upload-button", 
    },
  ];

  // ---- INPUT CHANGE HANDLER ----
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRadioChange = (name: string, value: "public" | "private") => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // ---- IMAGE VALIDATION ----
  const validateImage = (file: File | null, fieldName: keyof FormErrors): string | undefined => {
      if (!file) return undefined; 
  
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return `Invalid file type. Please use ${ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1]).join(', ')}.`;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return `File is too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB.`;
      }
      return undefined;
    };


  // ---- IMAGE HANDLERS ----
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImageFileState: React.Dispatch<React.SetStateAction<File | null>>,
    setImagePreviewState: React.Dispatch<React.SetStateAction<string | null>>,
    fieldName: keyof FormErrors
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageError = validateImage(file, fieldName);
      if (imageError) {
        setFormErrors(prev => ({ ...prev, [fieldName]: imageError }));
        setImageFileState(null);
        setImagePreviewState(event?.imageUrl || null); 
        if (e.target) e.target.value = ""; 
        return;
      }

      setFormErrors(prev => ({ ...prev, [fieldName]: undefined }));
      setImageFileState(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreviewState(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEventImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e, setImageFile, setImagePreview, "imageFile");
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e, setCoverImageFile, setCoverImagePreview, "coverImageFile");
  };

  const removeImage = (
    setImageFileState: React.Dispatch<React.SetStateAction<File | null>>,
    setImagePreviewState: React.Dispatch<React.SetStateAction<string | null>>,
    inputRef: React.RefObject<HTMLInputElement | null>,
    originalImageUrl?: string | null
  ) => {
    setImageFileState(null);
    setImagePreviewState(originalImageUrl || null); 
    if (inputRef.current) inputRef.current.value = "";
    setFormErrors(prev => ({...prev, imageFile: undefined, coverImageFile: undefined})); 
  };


  // ---- VALIDATION LOGIC ----
  const validateStep = (stepIndex: number): boolean => {
    const currentStepFields = formSteps[stepIndex -1].fields;
    const errors: FormErrors = {};
    let isValid = true;

    currentStepFields.forEach((field) => {
      if (field === "imageFile" || field === "coverImageFile") { 
        const file = field === "imageFile" ? imageFile : coverImageFile;
        
        if (field === "imageFile" && !file && !event?.imageUrl) {
          errors[field] = "Event icon is required.";
          isValid = false;
        }
        const imageError = validateImage(file, field as keyof FormErrors);
        if (imageError) {
            errors[field] = imageError;
            isValid = false;
        }
      } else if (formData[field as keyof typeof formData] !== undefined) {
         const value = formData[field as keyof typeof formData];
         if (typeof value === 'string' && !value.trim() && field !== 'capacity') { // Capacity can be empty
            errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
            isValid = false;
         }
      }
    });

    
    if (currentStepFields.includes("date") && !formData.date) {
        errors.date = "Date is required.";
        isValid = false;
    }
    if (currentStepFields.includes("time") && !formData.time) {
        errors.time = "Time is required.";
        isValid = false;
    }
    if (currentStepFields.includes("capacity") && formData.capacity && parseInt(formData.capacity) < 1) {
        errors.capacity = "Capacity must be a positive number.";
        isValid = false;
    }


    setFormErrors(errors);
    if (!isValid) {
        const firstErrorField = currentStepFields.find(f => errors[f]);
        if (firstErrorField) {
            const el = document.getElementById(generateInputId(firstErrorField)) || document.getElementById(firstErrorField); // For custom IDs like image buttons
            el?.focus();
        }
    }
    return isValid;
  };

  // ---- STEP NAVIGATION ----
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < formSteps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleFormSubmit();
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  
  useEffect(() => {
    if (currentStep > 0 && currentStep <= formSteps.length) {
        const stepConfig = formSteps[currentStep - 1];
        if (stepConfig.refToFocus) {
            const elementToFocus = document.getElementById(stepConfig.refToFocus);
            elementToFocus?.focus();
        } else if (stepContainerRef.current) { // Fallback to step container
            const firstFocusable = stepContainerRef.current.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) as HTMLElement;
            firstFocusable?.focus();
        }
    }
  }, [currentStep]);


  // ---- FORM SUBMISSION ----
  const handleFormSubmit = () => {
    
    if (isSubmitting) return;

    const dataToSubmit = new FormData();
    dataToSubmit.append("title", formData.title);
    dataToSubmit.append("description", formData.description);
    dataToSubmit.append("date", formData.date);
    dataToSubmit.append("time", formData.time);
    dataToSubmit.append("location", formData.location);
    dataToSubmit.append("visibility", formData.visibility);
    dataToSubmit.append("backgroundColor", formData.backgroundColor);

    if (formData.capacity) {
      dataToSubmit.append("capacity", formData.capacity);
    }
    if (imageFile) {
      dataToSubmit.append("image", imageFile);
    } else if (event?.imageUrl && !imagePreview) { 
      dataToSubmit.append("removeImage", "true");
    }

    if (coverImageFile) {
      dataToSubmit.append("coverImage", coverImageFile);
    } else if (event?.coverImageUrl && !coverImagePreview) { 
      dataToSubmit.append("removeCoverImage", "true");
    }

    onSubmit(dataToSubmit);
  };

  const handleCancelForm = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  // ---- Helper to render error messages ----
  const renderError = (fieldName: keyof FormErrors) => {
    if (formErrors[fieldName]) {
      return (
        <p id={`${generateInputId(String(fieldName))}-error`} className="mt-1 text-sm text-red-600 flex items-center">
          <FiAlertCircle className="mr-1" />
          {formErrors[fieldName]}
        </p>
      );
    }
    return null;
  };


  return (
    <div className="bg-white min-h-screen">
      {/* Cover Image Section */}
      <div
        className="w-full h-48 bg-cover bg-center relative transition-all duration-300 ease-in-out"
        style={{
          backgroundColor: formData.backgroundColor,
          backgroundImage: coverImagePreview ? `url(${coverImagePreview})` : "none",
        }}
      >
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {coverImagePreview && (
            <button
              type="button"
              onClick={() => removeImage(setCoverImageFile, setCoverImagePreview, coverImageInputRef, event?.coverImageUrl)}
              className="bg-white p-2 rounded-md shadow-sm hover:bg-gray-100"
              title="Remove cover image"
              aria-label="Remove cover image"
            >
              <FiX className="text-nord3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => coverImageInputRef.current?.click()}
            className="bg-white p-2 rounded-md shadow-sm hover:bg-gray-100"
            title={coverImagePreview ? "Change cover image" : "Add cover image"}
            aria-label={coverImagePreview ? "Change cover image" : "Add cover image"}
            id="cover-image-upload-button"
          >
            <FiImage className="text-nord3" />
          </button>
          <input
            type="file"
            ref={coverImageInputRef}
            onChange={handleCoverImageChange}
            className="hidden"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            aria-describedby={formErrors.coverImageFile ? `${generateInputId("coverImageFile")}-error` : undefined}
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              className="bg-white p-2 rounded-md shadow-sm hover:bg-gray-100 flex items-center"
              title="Change background color"
              aria-label="Change background color"
              aria-haspopup="true"
              aria-expanded={isColorPickerOpen}
              style={{ borderLeft: `3px solid ${formData.backgroundColor}` }}
            >
              <MdOutlineColorLens className="text-nord3 mr-1" />
              <span className="text-xs text-nord3">Color</span>
            </button>
            {isColorPickerOpen && (
              <div
                className="absolute right-0 bottom-12 bg-white rounded-lg shadow-lg p-3 z-10 border border-gray-200"
                role="dialog"
                aria-label="Background color picker"
              >
                <h4 className="text-xs font-medium text-nord3 mb-2">Background Color</h4>
                <div className="grid grid-cols-4 gap-3">
                  {colorPalette.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, backgroundColor: color }));
                        setIsColorPickerOpen(false);
                      }}
                      className={`w-9 h-9 rounded-full cursor-pointer hover:opacity-80 transition-all transform hover:scale-110 ${
                        formData.backgroundColor === color ? "ring-2 ring-offset-2 ring-nord10" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                      aria-label={`Set background color to ${color}`}
                      aria-pressed={formData.backgroundColor === color}
                    >
                      {formData.backgroundColor === color && (
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
        {formErrors.coverImageFile && ( 
             <div className="absolute top-4 left-1/2 -translate-x-1/2 p-2 bg-red-50 text-red-700 rounded-md shadow-md text-sm">
                {renderError("coverImageFile")}
            </div>
        )}
      </div>


      <div className="max-w-4xl mx-auto px-8 pb-16 -mt-8">
        {/* Progress Bar */}
        <div className="mb-6">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-nord3">Step {currentStep} of {formSteps.length}: {formSteps[currentStep-1].title}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-nord10 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(currentStep / formSteps.length) * 100}%` }}
                ></div>
            </div>
        </div>

        <div ref={stepContainerRef} className="bg-white rounded-xl shadow-lg p-8">
          {/* Event Basics */}
          {currentStep === 1 && (
            <section aria-labelledby="step1-heading">
              <h2 id="step1-heading" className="sr-only">Step 1: Event Basics</h2>
              <div>
                <label htmlFor={generateInputId("title")} className="sr-only">Event Title</label>
                <input
                  id={generateInputId("title")}
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Event title..."
                  className={`w-full text-3xl md:text-4xl font-garamond font-semibold placeholder-gray-300 bg-transparent border-none focus:outline-none focus:ring-0 ${formErrors.title ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                  aria-required="true"
                  aria-invalid={!!formErrors.title}
                  aria-describedby={formErrors.title ? `${generateInputId("title")}-error` : undefined}
                />
                {renderError("title")}
              </div>

              <div className="mt-8">
                <label htmlFor={generateInputId("description")} className="block text-sm font-medium text-nord3 mb-2">
                  Description
                </label>
                <textarea
                  id={generateInputId("description")}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Write a description for your event..."
                  className={`w-full h-48 p-4 border rounded-md focus:outline-none focus:ring-2 focus:border-nord10 placeholder-gray-400 ${formErrors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-nord10'}`}
                  required
                  aria-required="true"
                  aria-invalid={!!formErrors.description}
                  aria-describedby={formErrors.description ? `${generateInputId("description")}-error` : undefined}
                />
                {renderError("description")}
              </div>
            </section>
          )}

          {/* Date & Time */}
          {currentStep === 2 && (
            <section aria-labelledby="step2-heading" className="space-y-6">
              <h2 id="step2-heading" className="sr-only">Step 2: Date and Time</h2>
              <div className="flex items-start">
                <div className="mt-1 mr-4 text-nord9 pt-7"><FiCalendar size={20} aria-hidden="true" /></div>
                <div className="flex-1">
                  <label htmlFor={generateInputId("date")} className="block text-sm font-medium text-nord3 mb-1">Date</label>
                  <input
                    id={generateInputId("date")}
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${formErrors.date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-nord10 focus:border-nord10'}`}
                    required
                    aria-required="true"
                    aria-invalid={!!formErrors.date}
                    aria-describedby={formErrors.date ? `${generateInputId("date")}-error` : undefined}
                  />
                  {renderError("date")}
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-4 text-nord9 pt-7"><FiClock size={20} aria-hidden="true" /></div>
                <div className="flex-1">
                  <label htmlFor={generateInputId("time")} className="block text-sm font-medium text-nord3 mb-1">Time</label>
                  <input
                    id={generateInputId("time")}
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${formErrors.time ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-nord10 focus:border-nord10'}`}
                    required
                    aria-required="true"
                    aria-invalid={!!formErrors.time}
                    aria-describedby={formErrors.time ? `${generateInputId("time")}-error` : undefined}
                  />
                  {renderError("time")}
                </div>
              </div>
            </section>
          )}

          {/* Location & Capacity */}
          {currentStep === 3 && (
            <section aria-labelledby="step3-heading" className="space-y-6">
                <h2 id="step3-heading" className="sr-only">Step 3: Location and Capacity</h2>
                <div className="flex items-start">
                    <div className="mt-1 mr-4 text-nord9 pt-7"><FiMapPin size={20} aria-hidden="true" /></div>
                    <div className="flex-1">
                        <label htmlFor={generateInputId("location")} className="block text-sm font-medium text-nord3 mb-1">Location</label>
                        <input
                            id={generateInputId("location")}
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Enter location"
                            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${formErrors.location ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-nord10 focus:border-nord10'}`}
                            required
                            aria-required="true"
                            aria-invalid={!!formErrors.location}
                            aria-describedby={formErrors.location ? `${generateInputId("location")}-error` : undefined}
                        />
                        {renderError("location")}
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="mt-1 mr-4 text-nord9 pt-7"><FiUsers size={20} aria-hidden="true" /></div>
                    <div className="flex-1">
                        <label htmlFor={generateInputId("capacity")} className="block text-sm font-medium text-nord3 mb-1">Capacity (optional)</label>
                        <input
                            id={generateInputId("capacity")}
                            type="number"
                            name="capacity"
                            min="1"
                            value={formData.capacity}
                            onChange={handleChange}
                            placeholder="Max attendees"
                            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${formErrors.capacity ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-nord10 focus:border-nord10'}`}
                            aria-invalid={!!formErrors.capacity}
                            aria-describedby={formErrors.capacity ? `${generateInputId("capacity")}-error` : undefined}
                        />
                        {renderError("capacity")}
                    </div>
                </div>
            </section>
          )}

          {/* Visuals & Visibility */}
          {currentStep === 4 && (
            <section aria-labelledby="step4-heading" className="space-y-8">
                <h2 id="step4-heading" className="sr-only">Step 4: Visuals and Visibility</h2>
                 {/* Event icon/image upload */}
                <div>
                    <p className="block text-sm font-medium text-nord3 mb-2">Event Icon (Optional)</p>
                    <div className="flex items-center">
                        {imagePreview ? (
                        <div className="relative group">
                            <img src={imagePreview} alt="Event icon preview" className="w-16 h-16 object-cover rounded-lg"/>
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button type="button" onClick={() => eventImageInputRef.current?.click()} className="text-white p-1" aria-label="Change event icon">
                                <FiImage size={16} />
                            </button>
                            <button type="button" onClick={() => removeImage(setImageFile, setImagePreview, eventImageInputRef, event?.imageUrl)} className="text-white p-1" aria-label="Remove event icon">
                                <FiX size={16} />
                            </button>
                            </div>
                        </div>
                        ) : (
                        <button
                            type="button"
                            id="event-image-upload-button"
                            onClick={() => eventImageInputRef.current?.click()}
                            className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-nord9 transition-colors"
                            aria-label="Add an event icon"
                        >
                            <FiPlus className="text-gray-400" size={24} />
                        </button>
                        )}
                        <input
                            type="file"
                            ref={eventImageInputRef}
                            onChange={handleEventImageChange}
                            className="hidden"
                            accept={ALLOWED_IMAGE_TYPES.join(",")}
                            aria-describedby={formErrors.imageFile ? `${generateInputId("imageFile")}-error` : undefined}
                        />
                        <p className="ml-4 text-sm text-gray-500">
                            {imagePreview ? "Click image to change/remove" : "Add an event icon (Max 2MB, JPG/PNG/GIF)"}
                        </p>
                    </div>
                    {renderError("imageFile")}
                </div>


                {/* Visibility toggle */}
                <div className="flex items-start">
                    <div className="mt-1 mr-4 text-nord9 pt-1">
                        {formData.visibility === "public" ? <RiGlobalLine size={20} aria-hidden="true" /> : <RiLockLine size={20} aria-hidden="true" />}
                    </div>
                    <div className="flex-1">
                        <fieldset>
                            <legend className="block text-sm font-medium text-nord3 mb-2">Visibility</legend>
                            <div className="flex items-center space-x-4">
                                <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="public"
                                    checked={formData.visibility === "public"}
                                    onChange={() => handleRadioChange("visibility", "public")}
                                    className="form-radio h-4 w-4 text-nord10 focus:ring-nord10"
                                />
                                <span className="ml-2 text-sm text-nord2">Public</span>
                                </label>
                                <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="private"
                                    checked={formData.visibility === "private"}
                                    onChange={() => handleRadioChange("visibility", "private")}
                                    className="form-radio h-4 w-4 text-nord10 focus:ring-nord10"
                                />
                                <span className="ml-2 text-sm text-nord2">Private</span>
                                </label>
                            </div>
                        </fieldset>
                        <p className="text-xs text-gray-500 mt-1">
                        {formData.visibility === "public"
                            ? "Anyone can view this event."
                            : "Only invited people can view this event."}
                        </p>
                    </div>
                </div>
            </section>
          )}

          {/* Backend Error message display */}
          {backendError && (
            <div role="alert" aria-live="polite" className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center">
              <FiAlertCircle className="mr-2 flex-shrink-0" size={20}/>
              {backendError}
            </div>
          )}

          {/* Form Navigation / Submission Buttons */}
          <div className="mt-10 flex justify-between items-center">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3 bg-white border border-gray-300 text-nord3 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nord8 flex items-center"
                  disabled={isSubmitting}
                >
                  <FiArrowLeft className="mr-2" /> Previous
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
                <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-6 py-3 bg-transparent text-nord3 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-nord8"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="button" 
                    onClick={handleNextStep} 
                    className="px-6 py-3 bg-nord10 text-white rounded-lg hover:bg-nord9 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nord10 flex items-center min-w-[120px] justify-center"
                    disabled={isSubmitting}
                    aria-live="polite" 
                >
                {isSubmitting ? (
                    <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                    </>
                ) : currentStep === formSteps.length ? (
                    event ? "Update Event" : "Create Event"
                ) : (
                    <>
                    Next <FiArrowRight className="ml-2" />
                    </>
                )}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventForm;