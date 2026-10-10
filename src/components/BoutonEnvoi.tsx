"use client";

import { useFormStatus } from "react-dom";
import Chargement from "./Chargement";

/** Bouton d'envoi : pendant le traitement (un démarrage à froid peut durer quelques secondes), un écran de chargement aux couleurs de Nuuf s'affiche et le double envoi est évité. */
export default function BoutonEnvoi({ children, enCours, className, id }: { children: React.ReactNode; enCours: string; className?: string; id?: string }) {
  const { pending } = useFormStatus();
  return (
    <>
      <button id={id} type="submit" disabled={pending} aria-busy={pending} className={`${className ?? ""} disabled:opacity-80 disabled:cursor-wait`}>
        {children}
      </button>
      {pending && <Chargement plein libelle={enCours} />}
    </>
  );
}
