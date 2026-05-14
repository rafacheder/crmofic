import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Wrench className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">CRM Oficinas</h1>
            <p className="text-sm text-muted-foreground">Entre na sua conta</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setLoading(true);
                setTimeout(() => {
                  toast.success("Bem-vindo de volta!");
                  navigate({ to: "/kanban" });
                }, 400);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="ana@oficina.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" defaultValue="••••••••" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Não tem conta?{" "}
                <Link to="/register" className="text-primary hover:underline">Cadastre-se</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
