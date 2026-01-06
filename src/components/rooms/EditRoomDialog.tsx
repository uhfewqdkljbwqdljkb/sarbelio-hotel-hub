import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateRoom } from '@/hooks/useRooms';
import { supabase } from '@/integrations/supabase/client';
import { Room } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, X, Image, Plus } from 'lucide-react';

const COMMON_AMENITIES = [
  'WiFi',
  'TV',
  'Air Conditioning',
  'Mini Bar',
  'Room Service',
  'Balcony',
  'Mountain View',
  'Fireplace',
  'Kitchen',
  'Jacuzzi',
  'Safe',
  'Hair Dryer',
];

const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  name: z.string().min(1, 'Room name is required'),
  floor: z.coerce.number().min(1, 'Floor must be at least 1'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  size: z.coerce.number().min(0, 'Size must be positive'),
  description: z.string().optional(),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface EditRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
}

const EditRoomDialog: React.FC<EditRoomDialogProps> = ({ open, onOpenChange, room }) => {
  const updateRoom = useUpdateRoom();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState('');

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: '',
      name: '',
      floor: 1,
      price: 100,
      capacity: 2,
      size: 300,
      description: '',
    },
  });

  // Reset form when room changes
  useEffect(() => {
    if (room && open) {
      form.reset({
        roomNumber: room.roomNumber,
        name: room.name,
        floor: room.floor,
        price: room.price,
        capacity: room.capacity,
        size: room.size || 0,
        description: room.description || '',
      });
      setSelectedAmenities(room.amenities || []);
      setImagePreview(room.imageUrl !== '/placeholder.svg' ? room.imageUrl : null);
      setImageFile(null);
    }
  }, [room, open, form]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !selectedAmenities.includes(customAmenity.trim())) {
      setSelectedAmenities(prev => [...prev, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setSelectedAmenities(prev => prev.filter(a => a !== amenity));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `rooms/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('room-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('room-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const onSubmit = async (data: RoomFormData) => {
    if (!room) return;
    
    try {
      setUploading(true);
      let imageUrl: string | undefined = room.imageUrl;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile) || undefined;
      } else if (!imagePreview) {
        imageUrl = undefined;
      }

      await updateRoom.mutateAsync({
        id: room.id,
        roomNumber: data.roomNumber,
        name: data.name,
        floor: data.floor,
        price: data.price,
        capacity: data.capacity,
        size: data.size,
        description: data.description || '',
        amenities: selectedAmenities.length > 0 ? selectedAmenities : ['WiFi', 'TV', 'Air Conditioning'],
        imageUrl,
      });
      toast.success('Room updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update room');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Room Image</label>
              {imagePreview ? (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                  <img 
                    src={imagePreview} 
                    alt="Room preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Image className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                      <Input placeholder="101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Deluxe Ocean Suite" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price/Night ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size (sqft)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="A beautiful room with mountain views..." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Room Features / Amenities */}
            <div>
              <label className="block text-sm font-medium mb-3">Room Features</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {COMMON_AMENITIES.map((amenity) => (
                  <label 
                    key={amenity}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Checkbox 
                      checked={selectedAmenities.includes(amenity)}
                      onCheckedChange={() => toggleAmenity(amenity)}
                    />
                    <span className="text-muted-foreground">{amenity}</span>
                  </label>
                ))}
              </div>
              
              {/* Custom amenity input */}
              <div className="flex gap-2">
                <Input 
                  placeholder="Add custom feature..."
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={addCustomAmenity}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Selected custom amenities */}
              {selectedAmenities.filter(a => !COMMON_AMENITIES.includes(a)).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedAmenities
                    .filter(a => !COMMON_AMENITIES.includes(a))
                    .map((amenity) => (
                      <span 
                        key={amenity}
                        className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                      >
                        {amenity}
                        <button 
                          type="button" 
                          onClick={() => removeAmenity(amenity)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateRoom.isPending || uploading}>
                {(updateRoom.isPending || uploading) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoomDialog;