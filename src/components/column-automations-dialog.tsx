import { useState, useEffect } from "react";
import { Plus, Trash2, Bot } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { store } from "@/lib/store";
import { type KanbanColumn, type KanbanAutomation } from "@/lib/mock-data";

interface ColumnAutomationsDialogProps {
  column: KanbanColumn | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TRIGGER_OPTIONS = [
  { value: "Ao Entrar", label: "Ao Entrar" },
  { value: "Ao Sair", label: "Ao Sair" },
  { value: "Tempo na Coluna", label: "Tempo na Coluna" },
];

const ACTION_OPTIONS = [
  { value: "Enviar WhatsApp", label: "Enviar WhatsApp" },
  { value: "Enviar Email", label: "Enviar Email" },
  { value: "Notificar Técnico", label: "Notificar Técnico" },
  { value: "Webhook", label: "Webhook" },
];

const TEMPLATE_OPTIONS = [
  { value: "t1", label: "Notificação de status" },
  { value: "t2", label: "Orçamento pronto" },
  { value: "t3", label: "Veículo pronto para retirada" },
];

export function ColumnAutomationsDialog({
  column,
  open,
  onOpenChange,
}: ColumnAutomationsDialogProps) {
  const [automations, setAutomations] = useState<KanbanAutomation[]>([]);

  useEffect(() => {
    if (column) {
      setAutomations(column.automations || []);
    }
  }, [column, open]);

  if (!column) return null;

  const handleAddAutomation = () => {
    const newAutomation: KanbanAutomation = {
      id: crypto.randomUUID(),
      trigger: "Ao Entrar",
      action: "Enviar WhatsApp",
      templateId: "t1",
    };
    setAutomations([...automations, newAutomation]);
  };

  const handleRemoveAutomation = (id: string) => {
    setAutomations(automations.filter((a) => a.id !== id));
  };

  const handleUpdateAutomation = (id: string, patch: Partial<KanbanAutomation>) => {
    setAutomations(
      automations.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );
  };

  const handleSave = () => {
    store.updateColumnAutomations(column.id, automations);
    toast.success("Automações salvas");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Automações — {column.name}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {automations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <Bot className="h-12 w-12 mb-2 opacity-20" />
              <p>Nenhuma automação configurada</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleAddAutomation}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Automação
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-3 items-end px-1">
                <Label className="text-xs font-semibold">Gatilho (Trigger)</Label>
                <Label className="text-xs font-semibold">Ação</Label>
                <Label className="text-xs font-semibold">Template</Label>
                <div />
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {automations.map((a) => (
                  <div key={a.id} className="space-y-2">
                    <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-3 items-start">
                      <div className="space-y-2">
                        <Select
                          value={a.trigger}
                          onValueChange={(v: any) =>
                            handleUpdateAutomation(a.id, { trigger: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TRIGGER_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {a.trigger === "Tempo na Coluna" && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Minutos"
                              value={a.timeLimit || ""}
                              onChange={(e) =>
                                handleUpdateAutomation(a.id, {
                                  timeLimit: parseInt(e.target.value) || 0,
                                })
                              }
                              className="h-8"
                            />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              minutos
                            </span>
                          </div>
                        )}
                      </div>

                      <Select
                        value={a.action}
                        onValueChange={(v: any) =>
                          handleUpdateAutomation(a.id, { action: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={a.templateId}
                        onValueChange={(v) =>
                          handleUpdateAutomation(a.id, { templateId: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAutomation(a.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAddAutomation}
                className="w-full border-dashed"
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar mais uma automação
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
