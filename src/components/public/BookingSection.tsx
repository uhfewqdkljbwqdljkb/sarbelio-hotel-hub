import React, { useState } from 'react';
import { CalendarDays, Users, Mail, Phone, User, MessageSquare, CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const roomTypes = [
  { id: 'classic', name: 'Classic Mountain Room', price: 120 },
  { id: 'superior', name: 'Superior Alpine Suite', price: 195 },
  { id: 'family', name: 'Family Mountain Lodge', price: 280 },
  { id: 'deluxe', name: 'Deluxe Ski Chalet', price: 350 },
];

const BookingSection: React.FC = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    checkIn: new Date(),
    checkOut: addDays(new Date(), 2),
    roomType: '',
    guests: '2',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const selectedRoom = roomTypes.find(r => r.id === formData.roomType);
  const nights = formData.checkIn && formData.checkOut 
    ? differenceInDays(formData.checkOut, formData.checkIn) 
    : 0;
  const totalPrice = selectedRoom ? selectedRoom.price * nights : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Booking Request Submitted!',
      description: 'We will confirm your reservation via email within 24 hours.',
    });
    setStep(3);
  };

  return (
    <section id="booking" className="py-24 bg-foreground text-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Reservations</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4">
            Book Your Mountain Escape
          </h2>
          <p className="text-background/70 mt-4 text-lg">
            Reserve your stay at Sarbelio Hotel and start planning your perfect mountain getaway.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    s <= step ? 'bg-primary text-primary-foreground' : 'bg-background/20 text-background/50'
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 rounded ${s < step ? 'bg-primary' : 'bg-background/20'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <div className="bg-background/5 backdrop-blur-sm rounded-2xl p-8 border border-background/10">
              <h3 className="text-xl font-bold mb-6">Select Your Stay Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Check-in */}
                <div>
                  <label className="text-sm font-medium text-background/70 mb-2 block">Check-in Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center gap-3 p-4 bg-background/10 rounded-xl hover:bg-background/20 transition-colors text-left">
                        <CalendarDays className="w-5 h-5 text-primary" />
                        <span>{format(formData.checkIn, 'MMMM dd, yyyy')}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.checkIn}
                        onSelect={(date) => date && setFormData({ ...formData, checkIn: date })}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Check-out */}
                <div>
                  <label className="text-sm font-medium text-background/70 mb-2 block">Check-out Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center gap-3 p-4 bg-background/10 rounded-xl hover:bg-background/20 transition-colors text-left">
                        <CalendarDays className="w-5 h-5 text-primary" />
                        <span>{format(formData.checkOut, 'MMMM dd, yyyy')}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.checkOut}
                        onSelect={(date) => date && setFormData({ ...formData, checkOut: date })}
                        disabled={(date) => date <= formData.checkIn}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Room Type */}
                <div>
                  <label className="text-sm font-medium text-background/70 mb-2 block">Room Type</label>
                  <Select
                    value={formData.roomType}
                    onValueChange={(value) => setFormData({ ...formData, roomType: value })}
                  >
                    <SelectTrigger className="w-full bg-background/10 border-0 text-background">
                      <SelectValue placeholder="Select a room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name} - ${room.price}/night
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Guests */}
                <div>
                  <label className="text-sm font-medium text-background/70 mb-2 block">Number of Guests</label>
                  <Select
                    value={formData.guests}
                    onValueChange={(value) => setFormData({ ...formData, guests: value })}
                  >
                    <SelectTrigger className="w-full bg-background/10 border-0 text-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Guest{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Summary */}
              {selectedRoom && nights > 0 && (
                <div className="mt-8 p-6 bg-primary/20 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{selectedRoom.name}</h4>
                      <p className="text-sm text-background/70">{nights} night{nights > 1 ? 's' : ''} • {formData.guests} guest{parseInt(formData.guests) > 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${totalPrice}</div>
                      <div className="text-sm text-background/70">Total</div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setStep(2)}
                disabled={!formData.roomType || nights <= 0}
                className="w-full mt-6 bg-primary hover:bg-primary-600 text-primary-foreground"
                size="lg"
              >
                Continue to Guest Details
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="bg-background/5 backdrop-blur-sm rounded-2xl p-8 border border-background/10">
              <h3 className="text-xl font-bold mb-6">Guest Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-background/70 mb-2 block">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-background/40" />
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="pl-10 bg-background/10 border-0 text-background placeholder:text-background/40"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-background/70 mb-2 block">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-background/40" />
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="pl-10 bg-background/10 border-0 text-background placeholder:text-background/40"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-background/70 mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-background/40" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 bg-background/10 border-0 text-background placeholder:text-background/40"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-background/70 mb-2 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-background/40" />
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 bg-background/10 border-0 text-background placeholder:text-background/40"
                      placeholder="+961 XX XXX XXX"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-background/70 mb-2 block">Special Requests (Optional)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-background/40" />
                    <Textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      className="pl-10 bg-background/10 border-0 text-background placeholder:text-background/40 min-h-[100px]"
                      placeholder="Any special requests or preferences..."
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-8 p-6 bg-primary/20 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{selectedRoom?.name}</h4>
                    <p className="text-sm text-background/70">
                      {format(formData.checkIn, 'MMM dd')} - {format(formData.checkOut, 'MMM dd, yyyy')} • {nights} night{nights > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${totalPrice}</div>
                    <div className="text-sm text-background/70">Total</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-background/20 text-background hover:bg-background/10"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-600 text-primary-foreground"
                  size="lg"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Complete Booking
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="bg-background/5 backdrop-blur-sm rounded-2xl p-12 border border-background/10 text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Booking Request Submitted!</h3>
              <p className="text-background/70 max-w-md mx-auto mb-8">
                Thank you for choosing Sarbelio Hotel. We will review your reservation and send a confirmation email to <strong>{formData.email}</strong> within 24 hours.
              </p>
              <div className="bg-background/10 rounded-xl p-6 max-w-md mx-auto">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-background/70">Room</span>
                    <span className="font-medium">{selectedRoom?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-background/70">Check-in</span>
                    <span className="font-medium">{format(formData.checkIn, 'MMMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-background/70">Check-out</span>
                    <span className="font-medium">{format(formData.checkOut, 'MMMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-background/70">Guests</span>
                    <span className="font-medium">{formData.guests}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-background/10">
                    <span className="text-background/70">Total</span>
                    <span className="text-xl font-bold">${totalPrice}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => { setStep(1); setFormData({ ...formData, firstName: '', lastName: '', email: '', phone: '', specialRequests: '' }); }}
                className="mt-8 bg-primary hover:bg-primary-600 text-primary-foreground"
              >
                Make Another Booking
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
