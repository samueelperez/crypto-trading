export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      trades: {
        Row: {
          id: string
          created_at: string
          user_id: string
          pair: string
          type: "buy" | "sell"
          entry_price: number
          exit_price: number | null
          amount: number
          status: "open" | "closed"
          pnl: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          pair: string
          type: "buy" | "sell"
          entry_price: number
          exit_price?: number | null
          amount: number
          status?: "open" | "closed"
          pnl?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          pair?: string
          type?: "buy" | "sell"
          entry_price?: number
          exit_price?: number | null
          amount?: number
          status?: "open" | "closed"
          pnl?: number | null
          notes?: string | null
        }
      }
      journal_entries: {
        Row: {
          id: string
          created_at: string
          user_id: string
          trade_id: string | null
          entry_date: string
          pair: string
          type: "buy" | "sell"
          entry_price: number
          exit_price: number
          result: "profit" | "loss"
          pnl: number
          notes: string | null
          tags: string[] | null
          images: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          trade_id?: string | null
          entry_date: string
          pair: string
          type: "buy" | "sell"
          entry_price: number
          exit_price: number
          result: "profit" | "loss"
          pnl: number
          notes?: string | null
          tags?: string[] | null
          images?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          trade_id?: string | null
          entry_date?: string
          pair?: string
          type?: "buy" | "sell"
          entry_price?: number
          exit_price?: number
          result?: "profit" | "loss"
          pnl?: number
          notes?: string | null
          tags?: string[] | null
          images?: string[] | null
        }
      }
      watchlist: {
        Row: {
          id: string
          created_at: string
          user_id: string
          crypto_id: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          crypto_id: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          crypto_id?: string
          notes?: string | null
        }
      }
      // Nuevas tablas para el portfolio
      exchanges: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          created_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          exchange_id: string
          symbol: string
          quantity: string
          purchase_price_avg: string
          last_updated: string
          logo_url: string | null // Añadimos el campo logo_url
        }
        Insert: {
          id?: string
          exchange_id: string
          symbol: string
          quantity: string
          purchase_price_avg: string
          last_updated?: string
          logo_url?: string | null // Añadimos el campo logo_url
        }
        Update: {
          id?: string
          exchange_id?: string
          symbol?: string
          quantity?: string
          purchase_price_avg?: string
          last_updated?: string
          logo_url?: string | null // Añadimos el campo logo_url
        }
      }
    }
  }
}

