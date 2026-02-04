import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { InventoryItem, Supplier, OrderTemplate, PurchaseOrderItem } from '@/types/inventory';
import { FormErrorSummary, getInputErrorClass } from '@/components/ui/form-error';

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  suppliers: Supplier[];
  templates: OrderTemplate[];
  onCreateOrder: (order: {
    supplierId: string;
    supplierName: string;
    items: PurchaseOrderItem[];
    totalAmount: number;
  }) => void;
}

export default function OrderFormDialog({
  open,
  onOpenChange,
  items,
  suppliers,
  templates,
  onCreateOrder,
}: OrderFormDialogProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [orderItems, setOrderItems] = useState<{ itemId: string; quantity: number }[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Get items for selected supplier
  const supplierItems = items.filter(item => item.supplierId === selectedSupplierId);
  
  useEffect(() => {
    if (!open) {
      setSelectedSupplierId('');
      setSelectedTemplateId('');
      setOrderItems([]);
      setSubmitted(false);
    }
  }, [open]);

  const errors = useMemo(() => {
    const errorMap: Record<string, string> = {};
    if (submitted) {
      if (!selectedSupplierId) {
        errorMap.supplier = 'Please select a supplier';
      }
      if (orderItems.length === 0) {
        errorMap.items = 'Please select at least one item';
      }
    }
    return errorMap;
  }, [selectedSupplierId, orderItems, submitted]);

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setSelectedSupplierId(template.supplierId);
      setOrderItems(template.items.map(i => ({ itemId: i.itemId, quantity: i.quantity })));
    }
  };

  const handleSupplierChange = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setSelectedTemplateId('');
    setOrderItems([]);
  };

  const toggleItem = (itemId: string) => {
    setOrderItems(prev => {
      const exists = prev.find(i => i.itemId === itemId);
      if (exists) {
        return prev.filter(i => i.itemId !== itemId);
      }
      return [...prev, { itemId, quantity: 1 }];
    });
  };

  const updateItemQty = (itemId: string, quantity: number) => {
    setOrderItems(prev => prev.map(i => i.itemId === itemId ? { ...i, quantity } : i));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, oi) => {
      const item = items.find(i => i.id === oi.itemId);
      return sum + (item ? item.unitCost * oi.quantity : 0);
    }, 0);
  };

  const handleCreate = () => {
    setSubmitted(true);
    
    if (!selectedSupplierId || orderItems.length === 0) return;
    
    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    const purchaseOrderItems: PurchaseOrderItem[] = orderItems.map(oi => {
      const item = items.find(i => i.id === oi.itemId)!;
      return {
        itemId: oi.itemId,
        itemName: item.name,
        quantity: oi.quantity,
        unitCost: item.unitCost,
        total: oi.quantity * item.unitCost,
      };
    });
    
    onCreateOrder({
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
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {Object.keys(errors).length > 0 && (
            <FormErrorSummary errors={errors} />
          )}
          
          {/* Template Selection */}
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label>Quick Order from Template</Label>
              <Select value={selectedTemplateId} onValueChange={handleSelectTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} - {t.supplierName} (€{t.totalAmount.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <div className="h-px bg-border flex-1" />
            <span className="text-sm text-muted-foreground">or select manually</span>
            <div className="h-px bg-border flex-1" />
          </div>
          
          {/* Supplier Selection */}
          <div className="space-y-2">
            <Label>Supplier *</Label>
            <Select value={selectedSupplierId} onValueChange={handleSupplierChange}>
              <SelectTrigger className={getInputErrorClass(!!errors.supplier)}>
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
            {errors.supplier && (
              <p className="text-xs text-destructive">{errors.supplier}</p>
            )}
          </div>
          
          {/* Items Selection */}
          {selectedSupplierId && (
            <div className="space-y-2">
              <Label>Select Items from {suppliers.find(s => s.id === selectedSupplierId)?.name} *</Label>
              <div className={`border rounded-lg max-h-[300px] overflow-y-auto ${errors.items ? 'border-destructive' : ''}`}>
                {supplierItems.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No items linked to this supplier. Add items with this supplier first.
                  </div>
                ) : (
                  supplierItems.map(item => {
                    const isSelected = orderItems.some(i => i.itemId === item.id);
                    const selectedItem = orderItems.find(i => i.itemId === item.id);
                    
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
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.name}</span>
                            {item.quantity <= item.minStock && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">Low Stock</span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            €{item.unitCost.toFixed(2)} / {item.unit} • Current: {item.quantity} {item.unit}
                          </div>
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
              {errors.items && (
                <p className="text-xs text-destructive">{errors.items}</p>
              )}
            </div>
          )}
          
          {/* Order Summary */}
          {orderItems.length > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-semibold">Order Summary</h4>
              <div className="space-y-1">
                {orderItems.map(oi => {
                  const item = items.find(i => i.id === oi.itemId);
                  if (!item) return null;
                  return (
                    <div key={oi.itemId} className="flex justify-between text-sm">
                      <span>{item.name} x {oi.quantity}</span>
                      <span>€{(item.unitCost * oi.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>€{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleCreate} 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create Purchase Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
