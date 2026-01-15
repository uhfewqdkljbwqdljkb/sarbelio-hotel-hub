import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Supplier, InventoryCategory } from '@/types/inventory';
import { categoryLabels } from './InventoryConstants';

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
  }, [editingSupplier, open]);

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) return;
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
          <div className="space-y-2">
            <Label>Company Name *</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} 
              placeholder="Supplier name" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} 
                placeholder="supplier@email.com" 
              />
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
            />
          </div>
          
          <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
