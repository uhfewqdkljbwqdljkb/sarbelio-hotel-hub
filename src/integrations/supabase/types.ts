export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          event_type: string | null
          id: string
          related_id: string | null
          start_time: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          event_type?: string | null
          id?: string
          related_id?: string | null
          start_time: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          event_type?: string | null
          id?: string
          related_id?: string | null
          start_time?: string
          title?: string
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          balance: number | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
        }
        Insert: {
          account_type: Database["public"]["Enums"]["account_type"]
          balance?: number | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          balance?: number | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      concierge_services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"] | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          is_available: boolean | null
          name: string
          price: number | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["service_category"] | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_available?: boolean | null
          name: string
          price?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"] | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_available?: boolean | null
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      guests: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          last_stay: string | null
          loyalty_points: number | null
          loyalty_tier: Database["public"]["Enums"]["loyalty_tier"] | null
          nationality: string | null
          phone: string | null
          total_spent: number | null
          total_stays: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          last_stay?: string | null
          loyalty_points?: number | null
          loyalty_tier?: Database["public"]["Enums"]["loyalty_tier"] | null
          nationality?: string | null
          phone?: string | null
          total_spent?: number | null
          total_stays?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          last_stay?: string | null
          loyalty_points?: number | null
          loyalty_tier?: Database["public"]["Enums"]["loyalty_tier"] | null
          nationality?: string | null
          phone?: string | null
          total_spent?: number | null
          total_stays?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hotel_profile: {
        Row: {
          address: string | null
          check_in_time: string | null
          check_out_time: string | null
          city: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          star_rating: number | null
          timezone: string | null
          total_rooms: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          star_rating?: number | null
          timezone?: string | null
          total_rooms?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          star_rating?: number | null
          timezone?: string | null
          total_rooms?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      housekeeping_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["request_priority"] | null
          room_id: string | null
          room_number: string
          scheduled_for: string | null
          status: string | null
          task_type: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["request_priority"] | null
          room_id?: string | null
          room_number: string
          scheduled_for?: string | null
          status?: string | null
          task_type: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["request_priority"] | null
          room_id?: string | null
          room_number?: string
          scheduled_for?: string | null
          status?: string | null
          task_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "housekeeping_tasks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          integration_type:
            | Database["public"]["Enums"]["integration_type"]
            | null
          last_sync: string | null
          name: string
          status: Database["public"]["Enums"]["integration_status"] | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          integration_type?:
            | Database["public"]["Enums"]["integration_type"]
            | null
          last_sync?: string | null
          name: string
          status?: Database["public"]["Enums"]["integration_status"] | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          integration_type?:
            | Database["public"]["Enums"]["integration_type"]
            | null
          last_sync?: string | null
          name?: string
          status?: Database["public"]["Enums"]["integration_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          barcode: string | null
          category_id: string | null
          created_at: string | null
          destination: string | null
          id: string
          image_url: string | null
          last_restocked: string | null
          location: string | null
          max_quantity: number | null
          min_quantity: number | null
          name: string
          quantity: number | null
          sell_price: number | null
          sku: string | null
          supplier: string | null
          supplier_id: string | null
          unit: string | null
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          created_at?: string | null
          destination?: string | null
          id?: string
          image_url?: string | null
          last_restocked?: string | null
          location?: string | null
          max_quantity?: number | null
          min_quantity?: number | null
          name: string
          quantity?: number | null
          sell_price?: number | null
          sku?: string | null
          supplier?: string | null
          supplier_id?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          created_at?: string | null
          destination?: string | null
          id?: string
          image_url?: string | null
          last_restocked?: string | null
          location?: string | null
          max_quantity?: number | null
          min_quantity?: number | null
          name?: string
          quantity?: number | null
          sell_price?: number | null
          sku?: string | null
          supplier?: string | null
          supplier_id?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          customer_or_vendor: string
          due_date: string
          id: string
          invoice_number: string
          invoice_type: string
          items: Json | null
          paid_at: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_or_vendor: string
          due_date: string
          id?: string
          invoice_number: string
          invoice_type: string
          items?: Json | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_or_vendor?: string
          due_date?: string
          id?: string
          invoice_number?: string
          invoice_type?: string
          items?: Json | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      laundry_items: {
        Row: {
          completed_at: string | null
          created_at: string | null
          guest_name: string | null
          id: string
          item_type: string
          notes: string | null
          priority: Database["public"]["Enums"]["request_priority"] | null
          quantity: number | null
          received_at: string | null
          room_number: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          guest_name?: string | null
          id?: string
          item_type: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["request_priority"] | null
          quantity?: number | null
          received_at?: string | null
          room_number: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          guest_name?: string | null
          id?: string
          item_type?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["request_priority"] | null
          quantity?: number | null
          received_at?: string | null
          room_number?: string
          status?: string | null
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image: string | null
          is_available: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_available?: boolean | null
          name: string
          price?: number
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      minimarket_products: {
        Row: {
          barcode: string | null
          category: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          min_stock: number | null
          name: string
          price: number
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_stock?: number | null
          name: string
          price?: number
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_stock?: number | null
          name?: string
          price?: number
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      minimarket_sales: {
        Row: {
          id: string
          payment_method: string | null
          product_id: string | null
          quantity: number
          room_number: string | null
          sold_at: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: string
          payment_method?: string | null
          product_id?: string | null
          quantity?: number
          room_number?: string | null
          sold_at?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          id?: string
          payment_method?: string | null
          product_id?: string | null
          quantity?: number
          room_number?: string | null
          sold_at?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "minimarket_sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "minimarket_products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string | null
          name: string
          notes: string | null
          order_id: string | null
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          name: string
          notes?: string | null
          order_id?: string | null
          price: number
          quantity?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          name?: string
          notes?: string | null
          order_id?: string | null
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "pos_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_template_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          item_name: string
          quantity: number
          template_id: string | null
          total: number
          unit_cost: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          item_name: string
          quantity?: number
          template_id?: string | null
          total?: number
          unit_cost?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          item_name?: string
          quantity?: number
          template_id?: string | null
          total?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_template_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "order_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      order_templates: {
        Row: {
          created_at: string | null
          id: string
          name: string
          supplier_id: string | null
          supplier_name: string
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          supplier_id?: string | null
          supplier_name: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          supplier_id?: string | null
          supplier_name?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_templates_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_orders: {
        Row: {
          closed_at: string | null
          created_at: string | null
          guest_count: number | null
          guest_name: string | null
          id: string
          opened_at: string | null
          order_type: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          table_id: string | null
          table_number: string
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          guest_count?: number | null
          guest_name?: string | null
          id?: string
          opened_at?: string | null
          order_type?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          table_id?: string | null
          table_number: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          guest_count?: number | null
          guest_name?: string | null
          id?: string
          opened_at?: string | null
          order_type?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          table_id?: string | null
          table_number?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          item_name: string
          order_id: string | null
          quantity: number
          total: number
          unit_cost: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          item_name: string
          order_id?: string | null
          quantity?: number
          total?: number
          unit_cost?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          item_name?: string
          order_id?: string | null
          quantity?: number
          total?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          expected_delivery: string | null
          id: string
          invoice_id: string | null
          is_template: boolean | null
          notes: string | null
          order_number: string
          received_at: string | null
          status: string | null
          supplier_id: string | null
          supplier_name: string
          template_name: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expected_delivery?: string | null
          id?: string
          invoice_id?: string | null
          is_template?: boolean | null
          notes?: string | null
          order_number: string
          received_at?: string | null
          status?: string | null
          supplier_id?: string | null
          supplier_name: string
          template_name?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expected_delivery?: string | null
          id?: string
          invoice_id?: string | null
          is_template?: boolean | null
          notes?: string | null
          order_number?: string
          received_at?: string | null
          status?: string | null
          supplier_id?: string | null
          supplier_name?: string
          template_name?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          check_in: string
          check_out: string
          confirmation_code: string
          created_at: string | null
          guest_email: string | null
          guest_id: string | null
          guest_name: string
          guests_count: number
          id: string
          is_day_stay: boolean | null
          nights: number
          notes: string | null
          phone: string | null
          room_id: string | null
          room_name: string | null
          room_type_id: string | null
          source: Database["public"]["Enums"]["booking_source"] | null
          status: Database["public"]["Enums"]["reservation_status"] | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          check_in: string
          check_out: string
          confirmation_code: string
          created_at?: string | null
          guest_email?: string | null
          guest_id?: string | null
          guest_name: string
          guests_count?: number
          id?: string
          is_day_stay?: boolean | null
          nights?: number
          notes?: string | null
          phone?: string | null
          room_id?: string | null
          room_name?: string | null
          room_type_id?: string | null
          source?: Database["public"]["Enums"]["booking_source"] | null
          status?: Database["public"]["Enums"]["reservation_status"] | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          check_in?: string
          check_out?: string
          confirmation_code?: string
          created_at?: string | null
          guest_email?: string | null
          guest_id?: string | null
          guest_name?: string
          guests_count?: number
          id?: string
          is_day_stay?: boolean | null
          nights?: number
          notes?: string | null
          phone?: string | null
          room_id?: string | null
          room_name?: string | null
          room_type_id?: string | null
          source?: Database["public"]["Enums"]["booking_source"] | null
          status?: Database["public"]["Enums"]["reservation_status"] | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          capacity: number
          created_at: string | null
          current_order_id: string | null
          id: string
          status: Database["public"]["Enums"]["table_status"] | null
          table_number: string
          updated_at: string | null
          zone: Database["public"]["Enums"]["table_zone"] | null
        }
        Insert: {
          capacity?: number
          created_at?: string | null
          current_order_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["table_status"] | null
          table_number: string
          updated_at?: string | null
          zone?: Database["public"]["Enums"]["table_zone"] | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          current_order_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["table_status"] | null
          table_number?: string
          updated_at?: string | null
          zone?: Database["public"]["Enums"]["table_zone"] | null
        }
        Relationships: []
      }
      room_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_primary: boolean
          room_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean
          room_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_images_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          amenities: string[] | null
          base_price: number
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          max_occupancy: number
          name: string
          total_rooms: number
          updated_at: string | null
        }
        Insert: {
          amenities?: string[] | null
          base_price?: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          max_occupancy?: number
          name: string
          total_rooms?: number
          updated_at?: string | null
        }
        Update: {
          amenities?: string[] | null
          base_price?: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          max_occupancy?: number
          name?: string
          total_rooms?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      rooms: {
        Row: {
          amenities: string[] | null
          capacity: number
          cleaning_status: Database["public"]["Enums"]["cleaning_status"] | null
          created_at: string | null
          day_stay_price: number | null
          description: string | null
          floor: number
          id: string
          image_url: string | null
          name: string | null
          next_reservation: string | null
          price: number
          room_number: string
          room_type_id: string | null
          size: number | null
          status: Database["public"]["Enums"]["room_status"] | null
          updated_at: string | null
          weekday_price: number | null
          weekend_price: number | null
        }
        Insert: {
          amenities?: string[] | null
          capacity?: number
          cleaning_status?:
            | Database["public"]["Enums"]["cleaning_status"]
            | null
          created_at?: string | null
          day_stay_price?: number | null
          description?: string | null
          floor?: number
          id?: string
          image_url?: string | null
          name?: string | null
          next_reservation?: string | null
          price?: number
          room_number: string
          room_type_id?: string | null
          size?: number | null
          status?: Database["public"]["Enums"]["room_status"] | null
          updated_at?: string | null
          weekday_price?: number | null
          weekend_price?: number | null
        }
        Update: {
          amenities?: string[] | null
          capacity?: number
          cleaning_status?:
            | Database["public"]["Enums"]["cleaning_status"]
            | null
          created_at?: string | null
          day_stay_price?: number | null
          description?: string | null
          floor?: number
          id?: string
          image_url?: string | null
          name?: string | null
          next_reservation?: string | null
          price?: number
          room_number?: string
          room_type_id?: string | null
          size?: number | null
          status?: Database["public"]["Enums"]["room_status"] | null
          updated_at?: string | null
          weekday_price?: number | null
          weekend_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["service_category"] | null
          completed_at: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          guest_name: string
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["request_priority"] | null
          requested_at: string | null
          room_number: string
          scheduled_for: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["service_category"] | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          guest_name: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["request_priority"] | null
          requested_at?: string | null
          room_number: string
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["service_category"] | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          guest_name?: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["request_priority"] | null
          requested_at?: string | null
          room_number?: string
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          categories: string[] | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          rating: number | null
          total_orders: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          categories?: string[] | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          rating?: number | null
          total_orders?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          categories?: string[] | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          rating?: number | null
          total_orders?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_users: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          id: string
          last_login: string | null
          name: string
          role: Database["public"]["Enums"]["user_role"] | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          id?: string
          last_login?: string | null
          name: string
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string | null
          account_name: string | null
          amount: number
          category: string | null
          created_at: string | null
          date: string
          description: string
          id: string
          reference: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          account_id?: string | null
          account_name?: string | null
          amount: number
          category?: string | null
          created_at?: string | null
          date?: string
          description: string
          id?: string
          reference?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          account_id?: string | null
          account_name?: string | null
          amount?: number
          category?: string | null
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          reference?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_is_admin: { Args: { _user_id: string }; Returns: boolean }
      get_all_users_with_roles: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      account_type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE"
      app_role: "admin" | "fnb" | "housekeeping" | "reception"
      booking_source:
        | "DIRECT"
        | "WEBSITE"
        | "BOOKING_COM"
        | "EXPEDIA"
        | "AIRBNB"
        | "WALK_IN"
      cleaning_status: "CLEAN" | "DIRTY" | "IN_PROGRESS" | "INSPECTED"
      integration_status: "CONNECTED" | "DISCONNECTED" | "ERROR"
      integration_type:
        | "OTA"
        | "PAYMENT"
        | "PMS"
        | "CRM"
        | "ACCOUNTING"
        | "OTHER"
      invoice_status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"
      loyalty_tier: "STANDARD" | "SILVER" | "GOLD" | "PLATINUM"
      order_status: "OPEN" | "KITCHEN" | "SERVED" | "PAID"
      request_priority: "LOW" | "NORMAL" | "HIGH" | "URGENT"
      request_status:
        | "PENDING"
        | "CONFIRMED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED"
      reservation_status:
        | "PENDING"
        | "CONFIRMED"
        | "CHECKED_IN"
        | "CHECKED_OUT"
        | "CANCELLED"
        | "NO_SHOW"
      room_status:
        | "AVAILABLE"
        | "OCCUPIED"
        | "RESERVED"
        | "OUT_OF_ORDER"
        | "OUT_OF_SERVICE"
      service_category:
        | "TRANSPORT"
        | "SPA"
        | "TOUR"
        | "RESTAURANT"
        | "HOUSEKEEPING"
        | "MAINTENANCE"
        | "OTHER"
      table_status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING"
      table_zone: "INDOOR" | "TERRACE" | "BAR"
      transaction_type: "CREDIT" | "DEBIT"
      user_role: "ADMIN" | "MANAGER" | "STAFF" | "VIEWER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"],
      app_role: ["admin", "fnb", "housekeeping", "reception"],
      booking_source: [
        "DIRECT",
        "WEBSITE",
        "BOOKING_COM",
        "EXPEDIA",
        "AIRBNB",
        "WALK_IN",
      ],
      cleaning_status: ["CLEAN", "DIRTY", "IN_PROGRESS", "INSPECTED"],
      integration_status: ["CONNECTED", "DISCONNECTED", "ERROR"],
      integration_type: ["OTA", "PAYMENT", "PMS", "CRM", "ACCOUNTING", "OTHER"],
      invoice_status: ["DRAFT", "PENDING", "PAID", "OVERDUE", "CANCELLED"],
      loyalty_tier: ["STANDARD", "SILVER", "GOLD", "PLATINUM"],
      order_status: ["OPEN", "KITCHEN", "SERVED", "PAID"],
      request_priority: ["LOW", "NORMAL", "HIGH", "URGENT"],
      request_status: [
        "PENDING",
        "CONFIRMED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      reservation_status: [
        "PENDING",
        "CONFIRMED",
        "CHECKED_IN",
        "CHECKED_OUT",
        "CANCELLED",
        "NO_SHOW",
      ],
      room_status: [
        "AVAILABLE",
        "OCCUPIED",
        "RESERVED",
        "OUT_OF_ORDER",
        "OUT_OF_SERVICE",
      ],
      service_category: [
        "TRANSPORT",
        "SPA",
        "TOUR",
        "RESTAURANT",
        "HOUSEKEEPING",
        "MAINTENANCE",
        "OTHER",
      ],
      table_status: ["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING"],
      table_zone: ["INDOOR", "TERRACE", "BAR"],
      transaction_type: ["CREDIT", "DEBIT"],
      user_role: ["ADMIN", "MANAGER", "STAFF", "VIEWER"],
    },
  },
} as const
