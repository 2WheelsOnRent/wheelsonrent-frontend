import React, { useState } from 'react';
import { X, Loader2, AlertCircle, User, Mail, Phone } from 'lucide-react';
import { useCreateAdminMutation } from '../../store/api/adminApi';
import { useGetDistrictsQuery } from '../../store/api/districtApi';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const AddAdminModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { data: districts, isLoading: loadingDistricts } = useGetDistrictsQuery({});
  const [createAdmin, { isLoading }] = useCreateAdminMutation();

  const [form, setForm] = useState({
    username: '',
    email: '',
    number: '',
    districtId: 0,
    role: 1,
    isActive: true,
    hasChangedPassword: false,
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.username.trim()) { setError('Name is required'); return; }
    if (!form.email.trim()) { setError('Email is required'); return; }
    if (!form.number.trim()) { setError('Mobile number is required'); return; }
    if (!form.districtId) { setError('Please select a district'); return; }

    try {
      await createAdmin({
        username: form.username.trim(),
        email: form.email.trim(),
        number: form.number.trim(),
        districtId: form.districtId,
        role: form.role,
        isActive: form.isActive,
        hasChangedPassword: false,
      }).unwrap();

      toast.success('Admin created! An email invite with temporary password has been sent.');
      onSuccess();
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to create admin. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Add New Admin</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="Admin full name"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="admin@domain.com"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              A temporary password will be sent to this email automatically.
            </p>
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={form.number}
                onChange={(e) => handleChange('number', e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
                required
              />
            </div>
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Assigned District
            </label>
            {loadingDistricts ? (
              <div className="flex items-center gap-2 py-2 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading districts...
              </div>
            ) : (
              <div className="border border-gray-300 rounded-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-gray-100">
                {(districts ?? []).map((district: any) => (
                  <label
                    key={district.id}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition ${
                      form.districtId === district.id ? 'bg-purple-50' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="district"
                      value={district.id}
                      checked={form.districtId === district.id}
                      onChange={() => handleChange('districtId', district.id)}
                      className="accent-purple-600"
                    />
                    <span className="text-sm text-gray-700">{district.name}</span>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Currently one district per admin. Multi-district support coming soon.
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => handleChange('role', Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition bg-white"
            >
              <option value={1}>Admin</option>
              <option value={2}>SuperAdmin</option>
            </select>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => handleChange('isActive', !form.isActive)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.isActive ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.isActive ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
            <span className="text-sm text-gray-700">
              {form.isActive ? 'Active — admin can log in immediately' : 'Inactive — admin cannot log in'}
            </span>
          </label>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Creating...</>
            ) : (
              'Create Admin & Send Invite'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAdminModal;