import React, { useState, useEffect } from 'react';
import { MenuCategory, MenuItem } from '@/types/restaurant';
import { 
  useCreateMenuCategory, 
  useUpdateMenuCategory, 
  useDeleteMenuCategory,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem 
} from '@/hooks/useRestaurant';
import { toast } from 'sonner';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check
} from 'lucide-react';

interface MenuManagerProps {
  categories: MenuCategory[];
  menuItems: MenuItem[];
}

const EMOJI_OPTIONS = ['🥗', '🍽️', '🦐', '🍰', '🍹', '🍷', '🍕', '🍔', '🥩', '🍣', '🥘', '☕', '🍺', '🧁', '🥪'];

const MenuManager: React.FC<MenuManagerProps> = ({
  categories,
  menuItems,
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('🍽️');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  
  // New item form state
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
  });

  // Mutations
  const createCategory = useCreateMenuCategory();
  const updateCategory = useUpdateMenuCategory();
  const deleteCategory = useDeleteMenuCategory();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  // Set active category when categories load
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Add category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      await createCategory.mutateAsync({
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
      });
      toast.success('Category added successfully');
      setNewCategoryName('');
      setNewCategoryIcon('🍽️');
      setShowAddCategory(false);
    } catch (error) {
      toast.error('Failed to add category');
      console.error(error);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory.mutateAsync(categoryId);
      toast.success('Category deleted');
      if (activeCategory === categoryId) {
        setActiveCategory(categories.find(c => c.id !== categoryId)?.id || null);
      }
    } catch (error) {
      toast.error('Failed to delete category');
      console.error(error);
    }
  };

  // Update category
  const handleUpdateCategory = async (categoryId: string, name: string, icon: string) => {
    try {
      await updateCategory.mutateAsync({ id: categoryId, name, icon });
      setEditingCategory(null);
    } catch (error) {
      toast.error('Failed to update category');
      console.error(error);
    }
  };

  // Add menu item
  const handleAddItem = async () => {
    if (!newItem.name.trim() || !activeCategory) return;
    
    try {
      await createItem.mutateAsync({
        categoryId: activeCategory,
        name: newItem.name.trim(),
        description: newItem.description.trim(),
        price: parseFloat(newItem.price) || 0,
      });
      toast.success('Item added successfully');
      setNewItem({ name: '', description: '', price: '' });
      setShowAddItem(false);
    } catch (error) {
      toast.error('Failed to add item');
      console.error(error);
    }
  };

  // Delete menu item
  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem.mutateAsync(itemId);
      toast.success('Item deleted');
    } catch (error) {
      toast.error('Failed to delete item');
      console.error(error);
    }
  };

  // Update menu item
  const handleUpdateItem = async (itemId: string, updates: Partial<MenuItem>) => {
    try {
      await updateItem.mutateAsync({ 
        id: itemId, 
        name: updates.name,
        description: updates.description,
        price: updates.price,
        isAvailable: updates.isAvailable,
      });
    } catch (error) {
      toast.error('Failed to update item');
      console.error(error);
    }
  };

  // Toggle item availability
  const handleToggleAvailability = async (itemId: string, currentAvailability: boolean) => {
    try {
      await updateItem.mutateAsync({ id: itemId, isAvailable: !currentAvailability });
    } catch (error) {
      toast.error('Failed to update availability');
      console.error(error);
    }
  };

  const filteredItems = menuItems.filter(i => i.categoryId === activeCategory);

  return (
    <div className="flex h-full">
      {/* Categories Sidebar */}
      <div className="w-64 border-r border-border bg-secondary/30 flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground mb-3">Categories</h3>
          
          {showAddCategory ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                  className="w-14 px-2 py-2 bg-card border border-border rounded-lg text-center"
                >
                  {EMOJI_OPTIONS.map(emoji => (
                    <option key={emoji} value={emoji}>{emoji}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name"
                  className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddCategory}
                  disabled={createCategory.isPending}
                  className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {createCategory.isPending ? 'Adding...' : 'Add'}
                </button>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="px-3 py-2 bg-secondary rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCategory(true)}
              className="w-full px-3 py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Category
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No categories yet. Add your first category above.
            </div>
          ) : (
            categories.map(category => (
              <div
                key={category.id}
                className={`
                  group flex items-center justify-between p-3 rounded-lg cursor-pointer mb-1 transition-colors
                  ${activeCategory === category.id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'}
                `}
                onClick={() => setActiveCategory(category.id)}
              >
                {editingCategory === category.id ? (
                  <div className="flex items-center gap-2 flex-1" onClick={e => e.stopPropagation()}>
                    <select
                      defaultValue={category.icon}
                      onChange={(e) => handleUpdateCategory(category.id, category.name, e.target.value)}
                      className="w-10 bg-transparent text-center"
                    >
                      {EMOJI_OPTIONS.map(emoji => (
                        <option key={emoji} value={emoji}>{emoji}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      defaultValue={category.name}
                      className="flex-1 px-2 py-1 bg-card border border-border rounded text-sm"
                      onBlur={(e) => handleUpdateCategory(category.id, e.target.value, category.icon)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateCategory(category.id, e.currentTarget.value, category.icon);
                        }
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center">
                      <span className="mr-2">{category.icon}</span>
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({menuItems.filter(i => i.categoryId === category.id).length})
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingCategory(category.id); }}
                        className="p-1 hover:bg-secondary rounded"
                      >
                        <Edit2 className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                        className="p-1 hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">
            {categories.find(c => c.id === activeCategory)?.name || 'Menu Items'}
          </h3>
          
          {activeCategory && (
            <button
              onClick={() => setShowAddItem(true)}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {showAddItem && (
            <div className="mb-4 p-4 bg-secondary/50 rounded-xl border border-border">
              <h4 className="font-medium text-foreground mb-3">New Menu Item</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Item name"
                  className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="Price"
                  step="0.01"
                  className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Description (optional)"
                  className="md:col-span-2 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAddItem}
                  disabled={createItem.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {createItem.isPending ? 'Adding...' : 'Add Item'}
                </button>
                <button
                  onClick={() => { setShowAddItem(false); setNewItem({ name: '', description: '', price: '' }); }}
                  className="px-4 py-2 bg-secondary rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!activeCategory ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Create a category first to add items</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No items in this category</p>
              <button
                onClick={() => setShowAddItem(true)}
                className="mt-2 text-primary hover:underline text-sm"
              >
                Add your first item
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className={`
                    flex items-center justify-between p-4 bg-card rounded-xl border border-border
                    ${!item.isAvailable ? 'opacity-50' : ''}
                  `}
                >
                  {editingItem === item.id ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                      <input
                        type="text"
                        defaultValue={item.name}
                        className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
                        onBlur={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                      />
                      <input
                        type="text"
                        defaultValue={item.description}
                        className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
                        onBlur={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                      />
                      <input
                        type="number"
                        defaultValue={item.price}
                        step="0.01"
                        className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
                        onBlur={(e) => handleUpdateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                      />
                      <button
                        onClick={() => setEditingItem(null)}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Done
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-foreground">{item.name}</span>
                          {!item.isAvailable && (
                            <span className="ml-2 px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full">
                              Unavailable
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-foreground">${item.price.toFixed(2)}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              item.isAvailable 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                            }`}
                          >
                            {item.isAvailable ? 'Available' : 'Sold Out'}
                          </button>
                          <button
                            onClick={() => setEditingItem(item.id)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuManager;
