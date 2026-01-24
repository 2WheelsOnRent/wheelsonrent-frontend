import React, { useState } from 'react';
import { Image, Plus, Edit, Trash2, X, Check, Upload, Star as StarIcon } from 'lucide-react';
import { useGetVehiclesQuery } from '../store/api/vehicleApi';
import {
  useGetVehicleImagesByVehicleIdQuery,
  useCreateVehicleImageMutation,
  useUpdateVehicleImageMutation,
  useDeleteVehicleImageMutation,
  type VehicleImageDto,
} from '../store/api/vehicleImageApi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { toast } from 'sonner';

const AdminVehicleImagesManagement: React.FC = () => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState<VehicleImageDto | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: '',
    isPrimary: false,
    displayOrder: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: vehicles, isLoading: vehiclesLoading } = useGetVehiclesQuery({ page: 1, size: 100 });
  const {
    data: images,
    isLoading: imagesLoading,
    error: imagesError,
    refetch,
  } = useGetVehicleImagesByVehicleIdQuery(selectedVehicleId || 0, {
    skip: !selectedVehicleId,
  });

  const [createImage, { isLoading: creating }] = useCreateVehicleImageMutation();
  const [updateImage, { isLoading: updating }] = useUpdateVehicleImageMutation();
  const [deleteImage, { isLoading: deleting }] = useDeleteVehicleImageMutation();

  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId);
  const sortedImages = images ? [...images].sort((a, b) => a.displayOrder - b.displayOrder) : [];

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.imageUrl.trim()) {
      errors.imageUrl = 'Image URL is required';
    } else {
      try {
        const url = new URL(formData.imageUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.imageUrl = 'Invalid URL protocol (must be http or https)';
        }
      } catch {
        errors.imageUrl = 'Invalid URL format';
      }
    }

    if (formData.displayOrder < 0) {
      errors.displayOrder = 'Display order must be non-negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (image?: VehicleImageDto) => {
    if (!selectedVehicleId) {
      toast.message('Please select a vehicle first');
      return;
    }

    if (image) {
      setEditingImage(image);
      setFormData({
        imageUrl: image.imageUrl,
        isPrimary: image.isPrimary,
        displayOrder: image.displayOrder,
      });
    } else {
      setEditingImage(null);
      setFormData({
        imageUrl: '',
        isPrimary: images?.length === 0,
        displayOrder: images?.length || 0,
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingImage(null);
    setFormData({
      imageUrl: '',
      isPrimary: false,
      displayOrder: 0,
    });
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVehicleId) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      if (editingImage) {
        await updateImage({
          id: editingImage.id,
          image: { ...formData, id: editingImage.id, vehicleId: selectedVehicleId },
        }).unwrap();
      } else {
        await createImage({
          ...formData,
          vehicleId: selectedVehicleId,
        }).unwrap();
      }
      handleCloseModal();
      refetch();
    } catch (error: any) {
      console.error('Failed to save image:', error);
      setFormErrors({ submit: error.data?.message || 'Failed to save image' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await deleteImage(id).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleSetPrimary = async (image: VehicleImageDto) => {
    try {
      await updateImage({
        id: image.id,
        image: { ...image, isPrimary: true },
      }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to set primary image:', error);
      toast.error('Failed to set primary image');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Vehicle Images Management</h2>
        <p className="text-gray-600 mt-1">Manage vehicle photos stored in Supabase Storage</p>
      </div>

      {/* Vehicle Selection */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Vehicle to Manage Images
        </label>
        {vehiclesLoading ? (
          <div className="px-4 py-3 border border-gray-300 rounded-lg">Loading vehicles...</div>
        ) : (
          <select
            value={selectedVehicleId || ''}
            onChange={(e) => setSelectedVehicleId(parseInt(e.target.value) || null)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Choose a vehicle</option>
            {vehicles?.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name} - {vehicle.make} {vehicle.model} (District: {vehicle.districtId})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Content */}
      {!selectedVehicleId ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Image className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Select a vehicle to manage its images</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Images</p>
                  <p className="text-3xl font-bold text-gray-900">{images?.length || 0}</p>
                </div>
                <Image className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Primary Image</p>
                  <p className="text-3xl font-bold text-green-600">
                    {images?.filter((i) => i.isPrimary).length || 0}
                  </p>
                </div>
                <StarIcon className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Vehicle</p>
                  <p className="text-xl font-bold text-gray-900 line-clamp-1">{selectedVehicle?.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center font-semibold shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Image
            </button>
          </div>

          {/* Images Grid */}
          {imagesLoading && <LoadingSpinner message="Loading images..." />}
          {imagesError && <ErrorMessage message="Failed to load images" onRetry={refetch} />}

          {!imagesLoading && !imagesError && (
            <div className="bg-white rounded-xl shadow-md p-6">
              {sortedImages.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No images yet for this vehicle</p>
                  <p className="text-gray-400 text-sm">Add vehicle images to display in listings</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition">
                        <img
                          src={image.imageUrl}
                          alt={`Vehicle image ${image.displayOrder}`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://via.placeholder.com/400x300?text=Image+Not+Found';
                          }}
                        />
                        {image.isPrimary && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-md">
                            <StarIcon className="w-3 h-3 mr-1 fill-white" />
                            Primary
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                          Order: {image.displayOrder}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex space-x-2">
                        {!image.isPrimary && (
                          <button
                            onClick={() => handleSetPrimary(image)}
                            className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg hover:bg-green-100 transition text-sm font-medium flex items-center justify-center"
                          >
                            <StarIcon className="w-4 h-4 mr-1" />
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenModal(image)}
                          className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium flex items-center justify-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(image.id)}
                          disabled={deleting}
                          className="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium flex items-center justify-center disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingImage ? 'Edit Image' : 'Add New Image'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  {formErrors.submit}
                </div>
              )}

              {/* Vehicle Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Vehicle:</strong> {selectedVehicle?.name} - {selectedVehicle?.make}{' '}
                  {selectedVehicle?.model}
                </p>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL (Supabase Storage) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    formErrors.imageUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://your-project.supabase.co/storage/v1/object/public/vehicle-images/..."
                />
                {formErrors.imageUrl && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.imageUrl}</p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  Upload image to Supabase Storage first, then paste the public URL here
                </p>
              </div>

              {/* Image Preview */}
              {formData.imageUrl && !formErrors.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/400x300?text=Invalid+URL';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Lower numbers appear first in image gallery
                </p>
              </div>

              {/* Primary Image */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPrimary" className="ml-2 text-sm font-medium text-gray-700">
                  Set as Primary Image (shown in listings)
                </label>
              </div>

              {/* Upload Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  How to Upload to Supabase Storage:
                </h4>
                <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                  <li>Go to Supabase Dashboard → Storage</li>
                  <li>Create/Open bucket: "vehicle-images"</li>
                  <li>Upload your image file</li>
                  <li>Copy the public URL</li>
                  <li>Paste URL in the field above</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {creating || updating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      {editingImage ? 'Update Image' : 'Add Image'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicleImagesManagement;