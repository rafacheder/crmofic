import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, ExternalLink, Settings as SettingsIcon } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_app/inbox")({ component: InboxPage });

function InboxPage() {
  const url = useStore((s) => s.whaticketUrl);
  const connected = useStore((s) => s.whaticketConnected);

  return (
    <>
      <AppHeader title="Atendimento WhatsApp" />
      <div className="flex items-center gap-3 border-b bg-background px-4 py-2">
        <span className="text-sm font-medium">Atendimento WhatsApp</span>
        <Badge variant="secondary" className={connected ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}>
          {connected ? "Conectado" : "Desconectado"}
        </Badge>
        <div className="ml-auto flex gap-2">
          {url && (
            <Button variant="outline" size="sm" asChild>
              <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="mr-1 h-4 w-4" /> Abrir em nova aba</a>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings"><SettingsIcon className="mr-1 h-4 w-4" /> Configurar</Link>
          </Button>
        </div>
      </div>
      <div className="flex-1">
        {url ? (
          <iframe src={url} title="Whaticket" className="h-[calc(100vh-7rem)] w-full border-0" />
        ) : (
          <div className="flex h-[calc(100vh-7rem)] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Whaticket não configurado</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Configure a URL do seu Whaticket para acessar os atendimentos diretamente aqui.
              </p>
            </div>
            <Button asChild><Link to="/settings">Configurar agora</Link></Button>
          </div>
        )}
      </div>
    </>
  );
}
