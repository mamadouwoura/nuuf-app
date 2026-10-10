"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/client";

const L = 640;
const H = 220;

/** Zone de signature manuscrite au doigt ou au stylet. L'image PNG est envoyée dans le champ caché « signature ». */
export default function SignatureTactile({ existante }: { existante?: string | null }) {
  const { t } = useT();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [valeur, setValeur] = useState("");
  const [trace, setTrace] = useState(false);
  const dessin = useRef(false);

  useEffect(() => {
    const c = canvas.current;
    const g = c?.getContext("2d");
    if (!c || !g) return;
    g.lineWidth = 3;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.strokeStyle = "#0f1713";
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * L, y: ((e.clientY - r.top) / r.height) * H };
  };
  const debut = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const g = canvas.current?.getContext("2d");
    if (!g) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dessin.current = true;
    const p = point(e);
    g.beginPath();
    g.moveTo(p.x, p.y);
    g.lineTo(p.x + 0.01, p.y + 0.01);
    g.stroke();
  };
  const trait = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dessin.current) return;
    const g = canvas.current?.getContext("2d");
    if (!g) return;
    const p = point(e);
    g.lineTo(p.x, p.y);
    g.stroke();
    setTrace(true);
  };
  const fin = () => {
    if (!dessin.current) return;
    dessin.current = false;
    if (canvas.current && trace) setValeur(canvas.current.toDataURL("image/png"));
  };
  const effacer = () => {
    const c = canvas.current;
    c?.getContext("2d")?.clearRect(0, 0, L, H);
    setTrace(false);
    setValeur("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative rounded-xl bg-surface-container-lowest border-2 border-dashed border-outline-variant">
        <canvas
          ref={canvas}
          width={L}
          height={H}
          aria-label={t("Zone de signature")}
          className="w-full h-40 touch-none rounded-xl bg-white"
          onPointerDown={debut}
          onPointerMove={trait}
          onPointerUp={fin}
          onPointerCancel={fin}
          onPointerLeave={fin}
        />
        {!trace && <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-body-md text-body-md text-outline">{t("Signez ici avec le doigt")}</span>}
      </div>
      <input type="hidden" name="signature" value={valeur} readOnly />
      <div className="flex items-center justify-between gap-3">
        {existante && !trace ? (
          <span className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={existante} alt="" className="h-10 rounded bg-white border border-outline-variant/50" />
            {t("Signature déjà enregistrée")}
          </span>
        ) : (
          <span />
        )}
        <button type="button" onClick={effacer} className="h-10 px-4 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md font-semibold hover:bg-surface-container-high">
          {t("Effacer")}
        </button>
      </div>
    </div>
  );
}
