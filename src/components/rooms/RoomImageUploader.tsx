import React, { useState } from 'react';
import { X, Image, Star, Loader2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { RoomImage } from '@/types';
import { uploadRoomImage } from '@/hooks/useRoomImages';
import { cn } from '@/lib/utils';

interface ImagePreview {
  id: string;
  url: string;
  file?: File;
  isPrimary: boolean;
  isUploading?: boolean;
}

interface RoomImageUploaderProps {
  images: ImagePreview[];
  onImagesChange: (images: ImagePreview[]) => void;
  existingImages?: RoomImage[];
  maxImages?: number;
}

const RoomImageUploader: React.FC<RoomImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      toast.error(`You can only add ${remainingSlots} more image(s)`);
      return;
    }

    const newImages: ImagePreview[] = [];
    
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB per image.`);
        continue;
      }

      const reader = new FileReader();
      const url = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newImages.push({
        id: `new-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        url,
        file,
        isPrimary: images.length === 0 && newImages.length === 0,
      });
    }

    onImagesChange([...images, ...newImages]);
  };

  const removeImage = (id: string) => {
    const filtered = images.filter((img) => img.id !== id);
    // If we removed the primary, make the first one primary
    if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    onImagesChange(filtered);
  };

  const setPrimary = (id: string) => {
    const updated = images.map((img) => ({
      ...img,
      isPrimary: img.id === id,
    }));
    onImagesChange(updated);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    onImagesChange(newImages);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">
        Room Images ({images.length}/{maxImages})
      </label>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, index) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative aspect-video rounded-lg overflow-hidden border border-border group cursor-move",
                img.isPrimary && "ring-2 ring-primary",
                draggedIndex === index && "opacity-50"
              )}
            >
              <img
                src={img.url}
                alt={`Room image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {img.isUploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}

              {/* Drag Handle */}
              <div className="absolute top-1 left-1 p-1 bg-background/80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-3 h-3 text-muted-foreground" />
              </div>

              {/* Primary Badge */}
              {img.isPrimary && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Primary
                </div>
              )}

              {/* Actions */}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(img.id)}
                    className="p-1 bg-background/80 text-muted-foreground hover:text-primary rounded"
                    title="Set as primary"
                  >
                    <Star className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="p-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
          <div className="flex flex-col items-center justify-center py-4">
            <Image className="w-6 h-6 mb-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB each</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
        </label>
      )}

      {images.length > 1 && (
        <p className="text-xs text-muted-foreground">
          Drag images to reorder. The primary image will be shown as the main room photo.
        </p>
      )}
    </div>
  );
};

export default RoomImageUploader;
