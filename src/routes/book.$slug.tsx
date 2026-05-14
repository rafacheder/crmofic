import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Wrench, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { services } from "@/lib/mock-data";

export const Route = createFileRoute("/book/$slug")({ component: BookingPage });

const times = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

function BookingPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const toggle = (id: string) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-3 pt-8 pb-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success"><Check className="h-8 w-8 text-success-foreground" /></div>
            <h2 className="text-xl font-semibold">Agendamento confirmado!</h2>
            <p className="text-sm text-muted-foreground">Número de confirmação:</p>
            <code className="rounded bg-muted px-3 py-1 font-mono text-sm">{done}</code>
            <p className="text-sm text-muted-foreground">Em breve entraremos em contato pelo WhatsApp.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"><Wrench className="h-5 w-5 text-primary-foreground" /></div>
          <div><div className="text-sm font-semibold">Auto Center Silva</div><div className="text-xs text-muted-foreground">Agendamento online</div></div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl p-4">
        <Card>
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              setDone(`AG-${Date.now().toString().slice(-6)}`);
            }}>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2 col-span-2"><Label>Nome completo</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Telefone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Placa</Label><Input value={plate} onChange={(e) => setPlate(e.target.value)} required /></div>
              </div>

              <div className="space-y-2">
                <Label>Serviços desejados</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {services.map((s) => (
                    <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent">
                      <Checkbox checked={chosen.includes(s.id)} onCheckedChange={() => toggle(s.id)} />
                      <span className="flex-1">{s.name}</span>
                      <span className="text-xs text-muted-foreground">R$ {s.price.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Data</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
              </div>

              {date && (
                <div className="space-y-2">
                  <Label>Horários disponíveis</Label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {times.map((t) => (
                      <button type="button" key={t} onClick={() => setTime(t)} className={`rounded-md border px-2 py-2 text-sm ${time === t ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2"><Label>Observações</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></div>
              <Button type="submit" className="w-full" size="lg" disabled={!time}>Confirmar Agendamento</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
