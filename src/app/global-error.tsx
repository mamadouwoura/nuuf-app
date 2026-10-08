"use client";

/** Dernier recours (erreur dans la mise en page racine) : page autonome, sans dépendance au reste de l'application. */
export default function ErreurGlobale({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#eefaf3", color: "#22312a" }}>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div role="alert" style={{ maxWidth: 420, background: "#fff", borderRadius: 16, padding: 32, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,.08)" }}>
            <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Un petit souci de notre côté</h1>
            <p style={{ color: "#52605a", margin: "0 0 16px" }}>Le service est momentanément indisponible. Réessayez dans un instant.</p>
            <button onClick={() => reset()} style={{ background: "#1b6f5a", color: "#fff", border: 0, borderRadius: 12, padding: "12px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              Réessayer
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
