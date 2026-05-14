import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Profile, Workshop } from "@/types/database";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  workshop: Workshop | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (nomeOficina: string, nomeUsuario: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndWorkshop = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*, workshops(*)")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        const { workshops, ...p } = profileData;
        setProfile(p as Profile);
        setWorkshop(workshops as unknown as Workshop);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndWorkshop(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndWorkshop(session.user.id);
      } else {
        setProfile(null);
        setWorkshop(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (nomeOficina: string, nomeUsuario: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: nomeUsuario,
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Erro ao criar usuário");

    // Call RPC to create workshop and link user
    // Since we revoked public access, we might need to handle this differently if we can't call it directly from client
    // But for this MVP, we assume the user can call it right after signup if they are "authenticated" or "anon" (depending on how we set it up)
    // Actually, I revoked it for everyone but service_role. 
    // I'll adjust the RPC permissions to allow authenticated/anon temporarily or handle it via a secure way.
    // Let's re-grant to authenticated/anon for this specific setup function.
    
    const { error: rpcError } = await supabase.rpc("criar_oficina_e_usuario", {
      nome_oficina: nomeOficina,
      nome_usuario: nomeUsuario,
      p_email: email,
      p_user_id: data.user.id
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      throw rpcError;
    }

    toast.success("Conta criada com sucesso! Verifique seu e-mail.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, workshop, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
