
import { Database as OriginalDatabase } from "@/integrations/supabase/types";

// Extend the original Database type with our subscribers table
export interface ExtendedDatabase extends OriginalDatabase {
  public: {
    Tables: {
      subscribers: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          stripe_customer_id: string | null;
          subscribed: boolean;
          subscription_tier: string | null;
          subscription_end: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          stripe_customer_id?: string | null;
          subscribed?: boolean;
          subscription_tier?: string | null;
          subscription_end?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          stripe_customer_id?: string | null;
          subscribed?: boolean;
          subscription_tier?: string | null;
          subscription_end?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscribers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    } & OriginalDatabase["public"]["Tables"];
    Views: OriginalDatabase["public"]["Views"];
    Functions: OriginalDatabase["public"]["Functions"];
    Enums: OriginalDatabase["public"]["Enums"];
    CompositeTypes: OriginalDatabase["public"]["CompositeTypes"];
  };
}

// Define specific types for the subscription data
export type Subscriber = ExtendedDatabase["public"]["Tables"]["subscribers"]["Row"];
export type SubscriberInsert = ExtendedDatabase["public"]["Tables"]["subscribers"]["Insert"];
export type SubscriberUpdate = ExtendedDatabase["public"]["Tables"]["subscribers"]["Update"];
