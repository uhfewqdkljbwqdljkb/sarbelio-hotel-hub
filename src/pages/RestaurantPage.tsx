import React, { useState } from 'react';
import { useRestaurantTables, usePosOrders, useMenuCategories, useMenuItems, useCreateOrder, useUpdateOrder, useUpdateTable } from '@/hooks/useRestaurant';
import { RestaurantTable, POSOrder, MenuCategory, MenuItem } from '@/types/restaurant';
import DashboardCard from '@/components/dashboard/DashboardCard';
import TableGrid from '@/components/restaurant/TableGrid';
import POSInterface from '@/components/restaurant/POSInterface';
import OrderList from '@/components/restaurant/OrderList';
import MenuManager from '@/components/restaurant/MenuManager';
import FloorPlanEditor from '@/components/restaurant/FloorPlanEditor';
import { 
  UtensilsCrossed, 
  Users, 
  DollarSign, 
  Clock,
  LayoutGrid,
  List,
  Settings,
  X,
  Loader2
} from 'lucide-react';

type ViewMode = 'FLOOR' | 'POS' | 'ORDERS' | 'SETTINGS';
type SettingsTab = 'MENU' | 'FLOOR';

const RestaurantPage: React.FC = () => {
  const [view, setView] = useState<ViewMode>('FLOOR');
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('MENU');
  const [activeTable, setActiveTable] = useState<RestaurantTable | null>(null);
  
  const { data: tables = [], isLoading: tablesLoading } = useRestaurantTables();
  const { data: orders = [], isLoading: ordersLoading } = usePosOrders();
  const { data: categories = [], isLoading: categoriesLoading } = useMenuCategories();
  const { data: menuItems = [], isLoading: menuItemsLoading } = useMenuItems();
  
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const updateTable = useUpdateTable();

  const isLoading = tablesLoading || ordersLoading || categoriesLoading || menuItemsLoading;

  // KPIs
  const activeOrdersCount = orders.filter(o => o.status !== 'PAID').length;
  const occupiedTables = tables.filter(t => t.status === 'OCCUPIED').length;
  const totalRevenueToday = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderTime = '18m';

  const handleTableClick = (table: RestaurantTable) => {
    setActiveTable(table);
    setView('POS');
  };

  const handleOrderClick = (order: POSOrder) => {
    const table = tables.find(t => t.id === order.tableId);
    if (table) {
      setActiveTable(table);
      setView('POS');
    }
  };

  const handleSaveOrder = async (updatedOrder: POSOrder) => {
    try {
      if (orders.find(o => o.id === updatedOrder.id)) {
        await updateOrder.mutateAsync({
          id: updatedOrder.id,
          status: updatedOrder.status,
          totalAmount: updatedOrder.totalAmount,
          guestCount: updatedOrder.guestCount,
          tableId: updatedOrder.tableId,
        });
      } else {
        await createOrder.mutateAsync({
          tableId: updatedOrder.tableId,
          tableNumber: updatedOrder.tableNumber,
          status: updatedOrder.status,
          totalAmount: updatedOrder.totalAmount,
          guestCount: updatedOrder.guestCount || 1,
          openedAt: updatedOrder.openedAt,
          items: updatedOrder.items,
        });
      }
    } catch (error) {
      console.error('Failed to save order:', error);
    }

    setView('FLOOR');
    setActiveTable(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show POS interface when a table is selected
  if (view === 'POS' && activeTable) {
    const existingOrder = orders.find(o => o.tableId === activeTable.id && o.status !== 'PAID');
    return (
      <div className="h-[calc(100vh-7rem)]">
        <POSInterface 
          table={activeTable} 
          existingOrder={existingOrder}
          categories={categories}
          menuItems={menuItems}
          onClose={() => {
            setView('FLOOR');
            setActiveTable(null);
          }} 
          onSaveOrder={handleSaveOrder}
        />
      </div>
    );
  }

  // Settings view
  if (view === 'SETTINGS') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Restaurant Settings</h2>
            <p className="text-muted-foreground">Configure your menu and floor plan</p>
          </div>
          <button
            onClick={() => setView('FLOOR')}
            className="px-4 py-2 bg-secondary rounded-lg text-sm font-medium flex items-center hover:bg-secondary/80"
          >
            <X className="w-4 h-4 mr-2" />
            Close Settings
          </button>
        </div>

        {/* Settings Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setSettingsTab('MENU')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              settingsTab === 'MENU' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Menu Management
          </button>
          <button
            onClick={() => setSettingsTab('FLOOR')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              settingsTab === 'FLOOR' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Floor Plan
          </button>
        </div>

        {/* Settings Content */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden min-h-[500px]">
          {settingsTab === 'MENU' ? (
            <MenuManager
              categories={categories}
              menuItems={menuItems}
            />
          ) : (
            <FloorPlanEditor
              tables={tables}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Restaurant & Bar</h2>
          <p className="text-muted-foreground">Sarbelio Kitchen • Floor Plan Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Service Active
          </span>
          
          {/* View Toggle */}
          <div className="flex bg-secondary p-1 rounded-lg">
            <button
              onClick={() => setView('FLOOR')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-all ${
                view === 'FLOOR' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-4 h-4 mr-1" />
              Floor
            </button>
            <button
              onClick={() => setView('ORDERS')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-all ${
                view === 'ORDERS' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-4 h-4 mr-1" />
              Orders
            </button>
          </div>
          <button
            onClick={() => setView('SETTINGS')}
            className="px-3 py-2 bg-secondary rounded-lg text-sm font-medium flex items-center hover:bg-secondary/80"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard className="flex items-center p-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full mr-4">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Orders</p>
            <p className="text-xl font-bold text-foreground">{activeOrdersCount}</p>
          </div>
        </DashboardCard>
        <DashboardCard className="flex items-center p-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Occupied Tables</p>
            <p className="text-xl font-bold text-foreground">
              {occupiedTables} <span className="text-xs text-muted-foreground font-normal">/ {tables.length}</span>
            </p>
          </div>
        </DashboardCard>
        <DashboardCard className="flex items-center p-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sales Today</p>
            <p className="text-xl font-bold text-foreground">${totalRevenueToday.toFixed(0)}</p>
          </div>
        </DashboardCard>
        <DashboardCard className="flex items-center p-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full mr-4">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg Wait Time</p>
            <p className="text-xl font-bold text-foreground">{avgOrderTime}</p>
          </div>
        </DashboardCard>
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        {tables.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No tables configured</p>
            <p className="text-sm">Go to Settings to add restaurant tables</p>
          </div>
        ) : view === 'FLOOR' ? (
          <TableGrid 
            tables={tables} 
            orders={orders} 
            onTableClick={handleTableClick} 
          />
        ) : (
          <OrderList 
            orders={orders} 
            onOrderClick={handleOrderClick} 
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          Available
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          Occupied
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          Reserved
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          Cleaning
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage;
