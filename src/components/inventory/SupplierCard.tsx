import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Supplier, InventoryItem } from '@/types/inventory';
import { categoryLabels, statusColors, getStockStatus } from './InventoryConstants';
import { Star, Edit, Trash2, ChevronDown, Package } from 'lucide-react';

interface SupplierCardProps {
  supplier: Supplier;
  supplierItems: InventoryItem[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}

export default function SupplierCard({
  supplier,
  supplierItems,
  onEdit,
  onDelete,
}: SupplierCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold">{supplier.name}</h3>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="h-4 w-4 fill-current" />
          <span className="text-sm">{supplier.rating.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>{supplier.email}</p>
        <p>{supplier.phone}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {supplier.categories.map(cat => (
            <Badge key={cat} variant="secondary" className="text-xs">
              {categoryLabels[cat]}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Products Dropdown */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products ({supplierItems.length})
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          {supplierItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              No products linked to this supplier
            </p>
          ) : (
            <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
              {supplierItems.map(item => {
                const status = getStockStatus(item.quantity, item.minStock);
                return (
                  <div key={item.id} className="p-2 text-sm flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground text-xs">{item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.unitCost.toFixed(2)}</p>
                      <span className={`px-1.5 py-0.5 rounded text-xs ${statusColors[status]}`}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
      
      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <p className="text-xs text-muted-foreground">{supplier.totalOrders} orders</p>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(supplier)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => onDelete(supplier.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
