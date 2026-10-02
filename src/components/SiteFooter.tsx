import { Link } from "@tanstack/react-router";
import { Instagram, Mail } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";

function Logo() {
  return <a href="#" className="flex shrink-0 items-center"><img src={logoAsset.url} alt="prezent3d.com" className="h-9 w-auto" /></a>;
}

export function SiteFooter() {
  return (
    <footer id="kontakt" className="bg-card pt-[17.5px] pb-8">
      <div className="section-shell grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="flex flex-col items-start">
          <Logo/>
          <p className="-mt-[5.75px] ml-9 text-[10px] leading-none text-muted-foreground">Personalizowane figurki 3D na zamówienie</p>
        </div>
        <nav className="flex flex-wrap gap-5 text-[10px] font-semibold md:-mt-1">
          <a href="#">Strona główna</a>
          <Link to="/oferta">Oferta</Link>
          <a href="#realizacje">Galeria</a>
          <a href="#proces">Jak to działa?</a>
          <Link to="/oferta">Cennik</Link>
          <Link to="/faq">FAQ</Link>
        </nav>
        <div className="flex flex-col gap-3 md:justify-self-end">
          <a href="mailto:prezent3d@gmail.com" className="flex items-center gap-2 text-[10px] font-semibold">
            <Mail className="size-4 text-primary" />
            prezent3d@gmail.com
          </a>
          <a href="https://instagram.com/prezent3D.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-semibold">
            <Instagram className="size-4 text-primary" />
            prezent3D.com
          </a>
        </div>
      </div>
      <div className="section-shell mt-[17.5px] flex flex-wrap justify-between gap-4 border-t border-border pt-[7px] text-[9px] text-muted-foreground"><span>© 2026 prezent3d.pl. Wszelkie prawa zastrzeżone.</span><span>Polityka prywatności &nbsp;&nbsp;&nbsp; Regulamin</span></div>
    </footer>
  );
}
