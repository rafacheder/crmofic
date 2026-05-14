import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nomeOficina, setNomeOficina] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (loading) return null;
  if (user) return <Navigate to="/kanban" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await signUp(nomeOficina, nomeUsuario, email, password);
      toast.success("Conta criada! Verifique seu e-mail.");
      navigate({ to: "/login" });
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
      toast.error("Erro ao criar conta: " + (err.message || "Verifique os dados informados"));
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Nome da Oficina</Label>
                <Input 
                  required 
                  placeholder="Auto Center Silva" 
                  value={nomeOficina}
                  onChange={(e) => setNomeOficina(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Nome do Responsável</Label>
                <Input 
                  required 
                  placeholder="João Silva" 
                  value={nomeUsuario}
                  onChange={(e) => setNomeUsuario(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  required 
                  placeholder="voce@oficina.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input 
                  type="password" 
                  required 
                  minLength={6} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Criando conta..." : "Criar conta"}
              </Button>
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
