import {
  MapPin,
  Bed,
  Bath,
  ChevronRight,
  Building,
  Home,
} from "lucide-react";
import { SimpleDocumentUpload } from "./SimpleDocumentUpload";
import { SimplePhotoUpload } from "./SimplePhotoUpload";
import {
  DeclaredDocument,
  UploadedPhoto,
  DocumentType,
  PhotoLabel,
  PropertyFlowType,
} from "./types";

const LAGOS_LOCATIONS_BY_LGA: Record<string, string[]> = {
  Agege: ["Agbotikuyo", "Capitol", "Cement", "Fagba", "Ifako", "Iju", "Iju-Ishaga", "LSDPC Estate", "Magbon", "Meiran", "Mulero", "New Oko Oba", "Oke-Odo", "Oko-Oba", "Pen Cinema"],
  Ajah: ["Abraham Adesanya Estate", "Ado / Ajah", "Ajiwe", "Canaan Estate", "Crown Estate", "Eden Garden Estate", "Graceland Estate", "Lekki Gardens Estate", "Off Lekki-Epe Expressway", "Ogombo", "Oke Ira / Ajah", "Olokonla", "Peninsula Estate", "Sangotedo", "Thomas Estate"],
  Alimosho: ["Akesan", "Akowonjo", "Dopemu", "Egbeda", "Iseri Olofin", "Orisunbare", "Pipeline", "Shasha"],
  "Amuwo-Odofin": ["Abule Ado", "Agboju", "Alakija", "Apple Junction", "Festac", "Green Estate", "Ibeshe / Amuwo-Odofin", "Satellite Town"],
  Apapa: ["Ajegunle", "Apapa G.R.A", "Apapa Road", "Ijora", "Kirikiri", "Liverpool", "Olodi Apapa", "Snake Island", "Tin Can", "Trade Fair"],
  Badagry: ["Age Mowo", "Ajido", "Aradagun", "Badagry / Badagry", "Ilogbo Eremi", "Mafo", "Oko Afo"],
  "Egbe/Idimu": ["Arida", "College", "Council", "Idimu", "Isheri / Egbe Idimu", "Pap"],
  Ejigbo: ["Ejigbo / Ejigbo", "Ife-Odan", "Ilawo", "Olla", "Orilowo"],
  Epe: ["Epe", "Epe Road"],
  Gbagada: ["Atunrase Medina", "Ifako-Gbagada", "Medina", "Millennium/UPS", "New Garage / Gbagada", "Oworonshoki / Gbagada", "Pedro", "Phase 1 / Gbagada", "Phase 2 / Gbagada", "Soluyi"],
  Ibeju: ["Abijo", "Aiyeteju", "Akodo", "Awoyaya", "Badore", "Bogije", "Eleko", "Elemoro", "Elerangbe", "Ibeju-Agbe", "Iberikodo", "Idi-Orogbo", "Igando-Oloja", "Lakowe", "Magbon-Alade", "Mopo-Ijebu Eputu", "Orimedu"],
  "Ifako-Ijaiye": ["Agbado", "Alagbado", "Alakuko"],
  Ikeja: ["Adeniyi Jones", "Agidingbi", "Airport Road / Ikeja", "Alausa", "Allen Avenue", "Awolowo Way", "Balogun", "Computer Village", "Ikeja GRA", "Mangoro", "Mobolaji Bank Anthony Way", "Oba Akran", "Obafemi Awolowo Way", "Omole Phase 1", "Omole Phase 2", "Opebi", "Oregun", "Toyin Street", "Unity Road"],
  Ikorodu: ["Adamo", "Agbowa", "Agric", "Akute Ajuwon", "Apeka", "Ebute", "Erunwe", "Gberigbe", "Ibeshe / Ikorodu", "Igbogbo", "Ijede / Ikorodu", "Ikorodu Garage", "Ipakodo", "Isawo", "Isiu", "Ita Oluwo", "Jumofak"],
  "Ikotun/Igando": ["Abaranje", "Egan", "Egbe / Ikotun/Igando", "Governors Road", "Igando / Ikotun/Igando", "Ijegun", "Ikotun / Ikotun/Igando"],
  Ikoyi: ["2nd Avenue Extension", "Abacha Estate", "Awolowo Road", "Banana Island", "Bourdillon", "Dolphin Estate", "Falomo", "Gerard Road", "Ikoyi S.W", "MacPherson", "Mosley Road", "Old Ikoyi", "Osborne Foreshore Estate", "Parkview Estate"],
  Ilupeju: ["Bye Pass Ilupeju", "Coker Road", "Ikorodu Road / Ilupeju", "Ilupeju Industrial Estate", "Town Planning Way"],
  Ipaja: ["Abesan", "Ayobo", "Baruwa", "Boys Town", "Ipaja / Ipaja", "Ipaja Road", "Iyana Ipaja"],
  Isolo: ["Ago Palace", "Ajao Estate", "Bucknor", "Cele", "Ire Akari", "Iyana Isolo", "Kogberegbe Street", "Mile 2", "Oke-Afa", "Okota", "Osolo Way"],
  Kosofe: ["Agboyi/Ketu", "Ketu-Alapere", "Ketu-Ikosi", "Kosofe / Kosofe"],
  "Lagos Island (Eko)": ["Eko Atlantic", "Lagos Island / Lagos Island"],
  Lekki: ["Ilaje / Lekki", "Lekki Expressway", "Lekki Free Trade Zone", "Lekki Phase 1", "Lekki Phase 2"],
  Magodo: ["GRA Phase 1", "GRA Phase 2 Shangisha"],
  Mushin: ["Challenge / Mushin", "Papa Ajao / Mushin"],
  Ojo: ["Ajangbadi", "Alaba", "Iba / Ojo", "Okokomaiko", "Satellite Town"],
  Ojodu: ["Magodo Isheri"],
  Ogudu: ["Ogudu GRA"],
  Shomolu: ["Bariga / Shomolu", "Ikorodu Road / Shomolu", "Oworonshoki / Shomolu"],
  Surulere: ["Abraham Adesanya", "Adelabu", "Adeniran Ogunsanya", "Aguda / Surulere", "Alaka Estate", "Alaka/Iponri", "Barracks", "Bode Thomas", "Coker", "Eric Moore", "Gbaja", "Idi Araba", "Ijesha", "Ijeshatedo", "Iponri", "Itire", "Kilo", "Lawanson", "Masha", "Ogunlana", "Ojuelegba", "Orile-Iganmu", "Papa Ajao / Surulere"],
  "Victoria Island": ["1004", "Ademola Adetokunbo", "Adeola Hopewell", "Adeola Odeku", "Ahmadu Bello Way", "Akin Adesola", "Akin Olugbade", "Bonny Camp", "Idowu Taylor", "Karimu Kotun", "Kofo Abayomi", "Ligali Ayorinde", "Saka Tinubu", "Sanusi Fafunwa", "Tiamiyu Savage", "Victoria Island Extension"],
  Yaba: ["Sabo / Yaba"],
};

const LAGOS_LGAS = Object.keys(LAGOS_LOCATIONS_BY_LGA).sort();

interface Phase1UploadProps {
  addressState: string;
  addressLga: string;
  addressCity: string;
  addressStreet: string;
  onAddressStateChange: (value: string) => void;
  onAddressLgaChange: (value: string) => void;
  onAddressCityChange: (value: string) => void;
  onAddressStreetChange: (value: string) => void;
  askingPrice: number;
  declaredDocuments: DeclaredDocument[];
  photos: UploadedPhoto[];
  errors: { [key: string]: string };
  propertyFlowType: PropertyFlowType;
  onPropertyFlowTypeChange: (type: PropertyFlowType) => void;

  onPriceChange: (value: number) => void;
  onDeclareDocument: (type: DocumentType) => void;
  onRemoveDeclaredDocument: (id: string) => void;
  onDocumentFileUpload: (declaredDocId: string, file: File) => void;
  onRemoveDocumentFile: (declaredDocId: string) => void;
  onPhotoUpload: (files: FileList | null) => void;
  onPhotoLabelChange: (photoId: string, label: PhotoLabel) => void;
  onPhotoRemove: (id: string) => void;
  bedrooms: number;
  bathrooms: number;
  onBedroomsChange: (value: number) => void;
  onBathroomsChange: (value: number) => void;
  onSubmit: () => void;
}

export function Phase1Upload({
  addressState,
  addressLga,
  addressCity,
  addressStreet,
  onAddressStateChange,
  onAddressLgaChange,
  onAddressCityChange,
  onAddressStreetChange,
  askingPrice,
  declaredDocuments,
  photos,
  errors,
  propertyFlowType,
  onPropertyFlowTypeChange,
  onPriceChange,
  onDeclareDocument,
  onRemoveDeclaredDocument,
  onDocumentFileUpload,
  onRemoveDocumentFile,
  onPhotoUpload,
  onPhotoLabelChange,
  onPhotoRemove,
  bedrooms,
  bathrooms,
  onBedroomsChange,
  onBathroomsChange,
  onSubmit,
}: Phase1UploadProps) {
  const availableAreas = addressLga
    ? (LAGOS_LOCATIONS_BY_LGA[addressLga] ?? []).slice().sort()
    : [];

  return (
    <div className="space-y-6">
      {/* Documents Upload - Simplified */}
      <SimpleDocumentUpload
        declaredDocuments={declaredDocuments}
        onDeclareDocument={onDeclareDocument}
        onRemoveDeclaredDocument={onRemoveDeclaredDocument}
        onDocumentFileUpload={onDocumentFileUpload}
        onRemoveDocumentFile={onRemoveDocumentFile}
        error={errors.documents}
      />

      {/* Photos Upload - Simplified */}
      <SimplePhotoUpload
        photos={photos}
        onPhotoUpload={onPhotoUpload}
        onPhotoLabelChange={onPhotoLabelChange}
        onPhotoRemove={onPhotoRemove}
        error={errors.photos}
        propertyType={propertyFlowType}
        onPropertyTypeChange={onPropertyFlowTypeChange}
      />

      {/* Property Address */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          3. Property Address <span className="text-red-500">*</span>
        </label>

        <div className="space-y-4">
          {/* State Selection */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <select
              value={addressState}
              onChange={(e) => onAddressStateChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent appearance-none bg-white"
            >
              <option value="Lagos">Lagos</option>
              <option value="Abuja" disabled>
                Abuja (Coming Soon)
              </option>
              <option value="Port Harcourt" disabled>
                Port Harcourt (Coming Soon)
              </option>
            </select>
            <div className="absolute right-3 top-3.5 pointer-events-none text-xs text-gray-500">
              &#9660;
            </div>
          </div>

          {/* LGA Selection */}
          <div className="relative">
            <Building className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <select
              value={addressLga}
              onChange={(e) => onAddressLgaChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent appearance-none bg-white"
            >
              <option value="">Select LGA</option>
              {LAGOS_LGAS.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-3.5 pointer-events-none text-xs text-gray-500">
              &#9660;
            </div>
          </div>

          {/* Area/Neighborhood Selection */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <select
              value={addressCity}
              onChange={(e) => onAddressCityChange(e.target.value)}
              disabled={!addressLga}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {addressLga ? "Select Area / Neighborhood" : "Select LGA first"}
              </option>
              {availableAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-3.5 pointer-events-none text-xs text-gray-500">
              &#9660;
            </div>
          </div>

          {/* Street Address */}
          <div className="relative">
            <Home className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={addressStreet}
              onChange={(e) => onAddressStreetChange(e.target.value)}
              placeholder="Street Address (e.g., 123 Admiralty Way)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent"
            />
          </div>
        </div>

        {errors.address && (
          <p className="text-sm text-red-600 mt-2">{errors.address}</p>
        )}
      </div>

      {/* Asking Price */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          4. Asking Price <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-sans font-medium text-lg">
            &#8358;
          </span>
          <input
            type="number"
            value={askingPrice || ""}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            placeholder="Enter price in Naira"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent"
          />
        </div>
        {errors.askingPrice && (
          <p className="text-sm text-red-600 mt-2">{errors.askingPrice}</p>
        )}
        {askingPrice > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            &#8358;{askingPrice.toLocaleString()}
          </p>
        )}
      </div>

      {/* Number of Bedrooms */}
      {propertyFlowType !== "land-only" && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            5. Number of Bedrooms <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              value={bedrooms || ""}
              onChange={(e) => onBedroomsChange(Number(e.target.value))}
              placeholder="e.g., 4"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Number of Bathrooms */}
      {propertyFlowType !== "land-only" && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            6. Number of Bathrooms <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              value={bathrooms || ""}
              onChange={(e) => onBathroomsChange(Number(e.target.value))}
              placeholder="e.g., 5"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Next:</strong> AI will analyze your uploads (takes ~60
          seconds)
        </p>
        <button
          onClick={onSubmit}
          className="px-6 py-3 bg-[#4ea8a1] text-white rounded-lg hover:bg-[#3d9691] font-medium flex items-center gap-2"
        >
          Continue to AI Analysis
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
