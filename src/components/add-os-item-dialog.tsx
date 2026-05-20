import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCatalogo } from "@/hooks/useCatalogo";
import { useOsItens } from "@/hooks/useOsItens";
import { Loader2 } from "lucide-react";
import { formatBRL } from "@/lib/mock-data";

export function AddOsItemDialog({ 
  osId, 
  open, 
  onOpenChange 
}: { 
  osId: string; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { servicos, produtos } = useCatalogo();
  const { addItem, isAdding } = useOsItens(osId);
  
  const [tipo, setTipo] = useState<"servico" | "produto">("servico");
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [preco, setPreco] = useState(0);
  const [desconto, setDesconto] = useState(0);

  const subtotal = (quantidade * preco) - desconto;

  const handleAdd = async () => {
    if (!nome) return;
    try {
      await addItem({
        tipo,
        nome,
        quantidade,
        preco_unitario: preco,
        desconto
      });
      setNome("");
      setPreco(0);
      setQuantidade(1);
      setDesconto(0);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectItem = (id: string) => {
    if (tipo === "servico") {
      const s = servicos.find(x => x.id === id);
      if (s) {
        setNome(s.nome);
        setPreco(s.preco_base || 0);
      }
    } else {
      const p = produtos.find(x => x.id === id);
      if (p) {
        setNome(p.nome);
        setPreco(p.preco_unitario || 0);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Item à OS</DialogTitle>
        </DialogHeader>

        <Tabs value={tipo} onValueChange={(v) => setTipo(v as any)} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="servico">Serviço</TabsTrigger>
            <TabsTrigger value="produto">Produto</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Selecionar do Catálogo</Label>
              <Select onValueChange={handleSelectItem}>
                <SelectTrigger>
                  <SelectValue placeholder={`Escolha um ${tipo === "servico" ? "serviço" : "produto"}...`} />
                </SelectTrigger>
                <SelectContent>
                  {tipo === "servico" 
                    ? servicos.map(s => <SelectItem key={s.id} value={s.id}>{s.nome} ({formatBRL(s.preco_base || 0)})</SelectItem>)
                    : produtos.map(p => <SelectItem key={p.id} value={p.id}>{p.nome} ({formatBRL(p.preco_unitario || 0)})</SelectItem>)
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome/Descrição</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qtd">Quantidade</Label>
                <Input id="qtd" type="number" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco">Preço Unitário</Label>
                <Input id="preco" type="number" value={preco} onChange={(e) => setPreco(Number(e.target.value))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="desc">Desconto</Label>
                <Input id="desc" type="number" value={desconto} onChange={(e) => setDesconto(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Subtotal</Label>
                <div className="h-10 flex items-center px-3 rounded-md bg-muted font-bold">
                  {formatBRL(subtotal)}
                </div>
              </div>
            </div>
          </div>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleAdd} disabled={isAdding || !nome}>
            {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
