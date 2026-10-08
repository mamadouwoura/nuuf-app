import Accueil from "@/components/Accueil";
import { PublicFooter, PublicHeader } from "@/components/PublicLayout";

export default function Home() {
  return (
    <div className="bg-background font-body-md text-on-surface antialiased">
      <PublicHeader actif="accueil" />
      <Accueil />
      <PublicFooter />
    </div>
  );
}
