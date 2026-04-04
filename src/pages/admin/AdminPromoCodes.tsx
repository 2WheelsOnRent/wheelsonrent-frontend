import React, { useState } from 'react';
import { Tag, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, X, Calendar, Percent } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetPromoCodesQuery,
  useCreatePromoCodeMutation,
  useUpdatePromoCodeMutation,
  useDeletePromoCodeMutation,
  type PromoCodeDto,
} from '../../store/api/promoCodeApi';

const EMPTY_FORM: Partial<PromoCodeDto> = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: 0,
  maxDiscountAmount: undefined,
  minOrderAmount: 0,
  maxUses: undefined,
  isFirstRideOnly: false,
  isActive: true,
  validFrom: new Date().toISOString().slice(0, 10),
  validUntil: undefined,
};

const AdminPromoCodes: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCodeDto | null>(null);
  const [form, setForm] = useState<Partial<PromoCodeDto>>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: promoCodes = [], isLoading } = useGetPromoCodesQuery({});
  const [createPromoCode, { isLoading: isCreating }] = useCreatePromoCodeMutation();
  const [updatePromoCode, { isLoading: isUpdating }] = useUpdatePromoCodeMutation();
  const [deletePromoCode, { isLoading: isDeleting }] = useDeletePromoCodeMutation();

  const openCreate = () => {
    setEditingCode(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (code: PromoCodeDto) => {
    setEditingCode(code);
    setForm({
      ...code,
      validFrom: code.validFrom ? new Date(code.validFrom).toISOString().slice(0, 10) : '',
      validUntil: code.validUntil ? new Date(code.validUntil).toISOString().slice(0, 10) : undefined,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCode(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code?.trim()) {
      toast.error('Promo code is required.');
      return;
    }
    if (!form.discountValue || form.discountValue <= 0) {
      toast.error('Discount value must be greater than 0.');
      return;
    }
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : new Date().toISOString(),
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
      };
      if (editingCode) {
        await updatePromoCode({ id: editingCode.id, body: payload }).unwrap();
        toast.success('Promo code updated.');
      } else {
        await createPromoCode(payload).unwrap();
        toast.success('Promo code created.');
      }
      closeModal();
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to save promo code.');
    }
  };

  const handleToggleActive = async (code: PromoCodeDto) => {
    try {
      await updatePromoCode({ id: code.id, body: { ...code, isActive: !code.isActive } }).unwrap();
      toast.success(`Promo code ${code.isActive ? 'deactivated' : 'activated'}.`);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePromoCode(id).unwrap();
      toast.success('Promo code deleted.');
      setDeleteConfirmId(null);
    } catch {
      toast.error('Failed to delete promo code.');
    }
  };

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('en-IN') : '—';

  const isExpired = (code: PromoCodeDto) =>
    code.validUntil ? new Date(code.validUntil) < new Date() : false;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
          <p className="text-sm text-gray-500 mt-1">{promoCodes.length} codes total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Promo Code
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : promoCodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Tag className="w-12 h-12 mb-3 text-gray-400" />
          <p className="text-lg font-medium">No promo codes yet</p>
          <p className="text-sm">Create your first promo code.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-xs">
                <th className="px-5 py-3 text-left">Code</th>
                <th className="px-5 py-3 text-left">Discount</th>
                <th className="px-5 py-3 text-left">Min Order</th>
                <th className="px-5 py-3 text-left">Uses</th>
                <th className="px-5 py-3 text-left">Valid Until</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promoCodes.map((code) => (
                <tr key={code.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 font-mono tracking-wide">{code.code}</span>
                      {code.description && (
                        <span className="text-xs text-gray-500 mt-0.5">{code.description}</span>
                      )}
                      {code.isFirstRideOnly && (
                        <span className="text-xs text-purple-600 font-medium mt-0.5">First ride only</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      <Percent className="w-3 h-3 mr-1" />
                      {code.discountType === 'percentage'
                        ? `${code.discountValue}%`
                        : `₹${code.discountValue}`}
                    </span>
                    {code.maxDiscountAmount && (
                      <p className="text-xs text-gray-400 mt-0.5">Max ₹{code.maxDiscountAmount}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600">₹{code.minOrderAmount}</td>
                  <td className="px-5 py-4 text-gray-600">
                    {code.usedCount}{code.maxUses ? ` / ${code.maxUses}` : ''}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className={isExpired(code) ? 'text-red-500 font-medium' : 'text-gray-600'}>
                        {formatDate(code.validUntil)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggleActive(code)} className="flex items-center gap-1">
                      {code.isActive && !isExpired(code) ? (
                        <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-600 text-xs font-medium">Active</span></>
                      ) : (
                        <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-gray-500 text-xs font-medium">{isExpired(code) ? 'Expired' : 'Inactive'}</span></>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(code)}
                        className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(code.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCode ? 'Edit Promo Code' : 'Add Promo Code'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input
                    type="text"
                    value={form.code || ''}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-mono"
                    placeholder="e.g. FIRST10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                  <select
                    value={form.discountType || 'percentage'}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as 'percentage' | 'flat' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value * {form.discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discountValue || ''}
                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxDiscountAmount ?? ''}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="No limit"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderAmount ?? 0}
                    onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxUses ?? ''}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid From *</label>
                  <input
                    type="date"
                    value={form.validFrom?.slice(0, 10) || ''}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={form.validUntil?.slice(0, 10) || ''}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFirstRideOnly ?? false}
                    onChange={(e) => setForm({ ...form, isFirstRideOnly: e.target.checked })}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <span className="text-sm font-medium text-gray-700">First ride only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive ?? true}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingCode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Promo Code?</h3>
            <p className="text-gray-600 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromoCodes;