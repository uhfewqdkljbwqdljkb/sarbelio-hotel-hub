import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Bed, Flame, Tag, TrendingUp } from 'lucide-react';
import { Reservation } from '@/types';

interface EditAddonsDialogProps {
  reservation: Reservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    id: string;
    extraBedCount: number;
    extraWoodCount: number;
    discountAmount: number;
    topUpAmount: number;
    totalAmount: number;
  }) => Promise<void>;
  isUpdating?: boolean;
  rooms: Array<{ id: string; price: number; dayStayPrice?: number }>;
}

const EXTRA_BED_PRICE = 20;
const EXTRA_WOOD_PRICE = 15;

export function EditAddonsDialog({
  reservation,
  open,
  onOpenChange,
  onSave,
  isUpdating = false,
  rooms,
}: EditAddonsDialogProps) {
  const [extraBedCount, setExtraBedCount] = useState(0);
  const [extraWoodCount, setExtraWoodCount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [topUpAmount, setTopUpAmount] = useState(0);

  useEffect(() => {
    if (reservation) {
      setExtraBedCount(reservation.extraBedCount || 0);
      setExtraWoodCount(reservation.extraWoodCount || 0);
      setDiscountAmount(reservation.discountAmount || 0);
      setTopUpAmount(reservation.topUpAmount || 0);
    }
  }, [reservation]);

  if (!reservation) return null;

  // Calculate base room rate (total without add-ons)
  const currentExtras = (reservation.extraBedCount || 0) * EXTRA_BED_PRICE + 
                        (reservation.extraWoodCount || 0) * EXTRA_WOOD_PRICE;
  const currentDiscount = reservation.discountAmount || 0;
  const currentTopUp = reservation.topUpAmount || 0;
  const baseAmount = reservation.totalAmount - currentExtras + currentDiscount - currentTopUp;

  // Calculate new total with updated add-ons
  const newExtrasTotal = extraBedCount * EXTRA_BED_PRICE + extraWoodCount * EXTRA_WOOD_PRICE;
  const newTotal = Math.max(0, baseAmount + newExtrasTotal - discountAmount + topUpAmount);

  const handleSave = async () => {
    await onSave({
      id: reservation.id,
      extraBedCount,
      extraWoodCount,
      discountAmount,
      topUpAmount,
      totalAmount: newTotal,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Add-ons & Adjustments</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Guest & Reservation Info */}
          <div className="p-3 bg-secondary rounded-lg">
            <p className="font-semibold">{reservation.guestName}</p>
            <p className="text-sm text-muted-foreground">
              {reservation.roomName || 'Room'} • {reservation.nights} night(s)
            </p>
          </div>

          {/* Extra Charges */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Add-ons</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Bed className="w-4 h-4 text-muted-foreground" />
                  Extra Bed
                  <span className="text-xs text-muted-foreground ml-auto">${EXTRA_BED_PRICE} each</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={extraBedCount}
                  onChange={(e) => setExtraBedCount(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Flame className="w-4 h-4 text-muted-foreground" />
                  Extra Wood
                  <span className="text-xs text-muted-foreground ml-auto">${EXTRA_WOOD_PRICE} each</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={extraWoodCount}
                  onChange={(e) => setExtraWoodCount(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </div>
            </div>
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4 text-muted-foreground" />
              Discount
              <span className="text-xs text-muted-foreground ml-auto">Fixed $ amount</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                min="0"
                className="pl-7"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>
          </div>

          {/* Top-up */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              Top-up Amount
              <span className="text-xs text-muted-foreground ml-auto">Extra charge</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                min="0"
                className="pl-7"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-secondary p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Room Rate:</span>
              <span>${baseAmount.toLocaleString()}</span>
            </div>
            
            {extraBedCount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>+ Extra Bed ({extraBedCount}x ${EXTRA_BED_PRICE}):</span>
                <span>+${(extraBedCount * EXTRA_BED_PRICE).toLocaleString()}</span>
              </div>
            )}
            
            {extraWoodCount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>+ Extra Wood ({extraWoodCount}x ${EXTRA_WOOD_PRICE}):</span>
                <span>+${(extraWoodCount * EXTRA_WOOD_PRICE).toLocaleString()}</span>
              </div>
            )}

            {topUpAmount > 0 && (
              <div className="flex justify-between text-sm text-blue-600">
                <span>+ Top-up:</span>
                <span>+${topUpAmount.toLocaleString()}</span>
              </div>
            )}
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>− Discount:</span>
                <span>-${discountAmount.toLocaleString()}</span>
              </div>
            )}
            
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>New Total:</span>
              <span>${newTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={isUpdating}>
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}