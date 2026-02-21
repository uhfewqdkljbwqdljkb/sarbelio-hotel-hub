import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { InventoryItem, Supplier, PurchaseOrderItem } from '@/types/inventory';

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  suppliers: Supplier[];
  onSave: (template: {
    name: string;
    supplierId: string;
    supplierName: string;
    items: PurchaseOrderItem[];
    totalAmount: number;
  }) => void;
}

export default function TemplateFormDialog({
  open,
  onOpenChange,
  items,
  suppliers,
  onSave,
}: TemplateFormDialogProps) {
  const [templateName, setTemplateName] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [templateItems, setTemplateItems] = useState<{ itemId: string; quantity: number }[]>([]);

  // Get items for selected supplier
  const supplierItems = items.filter(item => item.supplierId === selectedSupplierId);

  useEffect(() => {
    if (!open) {
      setTemplateName('');
      setSelectedSupplierId('');
      setTemplateItems([]);
    }
  }, [open]);

  const handleSupplierChange = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setTemplateItems([]);
  };

  const toggleItem = (itemId: string) => {
    setTemplateItems(prev => {
      const exists = prev.find(i => i.itemId === itemId);
      if (exists) {
        return prev.filter(i => i.itemId !== itemId);
      }
      return [...prev, { itemId, quantity: 1 }];
    });
  };

  const updateItemQty = (itemId: string, quantity: number) => {
    setTemplateItems(prev => prev.map(i => i.itemId === itemId ? { ...i, quantity } : i));
  };

  const calculateTotal = () => {
    return templateItems.reduce((sum, ti) => {
      const item = items.find(i => i.id === ti.itemId);
      return sum + (item ? item.unitCost * ti.quantity : 0);
    }, 0);
  };

  const handleSave = () => {
    if (!templateName.trim() || !selectedSupplierId || templateItems.length === 0) return;
    
    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    const purchaseOrderItems: PurchaseOrderItem[] = templateItems.map(ti => {
      const item = items.find(i => i.id === ti.itemId)!;
      return {
        itemId: ti.itemId,
        itemName: item.name,
        quantity: ti.quantity,
        unitCost: item.unitCost,
        total: ti.quantity * item.unitCost,
      };
    });
    
    onSave({
      name: templateName,
      supplierId: selectedSupplierId,
      supplierName: supplier?.name || '',
      items: purchaseOrderItems,
      totalAmount: calculateTotal(),
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Order Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Template Name *</Label>
            <Input 
              value={templateName} 
              onChange={(e) => setTemplateName(e.target.value)} 
              placeholder="Weekly Food Order" 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Supplier *</Label>
            <Select value={selectedSupplierId} onValueChange={handleSupplierChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({items.filter(i => i.supplierId === s.id).length} products)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedSupplierId && (
            <div className="space-y-2">
              <Label>Select Items</Label>
              <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                {supplierItems.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No items linked to this supplier.
                  </div>
                ) : (
                  supplierItems.map(item => {
                    const isSelected = templateItems.some(i => i.itemId === item.id);
                    const selectedItem = templateItems.find(i => i.itemId === item.id);
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/30 ${isSelected ? 'bg-primary/5' : ''}`}
                      >
                        <Checkbox 
                          checked={isSelected} 
                          onCheckedChange={() => toggleItem(item.id)} 
                        />
                        <div className="flex-1">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ${item.unitCost.toFixed(2)} / {item.unit}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Qty:</Label>
                            <Input 
                              type="number" 
                              className="w-20" 
                              min={1} 
                              value={selectedItem?.quantity || 1} 
                              onChange={(e) => updateItemQty(item.id, parseInt(e.target.value) || 1)} 
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          
          {templateItems.length > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">
                Template Total: ${calculateTotal().toFixed(2)} ({templateItems.length} items)
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleSave} 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!templateName.trim() || !selectedSupplierId || templateItems.length === 0}
          >
            Save Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
