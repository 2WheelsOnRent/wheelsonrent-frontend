import React, { useState } from 'react';
import {
  User, Phone, Calendar,Car, FileText,
  Hash, Shield, Loader2, CheckCircle, AlertCircle, Plus, Trash2, X
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreateOfflineBookingMutation, type CreateOfflineBookingDto, type OfflineBookingDocumentDto } from '../../store/api/offlineBookingApi';
import { useGetVehiclesQuery } from '../../store/api/vehicleApi';
//import { useGetLocationsByDistrictIdQuery } from '../../store/api/locationApi';

const ID_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'voter_id', label: "Voter's ID" },
  { value: 'driving_license', label: 'Driving License' },
];

const DOCUMENT_TYPES = [
  { value: 'id_proof', label: 'ID Proof' },
  { value: 'vehicle_before', label: 'Vehicle (Before)' },
  { value: 'vehicle_after', label: 'Vehicle (After)' },
  { value: 'other', label: 'Other' },
];

interface FormState {
  guestPhone: string;
  guestName: string;
  guestAddress: string;
  hotelName: string;
  hotelAddress: string;
  pickupLocationId: string;
  bookingStartDate: string;
  bookingEndDate: string;
  startTime: string;
  endTime: string;
  totalAmount: string;
  rate: string;
  primaryVehicleId: string;
  vehicleNumbers: string[];
  numberOfVehicles: string;
  numberOfDays: string;
  openingKm: string;
  closingKm: string;
  securityAmount: string;
  drivingLicenseNo: string;
  idType: string;
  idNumber: string;
  documents: OfflineBookingDocumentDto[];
}

const INITIAL_FORM: FormState = {
  guestPhone: '',
  guestName: '',
  guestAddress: '',
  hotelName: '',
  hotelAddress: '',
  pickupLocationId: '',
  bookingStartDate: '',
  bookingEndDate: '',
  startTime: '10:00',
  endTime: '18:00',
  totalAmount: '',
  rate: '',
  primaryVehicleId: '',
  vehicleNumbers: [''],
  numberOfVehicles: '1',
  numberOfDays: '',
  openingKm: '',
  closingKm: '',
  securityAmount: '',
  drivingLicenseNo: '',
  idType: '',
  idNumber: '',
  documents: [],
};

const OfflineBookingForm: React.FC = () => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  //const [districtId, setDistrictId] = useState<string>('');
  const [successData, setSuccessData] = useState<{ bookingId: number; userId: number } | null>(null);

  const [createOfflineBooking, { isLoading }] = useCreateOfflineBookingMutation();
  const { data: vehicles = [] } = useGetVehiclesQuery(undefined);
//   const { data: pickupLocations = [] } = useGetLocationsByDistrictIdQuery(
//     parseInt(districtId),
//     { skip: !districtId }
//   );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVehicleNumberChange = (index: number, value: string) => {
    const updated = [...form.vehicleNumbers];
    updated[index] = value;
    setForm({ ...form, vehicleNumbers: updated });
  };

  const addVehicleNumber = () => {
    if (form.vehicleNumbers.length < 4) {
      setForm({ ...form, vehicleNumbers: [...form.vehicleNumbers, ''] });
    }
  };

  const removeVehicleNumber = (index: number) => {
    if (form.vehicleNumbers.length > 1) {
      const updated = form.vehicleNumbers.filter((_, i) => i !== index);
      setForm({ ...form, vehicleNumbers: updated });
    }
  };

  const addDocument = () => {
    setForm({
      ...form,
      documents: [
        ...form.documents,
        { documentType: 'id_proof', fileUrl: '', fileType: 'image', label: '' },
      ],
    });
  };

  const updateDocument = (index: number, field: keyof OfflineBookingDocumentDto, value: string) => {
    const updated = [...form.documents];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, documents: updated });
  };

  const removeDocument = (index: number) => {
    setForm({ ...form, documents: form.documents.filter((_, i) => i !== index) });
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    //setDistrictId('');
    setSuccessData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.guestPhone || form.guestPhone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!form.primaryVehicleId) {
      toast.error('Please select a primary vehicle.');
      return;
    }
    // if (!form.pickupLocationId) {
    //   toast.error('Please select a pickup location.');
    //   return;
    // }
    if (!form.bookingStartDate || !form.bookingEndDate) {
      toast.error('Please select booking start and end dates.');
      return;
    }
    if (!form.totalAmount || parseFloat(form.totalAmount) <= 0) {
      toast.error('Please enter a valid total amount.');
      return;
    }

    const dto: CreateOfflineBookingDto = {
      guestPhone: form.guestPhone.replace(/\D/g, ''),
      guestName: form.guestName || undefined,
      guestAddress: form.guestAddress || undefined,
      hotelName: form.hotelName || undefined,
      hotelAddress: form.hotelAddress || undefined,
      pickupLocationId: 1,
      bookingStartDate: form.bookingStartDate,
      bookingEndDate: form.bookingEndDate,
      startTime: form.startTime + ':00',
      endTime: form.endTime + ':00',
      totalAmount: parseFloat(form.totalAmount),
      rate: parseFloat(form.rate) || 0,
      primaryVehicleId: parseInt(form.primaryVehicleId),
      vehicleNumbers: form.vehicleNumbers.filter(v => v.trim() !== ''),
      numberOfVehicles: parseInt(form.numberOfVehicles) || 1,
      numberOfDays: parseInt(form.numberOfDays) || 1,
      openingKm: form.openingKm ? parseInt(form.openingKm) : undefined,
      closingKm: form.closingKm ? parseInt(form.closingKm) : undefined,
      securityAmount: form.securityAmount ? parseFloat(form.securityAmount) : undefined,
      drivingLicenseNo: form.drivingLicenseNo || undefined,
      idType: form.idType || undefined,
      idNumber: form.idNumber || undefined,
      documents: form.documents.filter(d => d.fileUrl.trim() !== ''),
    };

    try {
      const result = await createOfflineBooking(dto).unwrap();
      if (result.success) {
        toast.success('Offline booking created successfully!');
        setSuccessData({ bookingId: result.bookingId!, userId: result.userId! });
      } else {
        toast.error(result.message || 'Failed to create booking.');
      }
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to create offline booking. Please try again.');
    }
  };

  if (successData) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Recorded!</h2>
        <p className="text-gray-600 mb-1">Booking ID: <span className="font-semibold text-primary-600">#{successData.bookingId}</span></p>
        <p className="text-gray-600 mb-6">User ID: <span className="font-semibold">{successData.userId}</span></p>
        <button
          onClick={handleReset}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          Add Another Booking
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Guest Information */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-primary-600" />
          Guest Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="guestPhone"
                value={form.guestPhone}
                onChange={handleChange}
                placeholder="9876543210"
                maxLength={10}
                required
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
            <input
              type="text"
              name="guestName"
              value={form.guestName}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="guestAddress"
              value={form.guestAddress}
              onChange={handleChange}
              placeholder="Guest address"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
            <input
              type="text"
              name="hotelName"
              value={form.hotelName}
              onChange={handleChange}
              placeholder="Hotel / Stay name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Address</label>
            <input
              type="text"
              name="hotelAddress"
              value={form.hotelAddress}
              onChange={handleChange}
              placeholder="Hotel address"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Booking Dates & Location */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-primary-600" />
          Booking Dates & Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="bookingStartDate"
              value={form.bookingStartDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drop Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="bookingEndDate"
              value={form.bookingEndDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drop Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Days</label>
            <input
              type="number"
              name="numberOfDays"
              value={form.numberOfDays}
              onChange={handleChange}
              min={1}
              placeholder="1"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              value={districtId}
              onChange={e => { setDistrictId(e.target.value); setForm({ ...form, pickupLocationId: '' }); }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white"
            >
              <option value="">Select district</option>
              {[...new Map(vehicles.map((v: any) => [v.districtId, v])).values()].map((v: any) => (
                <option key={v.districtId} value={v.districtId}>District {v.districtId}</option>
              ))}
            </select>
          </div> */}
          {/* <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                name="pickupLocationId"
                value={form.pickupLocationId}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">Select pickup location</option>
                {pickupLocations.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div> */}
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Car className="w-5 h-5 mr-2 text-primary-600" />
          Vehicle Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Vehicle <span className="text-red-500">*</span>
            </label>
            <select
              name="primaryVehicleId"
              value={form.primaryVehicleId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white"
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v: any) => (
                <option key={v.id} value={v.id}>{v.name} — {v.make} {v.model}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Vehicles</label>
            <input
              type="number"
              name="numberOfVehicles"
              value={form.numberOfVehicles}
              onChange={handleChange}
              min={1}
              max={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Vehicle Numbers */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Numbers</label>
            <div className="space-y-2">
              {form.vehicleNumbers.map((vn, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={vn}
                    onChange={e => handleVehicleNumberChange(index, e.target.value)}
                    placeholder={`Vehicle No. ${index + 1}`}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition uppercase"
                  />
                  {form.vehicleNumbers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVehicleNumber(index)}
                      className="px-3 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {form.vehicleNumbers.length < 4 && (
                <button
                  type="button"
                  onClick={addVehicleNumber}
                  className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium transition"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Vehicle Number
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opening KM</label>
            <input
              type="number"
              name="openingKm"
              value={form.openingKm}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Closing KM</label>
            <input
              type="number"
              name="closingKm"
              value={form.closingKm}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Hash className="w-5 h-5 mr-2 text-primary-600" />
          Pricing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate (₹/day)
            </label>
            <input
              type="number"
              name="rate"
              value={form.rate}
              onChange={handleChange}
              placeholder="0"
              min={0}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="totalAmount"
              value={form.totalAmount}
              onChange={handleChange}
              placeholder="0.00"
              min={0}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Security Amount (₹)</label>
            <input
              type="number"
              name="securityAmount"
              value={form.securityAmount}
              onChange={handleChange}
              placeholder="0.00"
              min={0}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* ID & Documents */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-primary-600" />
          Identity & Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driving License No.</label>
            <input
              type="text"
              name="drivingLicenseNo"
              value={form.drivingLicenseNo}
              onChange={handleChange}
              placeholder="DL number"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Taken</label>
            <select
              name="idType"
              value={form.idType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white"
            >
              <option value="">Select ID type</option>
              {ID_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
            <input
              type="text"
              name="idNumber"
              value={form.idNumber}
              onChange={handleChange}
              placeholder="ID number"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* File Documents */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Attached Files / Photos</label>
            <button
              type="button"
              onClick={addDocument}
              className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium transition"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Document
            </button>
          </div>
          {form.documents.length === 0 && (
            <p className="text-sm text-gray-400 italic">No documents attached. Click "Add Document" to include file URLs.</p>
          )}
          <div className="space-y-3">
            {form.documents.map((doc, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg">
                <select
                  value={doc.documentType}
                  onChange={e => updateDocument(index, 'documentType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  {DOCUMENT_TYPES.map(dt => (
                    <option key={dt.value} value={dt.value}>{dt.label}</option>
                  ))}
                </select>
                <input
                  type="url"
                  value={doc.fileUrl}
                  onChange={e => updateDocument(index, 'fileUrl', e.target.value)}
                  placeholder="File URL"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <select
                  value={doc.fileType}
                  onChange={e => updateDocument(index, 'fileType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={doc.label || ''}
                    onChange={e => updateDocument(index, 'label', e.target.value)}
                    placeholder="Label (optional)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="px-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Declaration & Submit */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              <strong>Declaration:</strong> I hereby declare that the vehicle has been received in good condition. Any damage will be borne by the renter. The renter accepts all risks including injury, death, or any risk associated with the use of the vehicle. All disputes subject to Udaipur jurisdiction.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving Booking...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Save Offline Booking
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default OfflineBookingForm;