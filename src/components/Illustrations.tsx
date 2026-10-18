/**
 * Illustrations plates du style « Papier » : formes simples, aplats pastel, un trait de crayon orange.
 * Décoratives (masquées aux lecteurs d'écran) ; affichées seulement quand le style Papier est actif
 * (classe `illu-papier`, voir globals.css). Dessinées pour Nuuf, sans texte donc sans traduction.
 */
const VERT = "#1b6f5a";
const MENTHE = "#cfe5d3";
const CIEL = "#add3e5";
const MAUVE = "#e3c7de";
const OR = "#ffba09";
const CRAYON = "#ff6a3d";
const ENCRE = "#1a1f1c";

function Cadre({ children, fond, className = "" }: { children: React.ReactNode; fond: string; className?: string }) {
  return (
    <svg viewBox="0 0 240 150" role="presentation" aria-hidden="true" focusable="false" className={`illu-papier w-full h-auto rounded-[1.5rem] ${className}`} style={{ background: fond }}>
      {children}
    </svg>
  );
}

/** Étape 1 : un immeuble et sa clé. */
export function IllustrationBien({ className }: { className?: string }) {
  return (
    <Cadre fond={MENTHE} className={className}>
      <rect x="40" y="38" width="86" height="92" rx="14" fill="#fff" />
      <rect x="54" y="54" width="22" height="18" rx="5" fill={CIEL} />
      <rect x="90" y="54" width="22" height="18" rx="5" fill={OR} />
      <rect x="54" y="82" width="22" height="18" rx="5" fill={MAUVE} />
      <rect x="90" y="82" width="22" height="18" rx="5" fill={CIEL} />
      <rect x="73" y="108" width="20" height="22" rx="7" fill={VERT} />
      <circle cx="175" cy="86" r="22" fill={OR} />
      <circle cx="175" cy="86" r="9" fill="#fff" />
      <rect x="170" y="104" width="10" height="34" rx="4" fill={ENCRE} />
      <rect x="180" y="120" width="12" height="7" rx="3" fill={ENCRE} />
      <path d="M142 38c8-8 20-10 30-4" fill="none" stroke={CRAYON} strokeWidth="4" strokeLinecap="round" />
    </Cadre>
  );
}

/** Étape 2 : un message WhatsApp avec un lien de paiement. */
export function IllustrationPaiement({ className }: { className?: string }) {
  return (
    <Cadre fond={CIEL} className={className}>
      <rect x="34" y="30" width="118" height="54" rx="20" fill="#fff" />
      <path d="M52 84l-4 18 22-18z" fill="#fff" />
      <rect x="50" y="46" width="62" height="8" rx="4" fill={MENTHE} />
      <rect x="50" y="62" width="86" height="8" rx="4" fill="#e8e8e2" />
      <rect x="96" y="86" width="110" height="46" rx="20" fill={VERT} />
      <path d="M200 132l4 14-20-14z" fill={VERT} />
      <circle cx="122" cy="109" r="11" fill={OR} />
      <path d="M117 109l4 4 8-9" fill="none" stroke={ENCRE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="140" y="102" width="48" height="7" rx="3.5" fill="#fff" opacity=".9" />
      <rect x="140" y="115" width="32" height="7" rx="3.5" fill="#fff" opacity=".6" />
      <path d="M176 24c10-6 22-4 28 6" fill="none" stroke={CRAYON} strokeWidth="4" strokeLinecap="round" />
    </Cadre>
  );
}

/** Étape 3 : une quittance tamponnée avec son code QR. */
export function IllustrationQuittance({ className }: { className?: string }) {
  return (
    <Cadre fond={MAUVE} className={className}>
      <rect x="68" y="16" width="104" height="122" rx="16" fill="#fff" />
      <rect x="84" y="32" width="48" height="8" rx="4" fill={VERT} />
      <rect x="84" y="48" width="72" height="6" rx="3" fill="#e8e8e2" />
      <rect x="84" y="60" width="60" height="6" rx="3" fill="#e8e8e2" />
      <g fill={ENCRE}>
        <rect x="84" y="80" width="26" height="26" rx="4" />
      </g>
      <g fill="#fff">
        <rect x="89" y="85" width="7" height="7" rx="1.5" />
        <rect x="99" y="85" width="6" height="6" rx="1.5" />
        <rect x="89" y="95" width="6" height="6" rx="1.5" />
        <rect x="98" y="97" width="7" height="5" rx="1.5" />
      </g>
      <circle cx="146" cy="104" r="19" fill="none" stroke={CRAYON} strokeWidth="4" strokeDasharray="3 0" />
      <path d="M137 104l6 6 11-13" fill="none" stroke={CRAYON} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="46" cy="40" r="9" fill={OR} />
      <circle cx="198" cy="112" r="12" fill={CIEL} />
    </Cadre>
  );
}

/** Bloc « Sérénité » : un bouclier posé sur des quittances. */
export function IllustrationProtection({ className }: { className?: string }) {
  return (
    <Cadre fond={MENTHE} className={className}>
      <rect x="40" y="48" width="96" height="84" rx="14" fill="#fff" transform="rotate(-6 88 90)" />
      <rect x="104" y="40" width="96" height="84" rx="14" fill="#fff" transform="rotate(5 152 82)" />
      <path d="M120 30l38 14v32c0 24-16 40-38 50-22-10-38-26-38-50V44z" fill={VERT} />
      <path d="M102 80l13 13 24-28" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="46" cy="34" r="8" fill={OR} />
      <path d="M176 26c10-6 22-4 28 6" fill="none" stroke={CRAYON} strokeWidth="4" strokeLinecap="round" />
    </Cadre>
  );
}
