import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InventoryItem, Supplier, InventoryCategory, ItemDestination } from '@/types/inventory';
import { categoryLabels, destinationLabels } from './InventoryConstants';
import { Plus } from 'lucide-react';
import SupplierFormDialog from './SupplierFormDialog';

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: InventoryItem | null;
  suppliers: Supplier[];
  onSave: (item: Omit<InventoryItem, 'id' | 'status' | 'quantity'>) => void;
  onCreateSupplier: (supplier: Omit<Supplier, 'id' | 'totalOrders'>) => Promise<Supplier>;
}

export default function ItemFormDialog({
  open,
  onOpenChange,
  editingItem,
  suppliers,
  onSave,
  onCreateSupplier,
}: ItemFormDialogProps) {
  const [formData, setFormData] = useState({
    name: editingItem?.name || '',
    sku: editingItem?.sku || '',
    category: editingItem?.category || 'FOOD' as InventoryCategory,
    unit: editingItem?.unit || 'pcs',
    minStock: editingItem?.minStock || 10,
    maxStock: editingItem?.maxStock || 100,
    unitCost: editingItem?.unitCost || 0,
    sellPrice: editingItem?.sellPrice || 0,
    location: editingItem?.location || '',
    destination: editingItem?.destination || 'INTERNAL' as ItemDestination,
    supplierId: editingItem?.supplierId || '',
  });
  
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);

  const handleSave = () => {
    if (!formData.name.trim() || !formData.sku.trim()) return;
    
    const supplier = suppliers.find(s => s.id === formData.supplierId);
    
    onSave({
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      unit: formData.unit,
      minStock: formData.minStock,
      maxStock: formData.maxStock,
      unitCost: formData.unitCost,
      sellPrice: formData.sellPrice || undefined,
      location: formData.location || undefined,
      destination: formData.destination,
      supplierId: formData.supplierId || undefined,
      supplier: supplier?.name,
    });
    
    onOpenChange(false);
  };

  const handleCreateSupplier = async (supplier: Omit<Supplier, 'id' | 'totalOrders'>) => {
    const newSupplier = await onCreateSupplier(supplier);
    setFormData(prev => ({ ...prev, supplierId: newSupplier.id }));
    setSupplierDialogOpen(false);
  };

  // Reset form when dialog opens with different item
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && editingItem) {
      setFormData({
        name: editingItem.name,
        sku: editingItem.sku,
        category: editingItem.category,
        unit: editingItem.unit,
        minStock: editingItem.minStock,
        maxStock: editingItem.maxStock,
        unitCost: editingItem.unitCost,
        sellPrice: editingItem.sellPrice || 0,
        location: editingItem.location || '',
        destination: editingItem.destination,
        supplierId: editingItem.supplierId || '',
      });
    } else if (isOpen && !editingItem) {
      setFormData({
        name: '',
        sku: '',
        category: 'FOOD',
        unit: 'pcs',
        minStock: 10,
        maxStock: 100,
        unitCost: 0,
        sellPrice: 0,
        location: '',
        destination: 'INTERNAL',
        supplierId: '',
      });
    }
    onOpenChange(isOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add Inventory Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} 
                  placeholder="Item name" 
                />
              </div>
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Input 
                  value={formData.sku} 
                  onChange={(e) => setFormData(p => ({ ...p, sku: e.target.value }))} 
                  placeholder="SKU-001" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v: InventoryCategory) => setFormData(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input 
                  value={formData.unit} 
                  onChange={(e) => setFormData(p => ({ ...p, unit: e.target.value }))} 
                  placeholder="pcs, kg, liters" 
                />
              </div>
            </div>
            
            {/* Supplier Selection */}
            <div className="space-y-2">
              <Label>Supplier *</Label>
              <div className="flex gap-2">
                <Select value={formData.supplierId} onValueChange={(v) => setFormData(p => ({ ...p, supplierId: v }))}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setSupplierDialogOpen(true)}
                  title="Create new supplier"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Link this item to a supplier for ordering</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Stock *</Label>
                <Input 
                  type="number" 
                  value={formData.minStock} 
                  onChange={(e) => setFormData(p => ({ ...p, minStock: parseFloat(e.target.value) || 0 }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Max Stock</Label>
                <Input 
                  type="number" 
                  value={formData.maxStock} 
                  onChange={(e) => setFormData(p => ({ ...p, maxStock: parseFloat(e.target.value) || 0 }))} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit Cost (€)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={formData.unitCost} 
                  onChange={(e) => setFormData(p => ({ ...p, unitCost: parseFloat(e.target.value) || 0 }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Sell Price (€)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={formData.sellPrice} 
                  onChange={(e) => setFormData(p => ({ ...p, sellPrice: parseFloat(e.target.value) || 0 }))} 
                  placeholder="For minimarket/restaurant" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Destination *</Label>
                <Select value={formData.destination} onValueChange={(v: ItemDestination) => setFormData(p => ({ ...p, destination: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(destinationLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input 
                  value={formData.location} 
                  onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} 
                  placeholder="Storage room" 
                />
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Note: Quantity starts at 0 and can only be updated by receiving purchase orders.
              </p>
              <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <SupplierFormDialog
        open={supplierDialogOpen}
        onOpenChange={setSupplierDialogOpen}
        editingSupplier={null}
        onSave={handleCreateSupplier}
      />
    </>
  );
}
