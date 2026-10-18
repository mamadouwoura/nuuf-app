/** Décor de la démonstration : formes et trait de crayon derrière le téléphone, pastilles qui entrent à chaque étape.
 *  Chiffres, icônes et noms de marques seulement : rien à traduire. Décoratif (masqué aux lecteurs d'écran). */

export const PLATEAU = ["#bfe3cf", "#a9defa", "#ffd85e", "#9fe3b5"];
export const FOND_ECRAN = ["#f0fdf3", "#eaf8ff", "#fff8e1", "#efe6d9"];
export const PASTILLE_ON = ["bg-primary", "bg-[#0a7fa3]", "bg-[#9a6a00]", "bg-[#168a3e]"];
export const PASTILLE_OFF = ["bg-success-container text-primary", "bg-[#d7f1fb] text-[#0a7fa3]", "bg-secondary-fixed text-[#9a6a00]", "bg-[#d4f5df] text-[#168a3e]"];

export function Decor({ actif }: { actif: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <span className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/35" />
      <span className="absolute -bottom-14 -right-8 w-48 h-48 rounded-full bg-white/30" />
      <svg key={actif} viewBox="0 0 120 40" className="absolute top-5 right-6 w-24 demo-entre" style={{ animationDelay: "300ms" }}>
        <path d="M4 30c20-26 40-26 56-8s34 14 56-12" fill="none" stroke="#ff6a3d" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

const JEUX = [
  [
    { i: "trending_up", x: "+18 %", cl: "bg-white text-primary", pos: "left-2 top-24", ms: 900 },
    { i: "payments", x: "1 250 000", cl: "bg-primary text-white", pos: "right-2 bottom-24", ms: 1300 },
  ],
  [
    { i: "bolt", x: "Wave", cl: "bg-[#0a7fa3] text-white", pos: "left-2 top-20", ms: 700 },
    { i: "check_circle", x: "+250 000", cl: "bg-white text-[#168a3e]", pos: "right-2 bottom-28", ms: 2800 },
  ],
  [
    { i: "qr_code_2", x: "QR", cl: "bg-white text-on-surface", pos: "left-2 top-32", ms: 1200 },
    { i: "picture_as_pdf", x: "PDF", cl: "bg-[#9a6a00] text-white", pos: "right-2 bottom-32", ms: 2000 },
  ],
  [
    { i: "chat", x: "WhatsApp", cl: "bg-[#168a3e] text-white", pos: "left-2 top-20", ms: 600 },
    { i: "done_all", x: "180 000", cl: "bg-white text-[#168a3e]", pos: "right-2 bottom-28", ms: 3400 },
  ],
];

export function Pastilles({ actif }: { actif: number }) {
  return (
    <div key={actif} className="absolute inset-0 z-20 pointer-events-none hidden sm:block" aria-hidden="true">
      {JEUX[actif].map((p) => (
        <span
          key={p.x}
          className={`demo-bulle absolute ${p.pos} inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-extrabold shadow-lg ring-1 ring-black/5 ${p.cl}`}
          style={{ animationDelay: `${p.ms}ms` }}
        >
          <span className="material-symbols-outlined text-[18px]">{p.i}</span>
          {p.x}
        </span>
      ))}
    </div>
  );
}
