import LangueSwitch from "./LangueSwitch";
import ThemeToggle from "./ThemeToggle";

/** Langue + thème. `flottant` : pastille fixée en haut à droite, pour les écrans sans barre d'en-tête. */
export default function Preferences({ flottant = false }: { flottant?: boolean }) {
  const contenu = (
    <>
      <LangueSwitch />
      <ThemeToggle />
    </>
  );
  if (!flottant) return <div className="flex items-center gap-1">{contenu}</div>;
  return (
    <div className="fixed bottom-3 right-3 z-[60] flex items-center gap-1 rounded-2xl bg-surface-container-lowest/90 backdrop-blur px-1.5 py-1 shadow-md">
      {contenu}
    </div>
  );
}
