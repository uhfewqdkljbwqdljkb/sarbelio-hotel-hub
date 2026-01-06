import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBooking } from '@/contexts/BookingContext';
import { useCreateReservation } from '@/hooks/useReservations';
import { useCreateGuest } from '@/hooks/useGuests';
import { useUpdateRoom } from '@/hooks/useRooms';
import { toast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { Check, Loader2, Calendar, Users, BedDouble, CreditCard } from 'lucide-react';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

type BookingStep = 'details' | 'review' | 'confirmation';

export const BookingModal: React.FC<BookingModalProps> = ({ open, onClose }) => {
  const { bookingData, setGuestInfo, nights, totalPrice, resetBooking } = useBooking();
  const [step, setStep] = useState<BookingStep>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  
  const createReservation = useCreateReservation();
  const createGuest = useCreateGuest();
  const updateRoom = useUpdateRoom();

  const { guestInfo, selectedRoom, checkIn, checkOut, adults, children } = bookingData;

  const isDetailsValid = 
    guestInfo.firstName.trim() !== '' &&
    guestInfo.lastName.trim() !== '' &&
    guestInfo.email.trim() !== '' &&
    guestInfo.phone.trim() !== '';

  const handleSubmit = async () => {
    if (!selectedRoom || !checkIn || !checkOut) return;

    setIsSubmitting(true);
    try {
      // Create guest first
      const guest = await createGuest.mutateAsync({
        firstName: guestInfo.firstName,
        lastName: guestInfo.lastName,
        email: guestInfo.email,
        phone: guestInfo.phone,
        nationality: guestInfo.nationality || undefined,
      });

      // Generate confirmation code
      const code = `CNF-${Date.now().toString(36).toUpperCase()}`;

      // Create reservation
      await createReservation.mutateAsync({
        confirmationCode: code,
        guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        guestEmail: guestInfo.email,
        phone: guestInfo.phone,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        checkIn: format(checkIn, 'yyyy-MM-dd'),
        checkOut: format(checkOut, 'yyyy-MM-dd'),
        nights: nights,
        guests: adults + children,
        totalAmount: totalPrice,
        status: 'CONFIRMED',
        source: 'WEBSITE',
      });

      // Update room status to reserved
      await updateRoom.mutateAsync({
        id: selectedRoom.id,
        status: 'RESERVED',
      });

      setConfirmationCode(code);
      setStep('confirmation');
      
      toast({
        title: 'Booking Confirmed!',
        description: `Your confirmation code is ${code}`,
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: 'There was an error processing your booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (step === 'confirmation') {
      resetBooking();
    }
    setStep('details');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {step === 'details' && 'Guest Details'}
            {step === 'review' && 'Review Your Booking'}
            {step === 'confirmation' && 'Booking Confirmed!'}
          </DialogTitle>
        </DialogHeader>

        {step === 'details' && (
          <div className="space-y-6 py-4">
            {/* Booking Summary */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <BedDouble className="h-5 w-5 text-[#8c7a6b]" />
                <div>
                  <p className="font-semibold">{selectedRoom?.name}</p>
                  <p className="text-sm text-slate-500">Room {selectedRoom?.roomNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-[#8c7a6b]" />
                <div>
                  <p className="font-medium">
                    {checkIn ? format(checkIn, 'MMM d, yyyy') : 'Check-in'} → {checkOut ? format(checkOut, 'MMM d, yyyy') : 'Check-out'}
                  </p>
                  <p className="text-sm text-slate-500">{nights} night{nights !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[#8c7a6b]" />
                <p>{adults} Adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}</p>
              </div>
            </div>

            {/* Guest Form */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={guestInfo.firstName}
                  onChange={(e) => setGuestInfo({ firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={guestInfo.lastName}
                  onChange={(e) => setGuestInfo({ lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={guestInfo.email}
                onChange={(e) => setGuestInfo({ email: e.target.value })}
                placeholder="john.doe@email.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo({ phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={guestInfo.nationality}
                  onChange={(e) => setGuestInfo({ nationality: e.target.value })}
                  placeholder="Lebanese"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                value={guestInfo.specialRequests}
                onChange={(e) => setGuestInfo({ specialRequests: e.target.value })}
                placeholder="Any special requests or preferences..."
                rows={3}
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <p className="text-sm text-slate-500">Total for {nights} night{nights !== 1 ? 's' : ''}</p>
                <p className="text-2xl font-bold text-slate-900">${totalPrice.toLocaleString()}</p>
              </div>
              <Button
                onClick={() => setStep('review')}
                disabled={!isDetailsValid}
                className="bg-[#8c7a6b] hover:bg-[#7a6a5d] px-8"
              >
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6 py-4">
            {/* Room Details */}
            <div className="bg-slate-50 rounded-xl p-5">
              <h3 className="font-semibold mb-4 text-lg">Room Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Room</span>
                  <span className="font-medium">{selectedRoom?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Room Number</span>
                  <span className="font-medium">{selectedRoom?.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Check-in</span>
                  <span className="font-medium">{checkIn ? format(checkIn, 'EEEE, MMM d, yyyy') : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Check-out</span>
                  <span className="font-medium">{checkOut ? format(checkOut, 'EEEE, MMM d, yyyy') : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Guests</span>
                  <span className="font-medium">{adults + children} ({adults} Adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''})</span>
                </div>
              </div>
            </div>

            {/* Guest Details */}
            <div className="bg-slate-50 rounded-xl p-5">
              <h3 className="font-semibold mb-4 text-lg">Guest Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name</span>
                  <span className="font-medium">{guestInfo.firstName} {guestInfo.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium">{guestInfo.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-medium">{guestInfo.phone}</span>
                </div>
                {guestInfo.nationality && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nationality</span>
                    <span className="font-medium">{guestInfo.nationality}</span>
                  </div>
                )}
                {guestInfo.specialRequests && (
                  <div className="pt-2 border-t">
                    <span className="text-slate-500 block mb-1">Special Requests</span>
                    <span className="font-medium">{guestInfo.specialRequests}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-[#8c7a6b]/10 rounded-xl p-5">
              <h3 className="font-semibold mb-4 text-lg">Price Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">${selectedRoom?.price} × {nights} night{nights !== 1 ? 's' : ''}</span>
                  <span className="font-medium">${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#8c7a6b]/20">
                  <span className="font-semibold text-base">Total</span>
                  <span className="font-bold text-xl text-[#8c7a6b]">${totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t gap-4">
              <Button
                variant="outline"
                onClick={() => setStep('details')}
                className="flex-1"
              >
                Back to Details
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-[#8c7a6b] hover:bg-[#7a6a5d]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="py-8 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h3>
              <p className="text-slate-500">Your booking has been confirmed.</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 text-left space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Confirmation Code</p>
                <p className="text-2xl font-mono font-bold text-[#8c7a6b]">{confirmationCode}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Room</p>
                  <p className="font-medium">{selectedRoom?.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Guest</p>
                  <p className="font-medium">{guestInfo.firstName} {guestInfo.lastName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Check-in</p>
                  <p className="font-medium">{checkIn ? format(checkIn, 'MMM d, yyyy') : '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Check-out</p>
                  <p className="font-medium">{checkOut ? format(checkOut, 'MMM d, yyyy') : '-'}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-slate-500 text-sm">Total Amount</p>
                <p className="text-2xl font-bold">${totalPrice.toLocaleString()}</p>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              A confirmation email has been sent to <strong>{guestInfo.email}</strong>
            </p>

            <Button onClick={handleClose} className="bg-[#8c7a6b] hover:bg-[#7a6a5d] w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
