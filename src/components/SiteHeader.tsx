import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Mail, Menu, Search, ShieldCheck, ShoppingCart, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/logo.png.asset.json";

const navLinkHover = "transition-colors duration-200 hover:text-primary/70 focus-visible:text-primary/70 focus-visible:outline-none";

const menuItemClass =
  "cursor-pointer gap-2 rounded-sm px-2.5 py-2 text-[12px] font-semibold text-foreground focus:bg-secondary focus:text-primary data-[highlighted]:bg-secondary data-[highlighted]:text-primary";

function AccountMenu({ icon }: { icon: React.ReactNode }) {
  const navigate = useNavigate();
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild aria-label="Menu konta">
        <button type="button" className={`${navLinkHover} inline-flex`} aria-haspopup="menu">
          {icon}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-52 rounded-lg border-border bg-card p-1.5 shadow-lg">
        <DropdownMenuItem asChild className={menuItemClass}><Link to="/konto"><UserRound className="size-4 text-primary" /> Pulpit</Link></DropdownMenuItem>
        <DropdownMenuItem asChild className={menuItemClass}><Link to="/konto" search={{ view: "orders" }}><ShoppingCart className="size-4 text-primary" /> Moje zamówienia</Link></DropdownMenuItem>
        <DropdownMenuItem asChild className={menuItemClass}><Link to="/konto" search={{ view: "profile" }}><UserRound className="size-4 text-primary" /> Dane konta</Link></DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem onSelect={signOut} className={`${menuItemClass} text-destructive data-[highlighted]:text-destructive`}><LogOut className="size-4" /> Wyloguj się</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader({ active = "", variant = "full" }: { active?: "home" | "offer" | "faq" | "kontakt" | "sklep" | ""; variant?: "full" | "checkout" }) {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      if (alive) setSignedIn(!!data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") setSignedIn(event === "SIGNED_IN");
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (variant === "checkout") {
    return (
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card">
        <div className="section-shell flex h-[68px] items-center justify-between gap-5">
          <Link to="/" className="flex shrink-0 items-center" aria-label="prezent3d.com — strona główna">
            <img src={logoAsset.url} alt="prezent3d.com" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-5 text-[12px] font-semibold text-muted-foreground">
            <span className="hidden items-center gap-1.5 sm:flex"><ShieldCheck className="size-4 text-primary" aria-hidden="true" /> Bezpieczne zakupy</span>
            <a href="mailto:kontakt@prezent3d.com" className={`flex items-center gap-1.5 ${navLinkHover}`}><Mail className="size-4" aria-hidden="true" /> Potrzebujesz pomocy?</a>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card">
      <div className="section-shell grid h-[68px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5">
        <Link to="/" className="flex shrink-0 items-center" aria-label="prezent3d.com — strona główna">
          <img src={logoAsset.url} alt="prezent3d.com" className="h-9 w-auto" />
        </Link>
        <nav className="hidden items-center justify-center gap-6 text-[12px] font-semibold text-foreground lg:flex" aria-label="Główna nawigacja">
          <Link to="/" className={active === "home" ? "border-b-2 border-primary py-6 text-primary" : navLinkHover}>Strona główna</Link>
          <Link to="/oferta" className={active === "offer" ? "border-b-2 border-primary py-6 text-primary" : navLinkHover}>Stwórz swoją figurkę⌄</Link>
          <Link to="/sklep" className={active === "sklep" ? "border-b-2 border-primary py-6 text-primary" : navLinkHover}>Sklep</Link>
          <Link to="/kontakt" className={active === "kontakt" ? "border-b-2 border-primary py-6 text-primary" : navLinkHover}>Kontakt</Link>
          <Link to="/faq" className={active === "faq" ? "border-b-2 border-primary py-6 text-primary" : navLinkHover}>FAQ</Link>
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          <Search className="size-4" aria-hidden="true" />
          {signedIn
            ? <AccountMenu icon={<UserRound className="size-4" aria-hidden="true" />} />
            : <Link to="/logowanie" aria-label="Zaloguj się" className={navLinkHover}><UserRound className="size-4" aria-hidden="true" /></Link>}
          <ShoppingCart className="size-4" aria-hidden="true" />
        </div>
        <Menu className="size-6 lg:hidden" aria-label="Otwórz menu" />
      </div>
    </header>
  );
}
