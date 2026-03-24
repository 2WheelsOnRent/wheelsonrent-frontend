import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Users, Bike, Calendar, LogOut,
  TrendingUp, Plus, Edit, Trash2, Search,
  CheckCircle, XCircle, ChevronDown, X, Save, Loader2,
  Image, Star, MapPin, RefreshCw, Navigation, Battery,
  Wifi, Gauge, Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { toast } from 'sonner';

// RTK Query hooks
import {
  useGetVehiclesQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  type VehicleDto,
} from '../store/api/vehicleApi';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from '../store/api/userApi';
import {
  useGetBookingsQuery,
  useUpdateBookingMutation,
} from '../store/api/bookingApi';
import { useGetDistrictsQuery } from '../store/api/districtApi';
import {
  useGetVehicleImagesByVehicleIdQuery,
  useCreateVehicleImageMutation,
  useUpdateVehicleImageMutation,
  useDeleteVehicleImageMutation,
} from '../store/api/vehicleImageApi';
import { uploadVehicleImage } from '../lib/supabase';
import { getLiveData, type MapplsDeviceData } from '../config/mappls';
import { LoadingSpinner } from '../components/LoadingSpinner';

// ── FormField — outside component to prevent focus loss ───────────────────
const FormField = ({
  label, value, onChange, type = 'text', required = false,
  placeholder = '', children, className = '',
}: {
  label: string; value?: any; onChange?: (v: any) => void;
  type?: string; required?: boolean; placeholder?: string;
  children?: React.ReactNode; className?: string;
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children ?? (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
      />
    )}
  </div>
);

// ── Vehicle Form Initial State ─────────────────────────────────────────────
const EMPTY_VEHICLE: Omit<VehicleDto, 'id'> = {
  name: '', make: '', model: '', districtId: 1,
  isAvailable: true, featured: false,
  pricePerHour: 0, pricePerDay: 0, minBookingHours: 4,
  kmLimit: 100, excessKmCharge: 5, lateReturnCharge: 80,
  rating: 0, fuelType: 'Petrol', vehicleType: 'Scooter',
  kmTravelled: 0, gpsDeviceId: '',
  packages: { fourHours: 0, oneDay: 0, threeDays: 0, sevenDays: 0, fifteenDays: 0, monthly: 0 },
  specs: { mileage: '', engineCapacity: '', topSpeed: '', weight: '' },
};

type ActiveTab = 'overview' | 'vehicles' | 'bookings' | 'users';
type VehicleModalTab = 'details' | 'images';

// ── Status config ──────────────────────────────────────────────────────────
const getDeviceStatusConfig = (statusStr: string) => {
  const s = statusStr?.toLowerCase();
  if (s === 'moving') return { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Moving' };
  if (s === 'idle')   return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500', label: 'Idle' };
  if (s === 'stopped') return { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Stopped' };
  return { color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400', label: statusStr };
};

// ── Tracking Modal ─────────────────────────────────────────────────────────
const TrackingModal: React.FC<{
  vehicle: VehicleDto;
  onClose: () => void;
}> = ({ vehicle, onClose }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [liveData, setLiveData] = useState<MapplsDeviceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch live data ──────────────────────────────────────────────────────
  const fetchData = async () => {
    if (!vehicle.gpsDeviceId) return;
    try {
      setError(null);
      const data = await getLiveData(vehicle.gpsDeviceId);
      if (!data) { setError('No data received from device'); return; }
      setLiveData(data);
      setLastRefreshed(new Date());
      updateMapMarker(data);
    } catch (err) {
      setError('Failed to fetch live data');
    } finally {
      setLoading(false);
    }
  };

  // ── Init map ─────────────────────────────────────────────────────────────
  const initMap = (lat: number, lng: number) => {
    const mappls = (window as any).mappls;
    if (!mappls || !mapRef.current) return;

    mapInstanceRef.current = new mappls.Map(mapRef.current, {
      center: [lat, lng],
      zoom: 15,
    });

    markerRef.current = new mappls.Marker({
      map: mapInstanceRef.current,
      position: { lat, lng },
      icon: {
        url: 'https://apis.mappls.com/map_v3/1.png',
        width: 30,
        height: 40,
      },
    });
  };

  // ── Update marker position ────────────────────────────────────────────────
  const updateMapMarker = (data: MapplsDeviceData) => {
    const mappls = (window as any).mappls;
    if (!mappls) return;

    const pos = { lat: data.latitude, lng: data.longitude };

    if (!mapInstanceRef.current) {
      // Map not yet initialized — init now
      setTimeout(() => initMap(data.latitude, data.longitude), 300);
      return;
    }

    if (markerRef.current) {
      markerRef.current.setPosition(pos);
    } else {
      markerRef.current = new mappls.Marker({
        map: mapInstanceRef.current,
        position: pos,
      });
    }
    mapInstanceRef.current.setCenter(pos);
  };

  // ── Lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(fetchData, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.destroy?.(); } catch {}
      }
    };
  }, [vehicle.gpsDeviceId]);

  const statusConfig = liveData ? getDeviceStatusConfig(liveData.statusStr) : null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{vehicle.name}</h2>
              <p className="text-xs text-gray-500">GPS: {vehicle.gpsDeviceId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastRefreshed && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading && !liveData && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
              <p className="text-gray-500">Fetching live location...</p>
            </div>
          )}

          {error && !liveData && (
            <div className="text-center py-16">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 font-medium">{error}</p>
              {/* <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Try Again
              </button> */}
            </div>
          )}

          {liveData && (
            <>
              {/* Status bar */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-xl border mb-5 ${statusConfig?.color}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${statusConfig?.dot} animate-pulse`} />
                  <span className="font-semibold text-sm">{statusConfig?.label}</span>
                  <span className="text-xs opacity-70">· {liveData.ignitionStatusStr}</span>
                </div>
                <span className="text-xs opacity-70">{liveData.gprsTimeStr}</span>
              </div>

              {/* Map */}
              <div
                ref={mapRef}
                className="w-full h-72 rounded-xl overflow-hidden border border-gray-200 mb-5 bg-gray-100"
                style={{ minHeight: '288px' }}
              />

              {/* Address */}
              <div className="flex items-start gap-2 px-4 py-3 bg-gray-50 rounded-xl mb-5">
                <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">{liveData.address}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Gauge className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-700">{liveData.speedKph.toFixed(0)}</p>
                  <p className="text-xs text-blue-500 font-medium">km/h</p>
                </div>

                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <Navigation className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-700">{liveData.todayKms.toFixed(1)}</p>
                  <p className="text-xs text-green-500 font-medium">Today's km</p>
                </div>

                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <Battery className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-yellow-700">{liveData.internalBatteryLevel}%</p>
                  <p className="text-xs text-yellow-500 font-medium">Battery</p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <Wifi className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-purple-700">{liveData.gprsStateStr}</p>
                  <p className="text-xs text-purple-500 font-medium">
                    GPS: {liveData.gpsStateStr}
                  </p>
                </div>

              </div>

              {/* Power info */}
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 px-1">
                <span>⚡ Main Power: {(liveData.mainPower / 1000).toFixed(2)}v</span>
                <span>·</span>
                <span>📡 Last GPS: {liveData.gpsTimeStr}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// AdminDashboard
// ══════════════════════════════════════════════════════════════════════════════
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const adminUser = useAppSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleDto | null>(null);
  const [vehicleForm, setVehicleForm] = useState<Omit<VehicleDto, 'id'>>(EMPTY_VEHICLE);
  const [vehicleModalTab, setVehicleModalTab] = useState<VehicleModalTab>('details');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [trackingVehicle, setTrackingVehicle] = useState<VehicleDto | null>(null);
  const [bookingSort, setBookingSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'id', direction: 'desc',
  });

  // ── API Calls ──────────────────────────────────────────────────────────
  const { data: vehicles = [], isLoading: vehiclesLoading, refetch: refetchVehicles } = useGetVehiclesQuery(undefined);
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useGetUsersQuery({ page: 1, size: 100 });
  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useGetBookingsQuery({ page: 1, size: 100 });
  const { data: districts = [] } = useGetDistrictsQuery({ page: 1, size: 100 });

  const {
    data: vehicleImages = [],
    isLoading: imagesLoading,
    refetch: refetchImages,
  } = useGetVehicleImagesByVehicleIdQuery(editingVehicle?.id ?? 0, {
    skip: !editingVehicle?.id,
  });

  const [createVehicle, { isLoading: creating }] = useCreateVehicleMutation();
  const [updateVehicle, { isLoading: updating }] = useUpdateVehicleMutation();
  const [deleteVehicle] = useDeleteVehicleMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [updateBooking] = useUpdateBookingMutation();
  const [createVehicleImage] = useCreateVehicleImageMutation();
  const [updateVehicleImage] = useUpdateVehicleImageMutation();
  const [deleteVehicleImage] = useDeleteVehicleImageMutation();

  // ── Derived Stats ─────────────────────────────────────────────────────
  const stats = {
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter((v) => v.isAvailable).length,
    totalUsers: users.length,
    activeBookings: bookings.filter((b) => b.status === 1).length,
    pendingBookings: bookings.filter((b) => b.status === 0).length,
    monthlyRevenue: bookings
      .filter((b) => b.status === 1 || b.status === 2)
      .reduce((sum, b) => sum + Number(b.totalAmount), 0),
  };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    window.dispatchEvent(new Event('user-logout'));
    navigate('/admin-login', { replace: true });
  };

  const handleOpenAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleForm(EMPTY_VEHICLE);
    setVehicleModalTab('details');
    setShowVehicleModal(true);
  };

  const handleOpenEditVehicle = (vehicle: VehicleDto) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      name: vehicle.name, make: vehicle.make, model: vehicle.model,
      districtId: vehicle.districtId, isAvailable: vehicle.isAvailable,
      featured: vehicle.featured, pricePerHour: vehicle.pricePerHour,
      pricePerDay: vehicle.pricePerDay, minBookingHours: vehicle.minBookingHours,
      kmLimit: vehicle.kmLimit, excessKmCharge: vehicle.excessKmCharge,
      lateReturnCharge: vehicle.lateReturnCharge, rating: vehicle.rating,
      fuelType: vehicle.fuelType, vehicleType: vehicle.vehicleType,
      kmTravelled: vehicle.kmTravelled,
      gpsDeviceId: vehicle.gpsDeviceId ?? '',
      packages: vehicle.packages ?? EMPTY_VEHICLE.packages,
      specs: vehicle.specs ?? EMPTY_VEHICLE.specs,
    });
    setVehicleModalTab('details');
    setShowVehicleModal(true);
  };

  const handleSaveVehicle = async () => {
    if (!vehicleForm.name || !vehicleForm.make || !vehicleForm.model) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      if (editingVehicle) {
        await updateVehicle({ id: editingVehicle.id, vehicle: { ...vehicleForm, id: editingVehicle.id } }).unwrap();
        toast.success('Vehicle updated successfully');
        setVehicleModalTab('images');
      } else {
        const newVehicle = await createVehicle(vehicleForm as VehicleDto).unwrap();
        toast.success('Vehicle added! Now you can add images.');
        setEditingVehicle(newVehicle);
        setVehicleModalTab('images');
        refetchVehicles();
      }
    } catch (err: any) {
      toast.error('Failed to save vehicle', { description: err?.data?.message || 'Try again' });
    }
  };

  const handleUploadVehicleImage = async (file?: File) => {
    if (!file || !editingVehicle?.id) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) { toast.error('Only JPEG, PNG, WebP allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return; }
    setIsUploadingImage(true);
    try {
      const imageUrl = await uploadVehicleImage(file, editingVehicle.id);
      const isPrimary = vehicleImages.length === 0;
      const displayOrder = vehicleImages.length;
      await createVehicleImage({ vehicleId: editingVehicle.id, imageUrl, isPrimary, displayOrder }).unwrap();
      toast.success('Image uploaded successfully!');
      refetchImages();
      refetchVehicles();
    } catch (err: any) {
      toast.error('Upload failed', { description: err?.message || 'Try again' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSetPrimaryImage = async (image: any) => {
    try {
      await updateVehicleImage({ id: image.id, image: { ...image, isPrimary: true } }).unwrap();
      toast.success('Primary image updated');
      refetchImages();
      refetchVehicles();
    } catch { toast.error('Failed to set primary image'); }
  };

  const handleDeleteVehicleImage = async (image: any) => {
    if (!confirm('Delete this image?')) return;
    try {
      await deleteVehicleImage(image.id).unwrap();
      toast.success('Image deleted');
      refetchImages();
      refetchVehicles();
    } catch { toast.error('Failed to delete image'); }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await deleteVehicle(id).unwrap();
      toast.success('Vehicle deleted');
      refetchVehicles();
    } catch { toast.error('Failed to delete vehicle'); }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id).unwrap();
      toast.success('User deleted');
      refetchUsers();
    } catch { toast.error('Failed to delete user'); }
  };

  const handleUpdateBookingStatus = async (bookingId: number, status: 0 | 1 | 2 | 3) => {
    try {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) return;
      await updateBooking({ id: bookingId, booking: { ...booking, status } }).unwrap();
      toast.success('Booking status updated');
      refetchBookings();
    } catch { toast.error('Failed to update booking'); }
  };

  const handleSortBookings = (column: string) => {
    setBookingSort((prev) =>
      prev.column === column
        ? { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'asc' }
    );
  };

  // ── Filtered / Sorted Data ─────────────────────────────────────────────
  const filteredVehicles = vehicles.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.make.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.userNumber.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const sortedBookings = [...bookings].sort((a, b) => {
    const aVal = (a as any)[bookingSort.column];
    const bVal = (b as any)[bookingSort.column];
    if (aVal < bVal) return bookingSort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return bookingSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusBadge = (status: number) => {
    const map: Record<number, { text: string; color: string }> = {
      0: { text: 'Pending',   color: 'bg-yellow-100 text-yellow-800' },
      1: { text: 'Confirmed', color: 'bg-green-100 text-green-800' },
      2: { text: 'Completed', color: 'bg-blue-100 text-blue-800' },
      3: { text: 'Cancelled', color: 'bg-red-100 text-red-800' },
    };
    const { text, color } = map[status] ?? { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{text}</span>;
  };

  const SortIcon = ({ column }: { column: string }) => (
    <button onClick={() => handleSortBookings(column)} className="flex items-center ml-1">
      <ChevronDown className={`w-4 h-4 ${bookingSort.column === column ? 'text-blue-600' : 'text-gray-400'}`} />
    </button>
  );

  // ── JSX ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white shadow-lg fixed h-full z-20">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            scootyonrent
          </h2>
          <p className="text-xs text-gray-500">Admin Panel</p>
          {adminUser && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">{adminUser.name}</p>
              <p className="text-xs text-blue-600 capitalize">{adminUser.userType}</p>
            </div>
          )}
        </div>

        <nav className="px-4 space-y-2">
          {([
            { id: 'overview',  icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'vehicles',  icon: Bike,            label: 'Vehicles'  },
            { id: 'bookings',  icon: Calendar,        label: 'Bookings'  },
            { id: 'users',     icon: Users,           label: 'Users'     },
          ] as { id: ActiveTab; icon: any; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition ${
                activeTab === id ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />{label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5 mr-3" />Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="ml-64 flex-1 p-8">

        {/* ════ OVERVIEW TAB ════ */}
        {activeTab === 'overview' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Vehicles',      value: stats.totalVehicles,   sub: `${stats.availableVehicles} available`, icon: Bike,       color: 'text-blue-600'   },
                { label: 'Active Bookings',      value: stats.activeBookings,  sub: `${stats.pendingBookings} pending`,    icon: Calendar,   color: 'text-green-600'  },
                { label: 'Total Users',          value: stats.totalUsers,      sub: 'registered',                          icon: Users,      color: 'text-purple-600' },
                { label: 'Revenue (Confirmed)',  value: `₹${stats.monthlyRevenue.toLocaleString()}`, sub: 'total',         icon: TrendingUp, color: 'text-orange-600' },
              ].map(({ label, value, sub, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-600 text-sm">{label}</p>
                    <Icon className={`w-8 h-8 ${color}`} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-green-600 mt-1">{sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
                {bookingsLoading ? <LoadingSpinner /> : (
                  <div className="space-y-3">
                    {sortedBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Booking #{booking.id}</p>
                          <p className="text-sm text-gray-600">User #{booking.userId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">₹{booking.totalAmount}</p>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                    {bookings.length === 0 && <p className="text-gray-500 text-sm">No bookings yet</p>}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Fleet Overview</h2>
                {vehiclesLoading ? <LoadingSpinner /> : (
                  <div className="space-y-3">
                    {vehicles.slice(0, 5).map((v) => (
                      <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{v.name}</p>
                          <p className="text-sm text-gray-600">{v.make} · {v.vehicleType}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-blue-600">₹{v.pricePerHour}/hr</span>
                          {v.isAvailable
                            ? <CheckCircle className="w-4 h-4 text-green-500" />
                            : <XCircle className="w-4 h-4 text-red-500" />}
                        </div>
                      </div>
                    ))}
                    {vehicles.length === 0 && <p className="text-gray-500 text-sm">No vehicles added yet</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════ VEHICLES TAB ════ */}
        {activeTab === 'vehicles' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
              <button
                onClick={handleOpenAddVehicle}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />Add Vehicle
              </button>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {vehiclesLoading ? <LoadingSpinner /> : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Vehicle', 'Make', 'Type', 'Rate/Hr', 'Status', 'Km Travelled', 'Actions'].map((h) => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredVehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{vehicle.name}</p>
                          <p className="text-xs text-gray-500">{vehicle.model}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{vehicle.make}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{vehicle.vehicleType}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-blue-600">₹{vehicle.pricePerHour}</td>
                        <td className="px-6 py-4">
                          {vehicle.isAvailable
                            ? <span className="flex items-center text-green-600 text-sm"><CheckCircle className="w-4 h-4 mr-1" />Available</span>
                            : <span className="flex items-center text-red-500 text-sm"><XCircle className="w-4 h-4 mr-1" />Inactive</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{vehicle.kmTravelled.toLocaleString()} km</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleOpenEditVehicle(vehicle)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Edit vehicle"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { handleOpenEditVehicle(vehicle); setVehicleModalTab('images'); }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Manage images"
                            >
                              <Image className="w-4 h-4" />
                            </button>
                            {/* Track button — only shown if GPS device ID is set */}
                            {vehicle.gpsDeviceId && (
                              <button
                                onClick={() => setTrackingVehicle(vehicle)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                title="Track vehicle"
                              >
                                <MapPin className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete vehicle"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredVehicles.length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No vehicles found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════ BOOKINGS TAB ════ */}
        {activeTab === 'bookings' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Booking Management</h1>
            {bookingsLoading ? <LoadingSpinner /> : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        { label: 'Booking ID',  col: 'id'               },
                        { label: 'Vehicle ID',  col: 'vehicleId'        },
                        { label: 'User ID',     col: 'userId'           },
                        { label: 'Start Date',  col: 'bookingStartDate' },
                        { label: 'Amount',      col: 'totalAmount'      },
                        { label: 'Status',      col: null               },
                        { label: 'Actions',     col: null               },
                      ].map(({ label, col }) => (
                        <th key={label} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          {col ? (
                            <button onClick={() => handleSortBookings(col)} className="flex items-center">
                              {label}<SortIcon column={col} />
                            </button>
                          ) : label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">#{booking.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">Vehicle #{booking.vehicleId}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">User #{booking.userId}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {String(booking.bookingStartDate)} → {String(booking.bookingEndDate)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{booking.totalAmount}</td>
                        <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {booking.status === 0 && (
                              <>
                                <button onClick={() => handleUpdateBookingStatus(booking.id!, 1)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Confirm">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleUpdateBookingStatus(booking.id!, 3)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Cancel">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {booking.status === 1 && (
                              <button onClick={() => handleUpdateBookingStatus(booking.id!, 2)} className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                                Mark Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {sortedBookings.length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No bookings found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════ USERS TAB ════ */}
        {activeTab === 'users' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by phone number..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            {usersLoading ? <LoadingSpinner /> : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['User ID', 'Phone Number', 'District ID', 'Actions'].map((h) => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">#{user.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-600 font-semibold text-sm">
                              {user.userNumber.slice(-2)}
                            </div>
                            {user.userNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.districtId ?? 'N/A'}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ════ VEHICLE MODAL ════ */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
              <button onClick={() => setShowVehicleModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs — Images only when editing */}
            {editingVehicle && (
              <div className="flex border-b border-gray-200 px-6 bg-white sticky top-[73px] z-10">
                {(['details', 'images'] as VehicleModalTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setVehicleModalTab(tab)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold capitalize border-b-2 transition mr-2 ${
                      vehicleModalTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'images'
                      ? <><Image className="w-4 h-4" />Images ({vehicleImages.length})</>
                      : <><Edit className="w-4 h-4" />Details</>}
                  </button>
                ))}
              </div>
            )}

            <div className="p-6 space-y-6">

              {/* ── DETAILS TAB ── */}
              {vehicleModalTab === 'details' && (
                <>
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField label="Vehicle Name" value={vehicleForm.name} onChange={(v) => setVehicleForm({ ...vehicleForm, name: v })} required placeholder="e.g. Honda Activa 6G" />
                      <FormField label="Make / Brand"  value={vehicleForm.make} onChange={(v) => setVehicleForm({ ...vehicleForm, make: v })} required placeholder="e.g. Honda" />
                      <FormField label="Model"         value={vehicleForm.model} onChange={(v) => setVehicleForm({ ...vehicleForm, model: v })} required placeholder="e.g. Activa 6G" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <FormField label="Vehicle Type">
                        <select value={vehicleForm.vehicleType} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                          <option value="Scooter">Scooter</option>
                          <option value="Bike">Bike</option>
                          <option value="Sports">Sports</option>
                        </select>
                      </FormField>
                      <FormField label="Fuel Type">
                        <select value={vehicleForm.fuelType} onChange={(e) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                          <option value="Petrol">Petrol</option>
                          <option value="Electric">Electric</option>
                        </select>
                      </FormField>
                      <FormField label="District">
                        <select value={vehicleForm.districtId} onChange={(e) => setVehicleForm({ ...vehicleForm, districtId: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                          {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </FormField>
                    </div>
                  </div>

                  {/* GPS Device */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      GPS Tracking
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="GPS Device ID"
                        value={vehicleForm.gpsDeviceId ?? ''}
                        onChange={(v) => setVehicleForm({ ...vehicleForm, gpsDeviceId: v })}
                        placeholder="e.g. MMI847368"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Enter the Mappls InTouch device ID. A 📍 Track button will appear on this vehicle once saved.
                    </p>
                  </div>

                  {/* Pricing */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Pricing</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField label="Price/Hour (₹)"  value={vehicleForm.pricePerHour}    onChange={(v) => setVehicleForm({ ...vehicleForm, pricePerHour: v })}    type="number" required />
                      <FormField label="Price/Day (₹)"   value={vehicleForm.pricePerDay}     onChange={(v) => setVehicleForm({ ...vehicleForm, pricePerDay: v })}     type="number" />
                      <FormField label="Min Booking Hrs" value={vehicleForm.minBookingHours} onChange={(v) => setVehicleForm({ ...vehicleForm, minBookingHours: v })} type="number" />
                      <FormField label="KM Limit/Day"    value={vehicleForm.kmLimit}         onChange={(v) => setVehicleForm({ ...vehicleForm, kmLimit: v })}         type="number" />
                      <FormField label="Excess KM Charge" value={vehicleForm.excessKmCharge} onChange={(v) => setVehicleForm({ ...vehicleForm, excessKmCharge: v })} type="number" />
                      <FormField label="Late Return/Hr"  value={vehicleForm.lateReturnCharge} onChange={(v) => setVehicleForm({ ...vehicleForm, lateReturnCharge: v })} type="number" />
                    </div>
                  </div>

                  {/* Packages */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Packages (₹)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {([
                        ['4 Hours', 'fourHours'], ['1 Day', 'oneDay'], ['3 Days', 'threeDays'],
                        ['7 Days', 'sevenDays'], ['15 Days', 'fifteenDays'], ['Monthly', 'monthly'],
                      ] as [string, keyof NonNullable<typeof vehicleForm.packages>][]).map(([label, key]) => (
                        <FormField
                          key={key} label={label}
                          value={vehicleForm.packages?.[key] ?? 0}
                          onChange={(v) => setVehicleForm({ ...vehicleForm, packages: { ...vehicleForm.packages!, [key]: v } })}
                          type="number"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Specs */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Specifications</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField label="Mileage"   value={vehicleForm.specs?.mileage}         onChange={(v) => setVehicleForm({ ...vehicleForm, specs: { ...vehicleForm.specs!, mileage: v } })}         placeholder="45 km/l" />
                      <FormField label="Engine"    value={vehicleForm.specs?.engineCapacity}   onChange={(v) => setVehicleForm({ ...vehicleForm, specs: { ...vehicleForm.specs!, engineCapacity: v } })}   placeholder="110cc" />
                      <FormField label="Top Speed" value={vehicleForm.specs?.topSpeed}         onChange={(v) => setVehicleForm({ ...vehicleForm, specs: { ...vehicleForm.specs!, topSpeed: v } })}         placeholder="90 km/h" />
                      <FormField label="Weight"    value={vehicleForm.specs?.weight}           onChange={(v) => setVehicleForm({ ...vehicleForm, specs: { ...vehicleForm.specs!, weight: v } })}           placeholder="107 kg" />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Settings</h3>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={vehicleForm.isAvailable} onChange={(e) => setVehicleForm({ ...vehicleForm, isAvailable: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm text-gray-700">Available for booking</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={vehicleForm.featured} onChange={(e) => setVehicleForm({ ...vehicleForm, featured: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm text-gray-700">Featured on homepage</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* ── IMAGES TAB ── */}
              {vehicleModalTab === 'images' && editingVehicle && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Vehicle Images</h3>
                      <p className="text-xs text-gray-400 mt-0.5">First uploaded image is set as primary automatically</p>
                    </div>
                    <label className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 cursor-pointer transition ${isUploadingImage ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      {isUploadingImage
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</>
                        : <><Plus className="w-4 h-4" />Upload Image</>}
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={isUploadingImage} onChange={(e) => handleUploadVehicleImage(e.target.files?.[0])} />
                    </label>
                  </div>

                  {imagesLoading && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                      <span className="text-gray-500 text-sm">Loading images...</span>
                    </div>
                  )}

                  {!imagesLoading && vehicleImages.length === 0 && (
                    <div className="text-center py-14 border-2 border-dashed border-gray-200 rounded-xl">
                      <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No images yet</p>
                      <p className="text-gray-400 text-sm mt-1">Upload images using the button above</p>
                    </div>
                  )}

                  {!imagesLoading && vehicleImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {vehicleImages.map((image) => (
                        <div key={image.id} className="relative group rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition">
                          <img
                            src={image.imageUrl}
                            alt="Vehicle"
                            className="w-full h-36 object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image'; }}
                          />
                          {image.isPrimary && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3 fill-white" /> Primary
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            {!image.isPrimary && (
                              <button onClick={() => handleSetPrimaryImage(image)} className="flex items-center gap-1 px-2 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition">
                                <Star className="w-3 h-3" /> Set Primary
                              </button>
                            )}
                            <button onClick={() => handleDeleteVehicleImage(image)} className="flex items-center gap-1 px-2 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition">
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                          <div className="px-3 py-1.5 bg-white text-xs text-gray-500 flex justify-between">
                            <span>Order: {image.displayOrder}</span>
                            <span className="text-gray-400">#{image.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
              {vehicleModalTab === 'images' ? (
                <button onClick={() => setShowVehicleModal(false)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Done
                </button>
              ) : (
                <>
                  <button onClick={() => setShowVehicleModal(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveVehicle}
                    disabled={creating || updating}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50"
                  >
                    {(creating || updating)
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                      : <><Save className="w-4 h-4 mr-2" />{editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}</>}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ════ TRACKING MODAL ════ */}
      {trackingVehicle && (
        <TrackingModal
          vehicle={trackingVehicle}
          onClose={() => setTrackingVehicle(null)}
        />
      )}

    </div>
  );
};

export default AdminDashboard;
