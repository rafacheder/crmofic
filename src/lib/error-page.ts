export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Ops! Algo deu errado</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { --primary: #111; --text: #111; --muted: #4b5563; --bg: #fafafa; }
      @media (prefers-color-scheme: dark) { :root { --primary: #f5f5f5; --text: #f5f5f5; --muted: #a1a1aa; --bg: #09090b; } }
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      .icon { margin-bottom: 1.5rem; color: var(--muted); }
      h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 0.75rem; letter-spacing: -0.025em; }
      p { color: var(--muted); margin: 0 0 2rem; font-size: 0.95rem; }
      .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.625rem 1.25rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; text-decoration: none; border: 1px solid transparent; transition: all 0.2s; }
      .primary { background: var(--primary); color: var(--bg); }
      .primary:hover { opacity: 0.9; }
      .secondary { background: transparent; color: var(--text); border-color: color-mix(in srgb, var(--muted) 30%, transparent); }
      .secondary:hover { background: color-mix(in srgb, var(--muted) 10%, transparent); }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      </div>
      <h1>Não foi possível carregar esta página</h1>
      <p>Ocorreu um erro inesperado em nosso servidor. Você pode tentar recarregar a página ou voltar para o início.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Tentar novamente</button>
        <a class="secondary" href="/">Voltar ao início</a>
      </div>
    </div>
  </body>
</html>`;
}