import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateRoom } from '@/hooks/useRooms';
import { useRoomImages, useCreateRoomImage, useDeleteRoomImage, uploadRoomImage } from '@/hooks/useRoomImages';
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
import { Loader2, X, Plus } from 'lucide-react';
import RoomImageUploader from './RoomImageUploader';

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
  weekdayPrice: z.coerce.number().min(0, 'Price must be positive').optional().or(z.literal('')),
  weekendPrice: z.coerce.number().min(0, 'Price must be positive').optional().or(z.literal('')),
  dayStayPrice: z.coerce.number().min(0, 'Price must be positive').optional().or(z.literal('')),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  size: z.coerce.number().min(0, 'Size must be positive'),
  description: z.string().optional(),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface ImagePreview {
  id: string;
  url: string;
  file?: File;
  isPrimary: boolean;
  isUploading?: boolean;
  isExisting?: boolean;
}

interface EditRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
}

const EditRoomDialog: React.FC<EditRoomDialogProps> = ({ open, onOpenChange, room }) => {
  const updateRoom = useUpdateRoom();
  const createRoomImage = useCreateRoomImage();
  const deleteRoomImage = useDeleteRoomImage();
  const { data: existingImages } = useRoomImages(room?.id);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: '',
      name: '',
      floor: 1,
      price: 100,
      weekdayPrice: '',
      weekendPrice: '',
      dayStayPrice: '',
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
        weekdayPrice: room.weekdayPrice || '',
        weekendPrice: room.weekendPrice || '',
        dayStayPrice: room.dayStayPrice || '',
        capacity: room.capacity,
        size: room.size || 0,
        description: room.description || '',
      });
      setSelectedAmenities(room.amenities || []);
      setDeletedImageIds([]);
    }
  }, [room, open, form]);

  // Load existing images
  useEffect(() => {
    if (existingImages && existingImages.length > 0 && open) {
      const mappedImages: ImagePreview[] = existingImages.map((img) => ({
        id: img.id,
        url: img.imageUrl,
        isPrimary: img.isPrimary,
        isExisting: true,
      }));
      setImages(mappedImages);
    } else if (room && open && room.imageUrl && room.imageUrl !== '/placeholder.svg') {
      // Fallback to single image if no room_images records exist
      setImages([{
        id: 'legacy-image',
        url: room.imageUrl,
        isPrimary: true,
        isExisting: true,
      }]);
    } else if (open) {
      setImages([]);
    }
  }, [existingImages, room, open]);

  const handleImagesChange = (newImages: ImagePreview[]) => {
    // Track deleted existing images
    const currentIds = new Set(newImages.map(img => img.id));
    const newlyDeletedIds = images
      .filter(img => img.isExisting && !currentIds.has(img.id))
      .map(img => img.id);
    
    setDeletedImageIds(prev => [...prev, ...newlyDeletedIds]);
    setImages(newImages);
  };

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

  const onSubmit = async (data: RoomFormData) => {
    if (!room) return;
    
    try {
      setUploading(true);

      // Delete removed images
      for (const imageId of deletedImageIds) {
        if (imageId !== 'legacy-image') {
          await deleteRoomImage.mutateAsync({ id: imageId, roomId: room.id });
        }
      }

      // Upload new images and create records
      const newImages = images.filter(img => img.file);
      for (let i = 0; i < newImages.length; i++) {
        const img = newImages[i];
        if (img.file) {
          const url = await uploadRoomImage(img.file);
          await createRoomImage.mutateAsync({
            roomId: room.id,
            imageUrl: url,
            displayOrder: images.indexOf(img),
            isPrimary: img.isPrimary,
          });
        }
      }

      // Find primary image for main image_url
      const primaryImage = images.find(img => img.isPrimary);
      let mainImageUrl = room.imageUrl;
      
      if (primaryImage) {
        if (primaryImage.file) {
          // Already uploaded above, find it
          mainImageUrl = await uploadRoomImage(primaryImage.file);
        } else if (primaryImage.isExisting) {
          mainImageUrl = primaryImage.url;
        }
      } else if (images.length === 0) {
        mainImageUrl = undefined;
      }

      await updateRoom.mutateAsync({
        id: room.id,
        roomNumber: data.roomNumber,
        name: data.name,
        floor: data.floor,
        price: data.price,
        weekdayPrice: data.weekdayPrice ? Number(data.weekdayPrice) : undefined,
        weekendPrice: data.weekendPrice ? Number(data.weekendPrice) : undefined,
        dayStayPrice: data.dayStayPrice ? Number(data.dayStayPrice) : undefined,
        capacity: data.capacity,
        size: data.size,
        description: data.description || '',
        amenities: selectedAmenities.length > 0 ? selectedAmenities : ['WiFi', 'TV', 'Air Conditioning'],
        imageUrl: mainImageUrl,
      });
      
      toast.success('Room updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update room:', error);
      toast.error('Failed to update room');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Multi-Image Upload */}
            <RoomImageUploader
              images={images}
              onImagesChange={handleImagesChange}
              maxImages={10}
            />

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

            {/* Pricing Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">Pricing</label>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Base Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dayStayPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Day Stay ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Optional" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weekdayPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Weekday ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Optional" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weekendPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Weekend ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Optional" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave optional prices blank to use base price. Day stay is for daytime-only bookings.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
