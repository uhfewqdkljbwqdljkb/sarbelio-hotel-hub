import { useState } from 'react';
import { LaundryItem, LaundryCategory } from '@/types/housekeeping';
import { Package, AlertTriangle, ArrowUpDown, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface LaundryTrackerProps {
  items: LaundryItem[];
  onUpdateItem: (itemId: string, updates: Partial<LaundryItem>) => void;
}

const categoryLabels: Record<LaundryCategory, string> = {
  LINENS: 'Linens',
  TOWELS: 'Towels',
  UNIFORMS: 'Uniforms',
  GUEST_ITEMS: 'Guest Items',
};

const categoryColors: Record<LaundryCategory, string> = {
  LINENS: 'bg-blue-100 text-blue-700',
  TOWELS: 'bg-cyan-100 text-cyan-700',
  UNIFORMS: 'bg-purple-100 text-purple-700',
  GUEST_ITEMS: 'bg-pink-100 text-pink-700',
};

export function LaundryTracker({ items, onUpdateItem }: LaundryTrackerProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesLowStock = !showLowStockOnly || item.status === 'LOW_STOCK' || item.inStock < item.minStock;
    return matchesCategory && matchesLowStock;
  });

  const totalInStock = items.reduce((sum, item) => sum + item.inStock, 0);
  const totalInLaundry = items.reduce((sum, item) => sum + item.inLaundry, 0);
  const lowStockCount = items.filter(item => item.inStock < item.minStock).length;

  const handleAdjustStock = (itemId: string, adjustment: number, field: 'inStock' | 'inLaundry') => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const newValue = Math.max(0, item[field] + adjustment);
    const updates: Partial<LaundryItem> = {
      [field]: newValue,
      lastUpdated: new Date().toISOString(),
    };
    
    // Update status based on stock level
    if (field === 'inStock') {
      if (newValue === 0) {
        updates.status = 'OUT_OF_STOCK';
      } else if (newValue < item.minStock) {
        updates.status = 'LOW_STOCK';
      } else {
        updates.status = 'IN_STOCK';
      }
    }
    
    onUpdateItem(itemId, updates);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total In Stock</p>
              <p className="text-2xl font-bold">{totalInStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <ArrowUpDown className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Laundry</p>
              <p className="text-2xl font-bold">{totalInLaundry}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold">{lowStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={showLowStockOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={showLowStockOnly ? "bg-red-100 text-red-700 hover:bg-red-200 border-red-200" : ""}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Low Stock Only
        </Button>
      </div>

      {/* Inventory Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">In Stock</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">In Laundry</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Stock Level</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredItems.map((item) => {
              const stockPercentage = Math.min(100, (item.inStock / item.minStock) * 100);
              const isLowStock = item.inStock < item.minStock;
              
              return (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isLowStock && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[item.category]}`}>
                      {categoryLabels[item.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleAdjustStock(item.id, -1, 'inStock')}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className={`font-semibold min-w-[40px] text-center ${isLowStock ? 'text-red-600' : ''}`}>
                        {item.inStock}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleAdjustStock(item.id, 1, 'inStock')}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleAdjustStock(item.id, -1, 'inLaundry')}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-semibold min-w-[40px] text-center text-blue-600">
                        {item.inLaundry}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleAdjustStock(item.id, 1, 'inLaundry')}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3 min-w-[150px]">
                    <div className="space-y-1">
                      <Progress 
                        value={stockPercentage} 
                        className={`h-2 ${isLowStock ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`}
                      />
                      <p className="text-xs text-muted-foreground">
                        Min: {item.minStock}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Move items from laundry to stock
                        if (item.inLaundry > 0) {
                          onUpdateItem(item.id, {
                            inStock: item.inStock + item.inLaundry,
                            inLaundry: 0,
                            status: item.inStock + item.inLaundry >= item.minStock ? 'IN_STOCK' : 'LOW_STOCK',
                            lastUpdated: new Date().toISOString(),
                          });
                        }
                      }}
                      disabled={item.inLaundry === 0}
                    >
                      Return All
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No items match your filters
        </div>
      )}
    </div>
  );
}
