import { useState } from 'react'
import { Tag, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'sonner'
import { useValidatePromoCodeMutation } from '../store/api/promoCodeApi'

interface PriceCalculatorProps {
  basePrice: number        // hourly rate
  hours: number            // total hours
  vehicleName: string
  onProceedToPayment?: (finalAmount: number, promoCodeId?: number) => void
  isLoading?: boolean
  isLoggedIn?: boolean
  minBookingHours?: number
  userId?: number
  cityId?: number
}

export default function PriceCalculator({
  basePrice,
  hours,
  vehicleName,
  onProceedToPayment,
  isLoading = false,
  isLoggedIn = false,
  minBookingHours = 0,
  userId,
  cityId,
}: PriceCalculatorProps) {
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoApplied, setPromoApplied] = useState(false)
  const [appliedPromoCodeId, setAppliedPromoCodeId] = useState<number | undefined>(undefined)
  const [promoMessage, setPromoMessage] = useState('')

  const [validatePromoCode, { isLoading: isValidating }] = useValidatePromoCodeMutation()

  const subtotal = basePrice * hours
  const discountAmount = subtotal * discount
  const gst = (subtotal - discountAmount) * 0.18
  const total = subtotal - discountAmount + gst

  const canProceed = hours > 0 && hours >= minBookingHours

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return

    if (!isLoggedIn || !userId) {
      toast.error('Please log in to apply a promo code')
      return
    }

    if (!cityId) {
      toast.error('City information is missing. Please refresh and try again.')
      return
    }

    try {
      const result = await validatePromoCode({
        code: promoCode.trim().toUpperCase(),
        userId,
        orderAmount: subtotal,
        cityId,
      }).unwrap()

      if (result.isValid) {
        // Calculate discount as a fraction of subtotal for internal use
        const discountFraction = subtotal > 0 ? result.discountAmount / subtotal : 0
        setDiscount(discountFraction)
        setPromoApplied(true)
        setAppliedPromoCodeId(result.promoCodeId ?? undefined)
        setPromoMessage(result.message ?? 'Promo code applied successfully!')
        toast.success(result.message ?? 'Promo code applied!')
      } else {
        setDiscount(0)
        setPromoApplied(false)
        setAppliedPromoCodeId(undefined)
        toast.error(result.message ?? 'Invalid promo code')
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string; error?: string }; status?: number }
      const message =
        error?.data?.message ??
        error?.data?.error ??
        'Failed to validate promo code'
      setDiscount(0)
      setPromoApplied(false)
      setAppliedPromoCodeId(undefined)
      toast.error(message)
    }
  }

  const handleRemovePromo = () => {
    setPromoCode('')
    setDiscount(0)
    setPromoApplied(false)
    setAppliedPromoCodeId(undefined)
    setPromoMessage('')
    toast.success('Promo code removed')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
      <h3 className="text-xl text-black mb-6">Booking Summary</h3>

      {/* Vehicle Details */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <p className="text-sm text-gray-600 mb-1">Vehicle</p>
        <p className="text-black font-medium">{vehicleName}</p>
      </div>

      {/* Hourly Rate Info */}
      <div className="mb-6 p-4 bg-primary-50 rounded-lg">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-gray-600">Hourly Rate</span>
          <span className="text-2xl font-bold text-primary-600">₹{basePrice}</span>
        </div>
        {minBookingHours > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Minimum {minBookingHours} hours booking required
          </p>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Rate × {hours} hours</span>
          <span className="text-black">₹{subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({Math.round(discount * 100)}%)</span>
            <span>-₹{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">GST (18%)</span>
          <span className="text-black">₹{gst.toFixed(2)}</span>
        </div>
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg text-black font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-primary-500">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Promo Code */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Enter code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="pl-10"
              disabled={promoApplied || isValidating}
            />
          </div>
          {!promoApplied ? (
            <Button
              onClick={handleApplyPromo}
              variant="outline"
              className="border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white"
              disabled={!promoCode.trim() || isValidating}
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleRemovePromo}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              Remove
            </Button>
          )}
        </div>
        {promoApplied && (
          <p className="text-sm text-green-600 mt-2 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            {promoMessage || 'Promo code applied successfully!'}
          </p>
        )}
      </div>

      {/* Validation Warning */}
      {hours > 0 && hours < minBookingHours && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">
            Minimum booking duration is {minBookingHours} hours. Please adjust your dates.
          </p>
        </div>
      )}

      {/* Additional Info */}
      <div className="bg-primary-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-black mb-2">Important Information</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Valid driving license and ID proof required at pickup</li>
          <li>Security Deposit ₹2000 collected at pickup (refundable)</li>
        </ul>
      </div>

      {/* Proceed Button */}
      <Button
        onClick={() => onProceedToPayment?.(total, appliedPromoCodeId)}
        disabled={!canProceed || isLoading}
        className="w-full bg-primary-500 hover:bg-primary-600 text-white py-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Proceed to Payment'}
      </Button>

      {/* Info Alert */}
      {isLoggedIn && (
        <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg p-3 flex items-start">
          <AlertCircle className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            Payment will be processed securely through EaseBuzz after booking confirmation.
          </p>
        </div>
      )}

      {/* Cancellation Policy */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-black mb-2">Cancellation Policy</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Free cancellation up to 24 hours before pickup</li>
          <li>50% refund if cancelled 12-24 hours before</li>
          <li>No refund if cancelled within 12 hours</li>
        </ul>
      </div>
    </div>
  )
}