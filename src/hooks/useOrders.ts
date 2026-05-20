import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { OrdemServico, Cliente, Veiculo } from "@/types/database";
import { toast } from "sonner";

export const ORDERS_QUERY_KEY = ["kanban_ordens"]; // Reusing the same key to keep them synced

export function useOrders() {
  const { oficinaId } = useAuth();
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: [...ORDERS_QUERY_KEY, oficinaId],
    enabled: !!oficinaId,
    queryFn: async () => {
      if (!oficinaId) return [];
      const { data, error } = await supabase
        .from("ordens_servico")
        .select(`
          *,
          cliente:clientes(id, nome),
          veiculo:veiculos(id, placa, marca, modelo)
        `)
        .eq("oficina_id", oficinaId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data ?? []) as unknown as OrdemServico[];
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (payload: Partial<OrdemServico>) => {
      if (!oficinaId) throw new Error("Oficina não identificada");

      // 1. Get the current year count for OS number
      const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
      const { count } = await supabase
        .from("ordens_servico")
        .select("*", { count: "exact", head: true })
        .eq("oficina_id", oficinaId)
        .gte("created_at", startOfYear);

      const nextNum = (count ?? 0) + 1;
      const numero = `OS-${new Date().getFullYear()}-${String(nextNum).padStart(4, "0")}`;

      // 2. Get the first column if not provided
      let colId = payload.coluna_id;
      if (!colId) {
        const { data: cols } = await supabase
          .from("kanban_colunas")
          .select("id")
          .eq("oficina_id", oficinaId)
          .order("ordem", { ascending: true })
          .limit(1);
        colId = cols?.[0]?.id;
      }

      // 3. Insert the order
      const { cliente, veiculo, ...insertPayload } = payload as any;
      
      const { data, error } = await supabase
        .from("ordens_servico")
        .insert({
          ...insertPayload,
          numero,
          oficina_id: oficinaId,
          coluna_id: colId,
          status_orcamento: payload.status_orcamento || "PENDENTE",
          prioridade: payload.prioridade || "NORMAL",
          valor_total: payload.valor_total || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ORDERS_QUERY_KEY, oficinaId] });
      toast.success("Ordem de serviço criada com sucesso");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar OS: " + error.message);
    },
  });

  return {
    orders: ordersQuery.data ?? [],
    isLoading: ordersQuery.isLoading,
    createOrder: createOrderMutation.mutateAsync,
    isCreating: createOrderMutation.isPending,
  };
}

// Removed useClients and useVehicles from here, use specialized hooks instead.

