import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Supplier, InventoryCategory } from '@/types/inventory';
import { categoryLabels } from './InventoryConstants';
import { z } from 'zod';
import { FormErrorSummary, getInputErrorClass } from '@/components/ui/form-error';

const supplierSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
});

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSupplier: Supplier | null;
  onSave: (supplier: Omit<Supplier, 'id' | 'totalOrders'>) => void;
}

export default function SupplierFormDialog({
  open,
  onOpenChange,
  editingSupplier,
  onSave,
}: SupplierFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    categories: [] as InventoryCategory[],
    rating: 5,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (editingSupplier) {
      setFormData({
        name: editingSupplier.name,
        email: editingSupplier.email,
        phone: editingSupplier.phone,
        address: editingSupplier.address,
        categories: editingSupplier.categories,
        rating: editingSupplier.rating,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        categories: [],
        rating: 5,
      });
    }
    setTouched({});
    setSubmitted(false);
  }, [editingSupplier, open]);

  const validationResult = useMemo(() => {
    return supplierSchema.safeParse(formData);
  }, [formData]);

  const errors = useMemo(() => {
    const errorMap: Record<string, string> = {};
    if (!validationResult.success) {
      validationResult.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (touched[field] || submitted) {
          errorMap[field] = err.message;
        }
      });
    }
    return errorMap;
  }, [validationResult, touched, submitted]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSave = () => {
    setSubmitted(true);
    
    if (!validationResult.success) {
      return;
    }
    
    onSave(formData);
    onOpenChange(false);
  };

  const toggleCategory = (category: InventoryCategory) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {Object.keys(errors).length > 0 && (
            <FormErrorSummary errors={errors} />
          )}
          
          <div className="space-y-2">
            <Label>Company Name *</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} 
              onBlur={() => handleBlur('name')}
              placeholder="Supplier name" 
              className={getInputErrorClass(!!errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} 
                onBlur={() => handleBlur('email')}
                placeholder="supplier@email.com" 
                className={getInputErrorClass(!!errors.email)}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} 
                placeholder="+1 555-0100" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea 
              value={formData.address} 
              onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} 
              placeholder="Full address" 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryLabels).map(([k, v]) => (
                <Badge 
                  key={k} 
                  variant={formData.categories.includes(k as InventoryCategory) ? "default" : "outline"} 
                  className="cursor-pointer" 
                  onClick={() => toggleCategory(k as InventoryCategory)}
                >
                  {v}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Rating (1-5)</Label>
            <Input 
              type="number" 
              min={1} 
              max={5} 
              step={0.1} 
              value={formData.rating} 
              onChange={(e) => setFormData(p => ({ ...p, rating: parseFloat(e.target.value) || 5 }))} 
              onBlur={() => handleBlur('rating')}
              className={getInputErrorClass(!!errors.rating)}
            />
            {errors.rating && (
              <p className="text-xs text-destructive">{errors.rating}</p>
            )}
          </div>
          
          <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
