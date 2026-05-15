import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Usuario, Oficina } from "@/types/database";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  usuario: Usuario | null;
  oficina: Oficina | null;
  oficinaId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (nomeOficina: string, nomeUsuario: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [oficina, setOficina] = useState<Oficina | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsuarioEOficina = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*, oficinas(*)")
        .eq("id", userId)
        .maybeSingle();

      console.log("[AuthContext] usuario:", data, "erro:", error);

      if (error) throw error;

      if (data) {
        const { oficinas, ...u } = data as unknown as Usuario & { oficinas: Oficina };
        setUsuario(u as Usuario);
        setOficina((oficinas as Oficina) ?? null);
      } else {
        setUsuario(null);
        setOficina(null);
      }
    } catch (error) {
      console.error("[AuthContext] Erro ao buscar usuário:", error);
      setUsuario(null);
      setOficina(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // defer to avoid deadlocks
        setTimeout(() => fetchUsuarioEOficina(session.user.id), 0);
      } else {
        setUsuario(null);
        setOficina(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUsuarioEOficina(session.user.id);
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
      options: { data: { full_name: nomeUsuario } },
    });

    if (error) throw error;
    if (!data.user) throw new Error("Erro ao criar usuário");

    const { error: rpcError } = await supabase.rpc("criar_oficina_e_usuario", {
      nome_oficina: nomeOficina,
      nome_usuario: nomeUsuario,
      p_email: email,
      p_user_id: data.user.id,
    });

    if (rpcError) {
      console.error("[AuthContext] RPC criar_oficina_e_usuario:", rpcError);
      throw rpcError;
    }

    toast.success("Conta criada com sucesso!");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        usuario,
        oficina,
        oficinaId: usuario?.oficina_id ?? null,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
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
