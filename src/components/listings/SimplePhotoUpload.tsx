import { X, Camera, Info, Home, HardHat, MapPin } from "lucide-react";
import { useState } from "react";
import { PhotoLabel, UploadedPhoto, PropertyFlowType } from "./types";


interface SimplePhotoUploadProps {
    photos: UploadedPhoto[];
    onPhotoUpload: (files: FileList | null) => void;
    onPhotoLabelChange: (photoId: string, label: PhotoLabel, customLabel?: string) => void;
    onPhotoRemove: (id: string) => void;
    error?: string;
    propertyType: PropertyFlowType;
    onPropertyTypeChange: (type: PropertyFlowType) => void;
}


export function SimplePhotoUpload({
    photos,
    onPhotoUpload,
    onPhotoLabelChange,
    onPhotoRemove,
    error,
    propertyType,
    onPropertyTypeChange
}: SimplePhotoUploadProps) {
    const [customLabels, setCustomLabels] = useState<Record<string, string>>({});


    const photoLabels: PhotoLabel[] = [
        "Bedroom",
        "Master Bedroom",
        "Bathroom",
        "Living Room",
        "Kitchen",
        "Dining Room",
        "Exterior Front",
        "Exterior Back",
        "Exterior Side",
        "Street View",
        "Estate/Development View",
        "Neighborhood",
        "Access Road",
        "Compound Entrance",
        "Swimming Pool",
        "Generator",
        "Gym",
        "Parking",
        "Garden",
        "Balcony",
        "Construction Progress",
        "Architectural Rendering",
        "Floor Plan",
        "Site Plan",
        "Land/Plot",
        "Other"
    ];


    const handleLabelChange = (photoId: string, label: PhotoLabel) => {
        onPhotoLabelChange(photoId, label);
        // Clear custom label if not "Other"
        if (label !== "Other") {
            setCustomLabels(prev => {
                const updated = { ...prev };
                delete updated[photoId];
                return updated;
            });
        }
    };


    const handleCustomLabelChange = (photoId: string, customLabel: string) => {
        setCustomLabels(prev => ({ ...prev, [photoId]: customLabel }));
        onPhotoLabelChange(photoId, "Other", customLabel);
    };


    return (
        <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
                2. Upload Property Photos <span className="text-red-500">*</span>
            </label>


            {/* Property Type Selector */}
            <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-3">What type of property is this?</p>
                <div className="grid grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => onPropertyTypeChange("completed")}
                        className={`p-3 rounded-lg border-2 transition-all ${propertyType === "completed"
                            ? "border-[#4ea8a1] bg-[#4ea8a1]/10"
                            : "border-gray-300 hover:border-gray-400"
                            }`}
                    >
                        <Home className={`w-6 h-6 mx-auto mb-1 ${propertyType === "completed" ? "text-[#4ea8a1]" : "text-gray-600"}`} />
                        <p className={`text-sm font-medium ${propertyType === "completed" ? "text-[#4ea8a1]" : "text-gray-900"}`}>
                            Completed Property
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Ready to move in</p>
                    </button>


                    <button
                        type="button"
                        onClick={() => onPropertyTypeChange("off-plan")}
                        className={`p-3 rounded-lg border-2 transition-all ${propertyType === "off-plan"
                            ? "border-[#f59e0b] bg-[#f59e0b]/10"
                            : "border-gray-300 hover:border-gray-400"
                            }`}
                    >
                        <HardHat className={`w-6 h-6 mx-auto mb-1 ${propertyType === "off-plan" ? "text-[#f59e0b]" : "text-gray-600"}`} />
                        <p className={`text-sm font-medium ${propertyType === "off-plan" ? "text-[#f59e0b]" : "text-gray-900"}`}>
                            Off-Plan
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Under construction</p>
                    </button>


                    <button
                        type="button"
                        onClick={() => onPropertyTypeChange("land-only")}
                        className={`p-3 rounded-lg border-2 transition-all ${propertyType === "land-only"
                            ? "border-green-600 bg-green-50"
                            : "border-gray-300 hover:border-gray-400"
                            }`}
                    >
                        <MapPin className={`w-6 h-6 mx-auto mb-1 ${propertyType === "land-only" ? "text-green-600" : "text-gray-600"}`} />
                        <p className={`text-sm font-medium ${propertyType === "land-only" ? "text-green-600" : "text-gray-900"}`}>
                            Land Only
                        </p>
                        <p className="text-xs text-gray-600 mt-1">No building</p>
                    </button>
                </div>
            </div>


            {/* Contextual Upload Guidance */}
            {propertyType === "completed" && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium text-blue-900 mb-1">📸 What to upload for completed properties:</p>
                        <ul className="text-blue-800 space-y-0.5 ml-4 list-disc">
                            <li><strong>Exterior:</strong> Front, back, side views (min 2)</li>
                            <li><strong>Interior:</strong> All bedrooms, bathrooms, living areas (min 4)</li>
                            <li><strong>Location Context:</strong> Estate/development view, street, neighborhood, access road</li>
                            <li><strong>Amenities:</strong> Pool, gym, parking, generator (if available)</li>
                        </ul>
                    </div>
                </div>
            )}


            {propertyType === "off-plan" && (
                <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3 flex gap-3">
                    <HardHat className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium text-orange-900 mb-1">🏗️ What to upload for off-plan properties:</p>
                        <ul className="text-orange-800 space-y-0.5 ml-4 list-disc">
                            <li><strong>Construction Progress:</strong> Current state of building (foundation, structure, finishing)</li>
                            <li><strong>Architectural Renderings:</strong> What it will look like when completed</li>
                            <li><strong>Floor Plans:</strong> Layout drawings showing room sizes</li>
                            <li><strong>Site Photos:</strong> Land/plot where construction is happening</li>
                        </ul>
                    </div>
                </div>
            )}


            {propertyType === "land-only" && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3">
                    <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium text-green-900 mb-1">🗺️ What to upload for land:</p>
                        <ul className="text-green-800 space-y-0.5 ml-4 list-disc">
                            <li><strong>Land/Plot:</strong> Clear photos of the empty land from multiple angles (min 2)</li>
                            <li><strong>Street View:</strong> Show access roads and surrounding area</li>
                            <li><strong>Site Plan:</strong> If you have drawings showing plot boundaries</li>
                        </ul>
                    </div>
                </div>
            )}


            <p className="text-sm text-gray-600 mb-4">
                Upload photos and tell us what each one shows using the dropdown below each image
            </p>


            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#4ea8a1] transition-colors mb-4">
                <input
                    type="file"
                    id="photos"
                    multiple
                    accept="image/*"
                    onChange={(e) => onPhotoUpload(e.target.files)}
                    className="hidden"
                />
                <label htmlFor="photos" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                        <Camera className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-700">Click to upload photos</p>
                        <p className="text-xs text-gray-500 mt-1">JPG or PNG up to 10MB each. Upload bedrooms, bathrooms, exterior, amenities, etc.</p>
                    </div>
                </label>
            </div>


            {error && (
                <p className="text-sm text-red-600 mb-4">{error}</p>
            )}


            {/* Photo Grid with Dropdowns */}
            {photos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {photos.map((photo) => (
                        <div key={photo.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="relative group mb-2">
                                <img
                                    src={photo.preview}
                                    alt=""
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => onPhotoRemove(photo.id)}
                                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Label Dropdown */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    What does this photo show? <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={photo.label || ""}
                                    onChange={(e) => handleLabelChange(photo.id, e.target.value as PhotoLabel)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent"
                                >
                                    <option value="">-- Select --</option>
                                    {photoLabels.map((label) => (
                                        <option key={label} value={label}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                {photo.label === "Other" && (
                                    <input
                                        type="text"
                                        value={customLabels[photo.id] || ""}
                                        onChange={(e) => handleCustomLabelChange(photo.id, e.target.value)}
                                        placeholder="Enter custom label"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent mt-2"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {photos.length > 0 && (
                <p className="text-xs text-gray-500 mt-3">
                    {photos.length} photo{photos.length !== 1 ? "s" : ""} uploaded.
                    {photos.filter(p => !p.label).length > 0 && (
                        <span className="text-orange-600 font-medium">
                            {" "}Please label all photos before continuing.
                        </span>
                    )}
                </p>
            )}
        </div>
    );
}

