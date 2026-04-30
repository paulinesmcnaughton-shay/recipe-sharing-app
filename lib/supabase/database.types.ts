export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          id: string
          author_id: string
          title: string
          description: string | null
          ingredients: string
          instructions: string
          image_url: string | null
          difficulty: string | null
          category: string | null
          prep_time_minutes: number | null
          cook_time_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          description?: string | null
          ingredients: string
          instructions: string
          image_url?: string | null
          difficulty?: string | null
          category?: string | null
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          description?: string | null
          ingredients?: string
          instructions?: string
          image_url?: string | null
          difficulty?: string | null
          category?: string | null
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_likes: {
        Row: {
          id: string
          recipe_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_likes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_comments: {
        Row: {
          id: string
          recipe_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_comments_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
        Relationships: []
      }
      recipe_tags: {
        Row: {
          recipe_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          recipe_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          recipe_id?: string
          tag_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_tags_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
