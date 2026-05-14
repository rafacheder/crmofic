import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Wrench className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">Crie sua conta</h1>
            <p className="text-sm text-muted-foreground">Comece a gerenciar sua oficina</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Conta criada com sucesso!");
                navigate({ to: "/kanban" });
              }}
            >
              <div className="space-y-2">
                <Label>Nome da Oficina</Label>
                <Input required placeholder="Auto Center Silva" />
              </div>
              <div className="space-y-2">
                <Label>Nome do Responsável</Label>
                <Input required placeholder="João Silva" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" required placeholder="voce@oficina.com" />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input type="password" required minLength={6} />
              </div>
              <Button type="submit" className="w-full">Criar conta</Button>
              <p className="text-center text-sm text-muted-foreground">
                Já tem conta?{" "}
                <Link to="/login" className="text-primary hover:underline">Entrar</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
