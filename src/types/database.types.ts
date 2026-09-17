export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderType = 'PICKUP' | 'DELIVERY';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type UserRole = 'CUSTOMER' | 'ADMIN';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          icon: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          icon: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          icon?: string;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string;
          slug: string;
          category_id: string;
          name: string;
          price: number;
          description: string;
          image_url: string;
          is_popular: boolean;
          badge: string | null;
          caffeine: string | null;
          calories: string | null;
          is_available: boolean;
          is_customizable: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          category_id: string;
          name: string;
          price: number;
          description: string;
          image_url: string;
          is_popular?: boolean;
          badge?: string | null;
          caffeine?: string | null;
          calories?: string | null;
          is_available?: boolean;
          is_customizable?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          category_id?: string;
          name?: string;
          price?: number;
          description?: string;
          image_url?: string;
          is_popular?: boolean;
          badge?: string | null;
          caffeine?: string | null;
          calories?: string | null;
          is_available?: boolean;
          is_customizable?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'menu_items_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          }
        ];
      };
      customization_presets: {
        Row: {
          id: string;
          type: 'sugar' | 'ice' | 'size' | 'topping';
          name: string;
          label: string;
          value: string;
          price_delta: number;
          is_default: boolean;
          display_order: number;
        };
        Insert: {
          id?: string;
          type: 'sugar' | 'ice' | 'size' | 'topping';
          name: string;
          label: string;
          value: string;
          price_delta?: number;
          is_default?: boolean;
          display_order?: number;
        };
        Update: {
          id?: string;
          type?: 'sugar' | 'ice' | 'size' | 'topping';
          name?: string;
          label?: string;
          value?: string;
          price_delta?: number;
          is_default?: boolean;
          display_order?: number;
        };
        Relationships: [];
      };
      stores: {
        Row: {
          id: string;
          name: string;
          address: string;
          short_address: string;
          city: string;
          state: string;
          zip: string;
          phone: string;
          latitude: number;
          longitude: number;
          is_open: boolean;
          opening_time: string;
          closing_time: string;
          pickup_time_estimate: string;
          delivery_time_estimate: string;
          is_flagship: boolean;
          accepts_orders: boolean;
          delivery_radius_miles: number;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          short_address: string;
          city: string;
          state: string;
          zip: string;
          phone: string;
          latitude: number;
          longitude: number;
          is_open?: boolean;
          opening_time: string;
          closing_time: string;
          pickup_time_estimate: string;
          delivery_time_estimate: string;
          is_flagship?: boolean;
          accepts_orders?: boolean;
          delivery_radius_miles?: number;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          short_address?: string;
          city?: string;
          state?: string;
          zip?: string;
          phone?: string;
          latitude?: number;
          longitude?: number;
          is_open?: boolean;
          opening_time?: string;
          closing_time?: string;
          pickup_time_estimate?: string;
          delivery_time_estimate?: string;
          is_flagship?: boolean;
          accepts_orders?: boolean;
          delivery_radius_miles?: number;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          store_id: string;
          order_type: OrderType;
          status: OrderStatus;
          payment_status: PaymentStatus;
          subtotal: number;
          delivery_fee: number;
          discount_amount: number;
          tax_amount: number;
          tip_amount: number;
          total: number;
          promo_code_id: string | null;
          stripe_payment_intent_id: string | null;
          stripe_session_id: string | null;
          payment_method: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          delivery_address: Json | null;
          estimated_ready_time: string | null;
          special_instructions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          store_id: string;
          order_type: OrderType;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          subtotal: number;
          delivery_fee?: number;
          discount_amount?: number;
          tax_amount?: number;
          tip_amount?: number;
          total: number;
          promo_code_id?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          payment_method?: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          delivery_address?: Json | null;
          estimated_ready_time?: string | null;
          special_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          store_id?: string;
          order_type?: OrderType;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          subtotal?: number;
          delivery_fee?: number;
          discount_amount?: number;
          tax_amount?: number;
          tip_amount?: number;
          total?: number;
          promo_code_id?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          payment_method?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string;
          delivery_address?: Json | null;
          estimated_ready_time?: string | null;
          special_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_store_id_fkey';
            columns: ['store_id'];
            isOneToOne: false;
            referencedRelation: 'stores';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string;
          name: string;
          image_url: string;
          size: string;
          size_price: number;
          sugar_level: string;
          ice_level: string;
          toppings: Json;
          base_price: number;
          unit_price: number;
          quantity: number;
          total_price: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id: string;
          name: string;
          image_url: string;
          size: string;
          size_price: number;
          sugar_level: string;
          ice_level: string;
          toppings?: Json;
          base_price: number;
          unit_price: number;
          quantity: number;
          total_price: number;
          notes?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          menu_item_id?: string;
          name?: string;
          image_url?: string;
          size?: string;
          size_price?: number;
          sugar_level?: string;
          ice_level?: string;
          toppings?: Json;
          base_price?: number;
          unit_price?: number;
          quantity?: number;
          total_price?: number;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_menu_item_id_fkey';
            columns: ['menu_item_id'];
            isOneToOne: false;
            referencedRelation: 'menu_items';
            referencedColumns: ['id'];
          }
        ];
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          discount_percent: number;
          free_delivery: boolean;
          description: string;
          min_order_amount: number;
          max_uses: number | null;
          current_uses: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_percent: number;
          free_delivery?: boolean;
          description: string;
          min_order_amount?: number;
          max_uses?: number | null;
          current_uses?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount_percent?: number;
          free_delivery?: boolean;
          description?: string;
          min_order_amount?: number;
          max_uses?: number | null;
          current_uses?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      gift_cards: {
        Row: {
          id: string;
          code: string;
          sender_user_id: string | null;
          sender_name: string;
          recipient_name: string;
          recipient_email: string;
          recipient_phone: string | null;
          occasion: string | null;
          message: string | null;
          amount: number;
          balance: number;
          delivery_type: string;
          is_redeemed: boolean;
          redeemed_by_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          sender_user_id?: string | null;
          sender_name: string;
          recipient_name: string;
          recipient_email: string;
          recipient_phone?: string | null;
          occasion?: string | null;
          message?: string | null;
          amount: number;
          balance?: number;
          delivery_type?: string;
          is_redeemed?: boolean;
          redeemed_by_user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          sender_user_id?: string | null;
          sender_name?: string;
          recipient_name?: string;
          recipient_email?: string;
          recipient_phone?: string | null;
          occasion?: string | null;
          message?: string | null;
          amount?: number;
          balance?: number;
          delivery_type?: string;
          is_redeemed?: boolean;
          redeemed_by_user_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      loyalty_cards: {
        Row: {
          id: string;
          user_id: string;
          stamps: number;
          total_stamps_earned: number;
          total_rewards_redeemed: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stamps?: number;
          total_stamps_earned?: number;
          total_rewards_redeemed?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stamps?: number;
          total_stamps_earned?: number;
          total_rewards_redeemed?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      loyalty_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'STAMP_EARNED' | 'REWARD_REDEEMED';
          order_id: string | null;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'STAMP_EARNED' | 'REWARD_REDEEMED';
          order_id?: string | null;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'STAMP_EARNED' | 'REWARD_REDEEMED';
          order_id?: string | null;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      catering_requests: {
        Row: {
          id: string;
          user_id: string | null;
          request_type: 'PACKAGE' | 'CUSTOM';
          event_date: string;
          event_time: string;
          guest_count: number;
          venue_address: string;
          contact_name: string;
          contact_email: string;
          contact_phone: string;
          special_instructions: string | null;
          items: Json;
          total_estimate: number;
          status: 'PENDING' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED';
          admin_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          request_type: 'PACKAGE' | 'CUSTOM';
          event_date: string;
          event_time: string;
          guest_count: number;
          venue_address: string;
          contact_name: string;
          contact_email: string;
          contact_phone: string;
          special_instructions?: string | null;
          items: Json;
          total_estimate: number;
          status?: 'PENDING' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED';
          admin_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          request_type?: 'PACKAGE' | 'CUSTOM';
          event_date?: string;
          event_time?: string;
          guest_count?: number;
          venue_address?: string;
          contact_name?: string;
          contact_email?: string;
          contact_phone?: string;
          special_instructions?: string | null;
          items?: Json;
          total_estimate?: number;
          status?: 'PENDING' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED';
          admin_notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          is_active: boolean;
          subscribed_at: string;
          unsubscribe_token: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          is_active?: boolean;
          subscribed_at?: string;
          unsubscribe_token?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          is_active?: boolean;
          subscribed_at?: string;
          unsubscribe_token?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          is_read: boolean;
          data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          is_read?: boolean;
          data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string;
          is_read?: boolean;
          data?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      order_status: OrderStatus;
      order_type: OrderType;
      payment_status: PaymentStatus;
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
