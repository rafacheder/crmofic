export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ativo:     { label: "Ativo",     className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    trial:     { label: "Trial",     className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    suspenso:  { label: "Suspenso",  className: "bg-red-500/20 text-red-400 border-red-500/30" },
    cancelado: { label: "Cancelado", className: "bg-zinc-600/20 text-zinc-400 border-zinc-500/30" },
  };
  const s = map[status] ?? { label: status, className: "bg-zinc-700 text-zinc-300" };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}
