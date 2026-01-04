import React, { useState } from 'react';
import { RestaurantTable, TableStatus } from '@/types/restaurant';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X,
  Users,
  Check
} from 'lucide-react';

interface FloorPlanEditorProps {
  tables: RestaurantTable[];
  onTablesChange: (tables: RestaurantTable[]) => void;
}

const FloorPlanEditor: React.FC<FloorPlanEditorProps> = ({
  tables,
  onTablesChange,
}) => {
  const [editingTable, setEditingTable] = useState<string | null>(null);
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTable, setNewTable] = useState({
    number: '',
    capacity: '4',
  });

  // Add table
  const handleAddTable = () => {
    if (!newTable.number.trim()) return;
    
    // Check for duplicate table numbers
    if (tables.some(t => t.number === newTable.number.trim())) {
      alert('Table number already exists');
      return;
    }
    
    const table: RestaurantTable = {
      id: `t_${Date.now()}`,
      number: newTable.number.trim(),
      capacity: parseInt(newTable.capacity) || 4,
      status: 'AVAILABLE',
      zone: 'INDOOR', // Single floor
    };
    
    onTablesChange([...tables, table]);
    setNewTable({ number: '', capacity: '4' });
    setShowAddTable(false);
  };

  // Delete table
  const handleDeleteTable = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (table?.status === 'OCCUPIED') {
      alert('Cannot delete an occupied table');
      return;
    }
    onTablesChange(tables.filter(t => t.id !== tableId));
  };

  // Update table
  const handleUpdateTable = (tableId: string, updates: Partial<RestaurantTable>) => {
    onTablesChange(tables.map(t => 
      t.id === tableId ? { ...t, ...updates } : t
    ));
  };

  // Set table status
  const handleSetStatus = (tableId: string, status: TableStatus) => {
    onTablesChange(tables.map(t => 
      t.id === tableId ? { ...t, status } : t
    ));
  };

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-50 border-green-200';
      case 'OCCUPIED': return 'bg-red-50 border-red-200';
      case 'RESERVED': return 'bg-blue-50 border-blue-200';
      case 'CLEANING': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-muted border-border';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">Floor Plan</h3>
          <p className="text-sm text-muted-foreground">Add, edit, or remove tables from your restaurant</p>
        </div>
        
        {!showAddTable && (
          <button
            onClick={() => setShowAddTable(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </button>
        )}
      </div>

      {/* Add Table Form */}
      {showAddTable && (
        <div className="mb-6 p-4 bg-secondary/50 rounded-xl border border-border">
          <h4 className="font-medium text-foreground mb-3">Add New Table</h4>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Table Number</label>
              <input
                type="text"
                value={newTable.number}
                onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                placeholder="e.g., 1, A1, VIP1"
                className="w-32 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Seats</label>
              <select
                value={newTable.capacity}
                onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                className="w-20 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleAddTable}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
              >
                Add Table
              </button>
              <button
                onClick={() => { setShowAddTable(false); setNewTable({ number: '', capacity: '4' }); }}
                className="px-4 py-2 bg-secondary rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No tables configured</p>
          <button
            onClick={() => setShowAddTable(true)}
            className="mt-2 text-primary hover:underline text-sm"
          >
            Add your first table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map(table => (
            <div
              key={table.id}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${getStatusColor(table.status)}
              `}
            >
              {editingTable === table.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    defaultValue={table.number}
                    className="w-full px-2 py-1 bg-card border border-border rounded text-sm text-center font-bold"
                    onBlur={(e) => handleUpdateTable(table.id, { number: e.target.value })}
                    autoFocus
                  />
                  <select
                    defaultValue={table.capacity}
                    onChange={(e) => handleUpdateTable(table.id, { capacity: parseInt(e.target.value) })}
                    className="w-full px-2 py-1 bg-card border border-border rounded text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => (
                      <option key={n} value={n}>{n} seats</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setEditingTable(null)}
                    className="w-full px-2 py-1 bg-primary text-primary-foreground rounded text-sm font-medium flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Table Number */}
                  <div className="text-2xl font-bold text-foreground text-center mb-2">
                    {table.number}
                  </div>
                  
                  {/* Capacity */}
                  <div className="flex items-center justify-center text-xs text-muted-foreground mb-3">
                    <Users className="w-3 h-3 mr-1" />
                    {table.capacity} seats
                  </div>
                  
                  {/* Status Selector */}
                  <select
                    value={table.status}
                    onChange={(e) => handleSetStatus(table.id, e.target.value as TableStatus)}
                    className={`
                      w-full px-2 py-1 rounded text-xs font-semibold text-center appearance-none cursor-pointer
                      ${table.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : ''}
                      ${table.status === 'OCCUPIED' ? 'bg-red-100 text-red-800' : ''}
                      ${table.status === 'RESERVED' ? 'bg-blue-100 text-blue-800' : ''}
                      ${table.status === 'CLEANING' ? 'bg-yellow-100 text-yellow-800' : ''}
                    `}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="CLEANING">CLEANING</option>
                  </select>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <button
                      onClick={() => setEditingTable(table.id)}
                      className="p-1.5 hover:bg-card/50 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      disabled={table.status === 'OCCUPIED'}
                      className="p-1.5 hover:bg-destructive/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div>Total Tables: <span className="font-semibold text-foreground">{tables.length}</span></div>
        <div>Total Capacity: <span className="font-semibold text-foreground">{tables.reduce((sum, t) => sum + t.capacity, 0)} seats</span></div>
        <div>Available: <span className="font-semibold text-green-600">{tables.filter(t => t.status === 'AVAILABLE').length}</span></div>
        <div>Reserved: <span className="font-semibold text-blue-600">{tables.filter(t => t.status === 'RESERVED').length}</span></div>
      </div>
    </div>
  );
};

export default FloorPlanEditor;
