import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight, Bell, Box, Camera, CheckCircle2, ChevronRight, Clock3, CreditCard, Download,
  FileText, Lightbulb, LogOut, Mail, MapPin, MoreVertical, Package, Paintbrush,
  Pencil, Phone, Plus, Search, ShieldCheck, ShoppingBag, Truck, UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import couple from "@/assets/account-couple.png";
import emptyBox from "@/assets/account-empty-box.png";
import giftBox from "@/assets/account-gift-box.png";
import logoAsset from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/konto")({
  head: () => ({ meta: [
    { title: "Moje konto — prezent3d.com" },
    { name: "description", content: "Panel klienta prezent3d.com: zamówienia, dane konta, adresy oraz płatności." },
    { property: "og:title", content: "Moje konto — prezent3d.com" },
    { property: "og:description", content: "Sprawdź swoje zamówienia i informacje o koncie prezent3d.com." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  validateSearch: (search: Record<string, unknown>): { view?: View } => {
    const view = search["view"];
    if (view === "orders" || view === "profile" || view === "addresses" || view === "payments" || view === "dashboard") return { view };
    return {};
  },
  component: AccountPage,
});

type View = "dashboard" | "orders" | "profile" | "addresses" | "payments";
const navigation = [
  { id: "dashboard", label: "Pulpit", icon: Box },
  { id: "orders", label: "Moje zamówienia", icon: Package },
  { id: "profile", label: "Dane konta", icon: UserRound },
  { id: "addresses", label: "Adresy", icon: MapPin },
  { id: "payments", label: "Płatności i faktury", icon: CreditCard },
] as const;

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-card shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} /></button>;
}

function AccountPage() {
  const currentView = Route.useSearch().view;
  const [view, setView] = useState<View>(currentView ?? "dashboard");
  useEffect(() => {
    setView(currentView ?? "dashboard");
  }, [currentView]);
  const [query, setQuery] = useState("");
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [orders, setOrders] = useState<{ id: string; order_number: string; figurine_price: number; delivery_price: number; delivery_label: string; status: string; created_at: string; product_type: string | null; configuration: { title?: string } | null }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<{ display_name: string; email: string } | null>(null);
  const [settings, setSettings] = useState({ newsletter: true, orderStatus: true, savedAddresses: true });
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setOrders((data ?? []) as unknown as typeof orders);
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      setIsAdmin(!!r?.length);
      const { data: p } = await supabase.from("profiles").select("display_name, email").eq("id", user.id).maybeSingle();
      setProfile(p);
    });
  }, []);
  const [typeFilter, setTypeFilter] = useState<"Wszystkie" | "Figurki na zamówienie" | "Modele 3D">("Wszystkie");
  const [statusFilter, setStatusFilter] = useState<"Wszystkie" | "W realizacji" | "Wymaga działania" | "Zakończone">("Wszystkie");
  const statusMap: Record<string, string[]> = { "W realizacji": ["Opłacone", "Projektowanie", "Wizualizacja", "Modelowanie", "Druk", "Malowanie", "W realizacji"], "Wymaga działania": ["Poprawki", "Wymaga działania"], "Zakończone": ["Gotowe", "Gotowe do pobrania", "Wysłane", "Zakończone"] };
  const filtered = orders.filter(o => (!query || o.order_number.includes(query)) && (statusFilter === "Wszystkie" || statusMap[statusFilter]?.includes(o.status)) && (typeFilter === "Wszystkie" || (typeFilter === "Figurki na zamówienie" ? o.product_type !== "model_3d" : o.product_type === "model_3d")));
  const countFor = (label: string) => label === "Łączna liczba zamówień" ? orders.length : orders.filter(o => o.status === label).length;
  const statusStyle = (status: string): { label: string; className: string; icon: typeof CheckCircle2 | null } => {
    if (status === "Wizualizacja") return { label: "Wizualizacja gotowa", className: "bg-brand-soft text-primary", icon: null };
    if (status === "Druk") return { label: "W druku", className: "bg-warning-soft text-warning", icon: Clock3 };
    if (status === "Wysłane") return { label: "Wysłane", className: "bg-success-soft text-success", icon: CheckCircle2 };
    if (status === "Gotowe" || status === "Zakończone" || status === "Gotowe do pobrania") return { label: "Zakończone", className: "bg-muted text-muted-foreground", icon: Download };
    if (status === "Poprawki" || status === "Wymaga działania") return { label: "Wymaga działania", className: "bg-warning-soft text-warning", icon: Clock3 };
    if (status === "Anulowane") return { label: "Anulowane", className: "bg-muted text-muted-foreground", icon: null };
    return { label: "W realizacji", className: "bg-brand-soft text-primary", icon: null };
  };
  const orderList = (list: typeof orders) => <ul className="mt-3 w-full space-y-3 text-left">{list.map(o => {
    const isModel = o.product_type === "model_3d";
    const st = statusStyle(o.status);
    const StatusIcon = st.icon;
    return <li key={o.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
      <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-md bg-secondary"><img src={isModel ? giftBox : couple} alt="" loading="lazy" className="size-full object-contain" /></span>
      <span className="min-w-[150px] flex-1">
        <span className="flex flex-wrap items-center gap-2"><strong className="text-[13px] font-bold">{o.order_number}</strong><span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${isModel ? "bg-success-soft text-success" : "bg-brand-soft text-primary"}`}>{isModel ? "Model 3D" : "Figurka 3D"}</span></span>
        <span className="mt-1 block text-[12px] text-muted-foreground">{o.configuration?.title ?? (isModel ? "Gotowy model 3D" : "Figurka personalizowana")}</span>
      </span>
      <span className="text-[12px] text-muted-foreground">{new Date(o.created_at).toLocaleDateString("pl-PL")}</span>
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${st.className}`}>{StatusIcon && <StatusIcon className="size-3.5" />}{st.label}</span>
      <strong className="text-[14px] font-bold">{(Number(o.figurine_price) + Number(o.delivery_price)).toFixed(2).replace(".", ",")} zł</strong>
      <Button asChild variant="outline" size="sm" className="h-9 rounded-md border-primary/40 px-4 text-[11px] font-semibold text-primary hover:bg-brand-soft hover:text-primary"><Link to="/konto/zamowienia/$orderId" params={{ orderId: o.id }}>Szczegóły <ArrowRight className="size-3.5" /></Link></Button>
    </li>;
  })}</ul>;
  const cols = "lg:grid-cols-[110px_120px_minmax(160px,1fr)_100px_190px_100px_110px]";
  const dashboardOrderList = (list: typeof orders) => <div className="mt-3 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
    <div className={`hidden ${cols} items-center gap-3 border-b border-border px-5 py-3 text-[12px] font-medium text-muted-foreground lg:grid`}>
      <span>Nr zamówienia</span><span>Typ</span><span>Produkt</span><span>Data</span><span>Status</span><span>Cena</span><span>Akcje</span>
    </div>
    <ul className="divide-y divide-border">{list.map(o => {
      const isModel = o.product_type === "model_3d";
      const st = statusStyle(o.status);
      const StatusIcon = st.icon ?? Clock3;
      return <li key={o.id} className={`grid gap-3 px-5 py-3 text-left ${cols} lg:items-center`}>
        <strong className="text-[14px] font-extrabold">{o.order_number}</strong>
        <span className={`w-fit whitespace-nowrap rounded-md px-3 py-1.5 text-[12px] font-bold ${isModel ? "bg-success-soft text-success" : "bg-brand-soft text-primary"}`}>{isModel ? "Model 3D" : "Figurka 3D"}</span>
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-md bg-secondary"><img src={isModel ? giftBox : couple} alt="" loading="lazy" className="size-full object-contain" /></span>
          <span className="truncate text-[13px] font-medium">{o.configuration?.title ?? (isModel ? "Gotowy model 3D" : "Figurka personalizowana")}</span>
        </span>
        <span className="text-[13px] text-muted-foreground">{new Date(o.created_at).toLocaleDateString("pl-PL")}</span>
        <span className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-bold ${st.className}`}><StatusIcon className="size-3.5" />{st.label}</span>
        <strong className="whitespace-nowrap text-[14px] font-extrabold">{(Number(o.figurine_price) + Number(o.delivery_price)).toFixed(2).replace(".", ",")} zł</strong>
        <Button asChild variant="outline" className="h-10 w-fit rounded-md border-primary/40 px-4 text-[13px] font-bold text-primary hover:bg-brand-soft hover:text-primary"><Link to="/konto/zamowienia/$orderId" params={{ orderId: o.id }}>Zobacz <ArrowRight className="size-4" /></Link></Button>
      </li>;
    })}</ul>
  </div>;

  return <div className="flex min-h-screen flex-col bg-background">
    <SiteHeader />
    <main className="section-shell-wide w-full flex-1 py-6 md:py-9">
      <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm lg:grid lg:min-h-[680px] lg:grid-cols-[174px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-card p-3 lg:border-b-0 lg:border-r lg:py-5" aria-label="Panel klienta">
          <Link to="/" className="mb-5 hidden px-2 lg:block" aria-label="Strona główna"><img src={logoAsset.url} alt="prezent3d.com" className="h-7 w-auto" /></Link>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Menu konta">
            {navigation.map(({ id, label, icon: Icon }) => <Button key={id} type="button" variant="ghost" onClick={() => setView(id)} aria-current={view === id ? "page" : undefined} className={`h-10 shrink-0 justify-start gap-2 px-2.5 text-[12px] font-semibold lg:w-full ${view === id ? "bg-secondary text-primary hover:bg-secondary" : "text-foreground hover:text-primary"}`}><Icon className="size-4" />{label}</Button>)}
            {isAdmin && <Button asChild variant="ghost" className="h-10 shrink-0 justify-start gap-2 px-2.5 text-[12px] font-semibold text-primary lg:w-full"><Link to="/admin"><UserRound className="size-4" />Panel admina</Link></Button>}
            <Button type="button" variant="ghost" onClick={() => window.location.assign("/logowanie")} className="h-10 shrink-0 justify-start gap-2 px-2.5 text-[12px] font-semibold text-foreground lg:mt-1 lg:w-full"><LogOut className="size-4" />Wróć do logowania</Button>
          </nav>
        </aside>

        <div className="min-w-0 bg-background/50">
          <div className="flex min-h-14 items-center justify-between gap-4 border-b border-border bg-card px-4 py-2 sm:px-5">
            <label className="flex h-9 w-full max-w-[260px] items-center gap-2 rounded-md border border-border bg-background px-3 focus-within:border-primary"><Search className="size-4 shrink-0 text-primary" /><input type="search" value={query} onChange={e => { setQuery(e.target.value); if (e.target.value) setView("orders"); }} placeholder="Szukaj zamówień..." aria-label="Szukaj zamówień" className="min-w-0 w-full bg-transparent text-[11px] outline-none placeholder:text-muted-foreground" /></label>
            <div className="flex items-center gap-2 sm:gap-4"><Button type="button" variant="ghost" size="icon" aria-label="Powiadomienia" title="Powiadomienia" onClick={() => setNoticeOpen(!noticeOpen)} className="relative text-primary"><Bell className="size-5" /></Button><span className="hidden text-[11px] font-semibold sm:block">Moje konto</span><span className="grid size-8 place-items-center rounded-full bg-secondary text-primary"><UserRound className="size-4" /></span></div>
          </div>
          {noticeOpen && <div role="status" className="border-b border-border bg-secondary px-5 py-2 text-[11px] text-foreground">Nie masz nowych powiadomień.</div>}

          {view === "dashboard" ? <div className="space-y-4 p-4 sm:p-5">
            <div><h1 className="text-2xl font-extrabold">Cześć{profile?.display_name ? `, ${profile.display_name.split(" ")[0]}` : ""}!</h1><p className="mt-1 text-[13px] text-muted-foreground">Oto podsumowanie Twojego konta i zamówień.</p></div>
            {(() => {
              const cur = orders[0];
              const stages = [
                { name: "Opłacone", icon: CreditCard }, { name: "Projektowanie", icon: Pencil }, { name: "Wizualizacja", icon: Camera }, { name: "Modelowanie", icon: Box },
                { name: "Druk", icon: Package }, { name: "Malowanie", icon: Paintbrush }, { name: "Gotowe", icon: CheckCircle2 }, { name: "Wysłane", icon: Truck },
              ];
              const idx = cur ? Math.max(0, stages.findIndex(s => s.name === cur.status)) : -1;
              const fmt = (d: Date) => d.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
              const start = cur ? new Date(new Date(cur.created_at).getTime() + 14 * 864e5) : null;
              const end = cur ? new Date(new Date(cur.created_at).getTime() + 18 * 864e5) : null;
              const needsAction = cur && (cur.status === "Wizualizacja" || cur.status === "Poprawki");
              return <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
                <section className="relative min-h-[260px] overflow-hidden rounded-lg border border-border bg-gradient-to-br from-secondary via-card to-background p-6 shadow-sm">
                  <div className="relative z-10 max-w-[55%]">
                    {cur ? <>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"><Bell className="size-3.5" />{needsAction ? "Wymaga Twojej uwagi" : statusStyle(cur.status).label}</span>
                      <h2 className="mt-4 text-xl font-extrabold">{cur.product_type === "model_3d" ? "Model" : "Figurka"} {cur.order_number}</h2>
                      <p className="mt-1 text-[14px] leading-6">{needsAction ? "Wizualizacja jest gotowa do akceptacji." : `Aktualny etap: ${cur.status}.`}</p>
                      <Button asChild variant="hero" className="mt-5 px-5"><Link to="/konto/zamowienia/$orderId" params={{ orderId: cur.id }}>{needsAction ? "Zobacz wizualizację" : "Zobacz zamówienie"} <ArrowRight /></Link></Button>
                    </> : <>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"><Lightbulb className="size-3.5" />Zacznij tutaj</span>
                      <h2 className="mt-4 text-xl font-extrabold">Twoja pierwsza figurka</h2>
                      <p className="mt-1 text-[14px] leading-6">Prześlij zdjęcie, a my stworzymy z niego wyjątkową figurkę 3D.</p>
                      <Button asChild variant="hero" className="mt-5 px-5"><Link to="/oferta">Stwórz swoją figurkę 3D <ArrowRight /></Link></Button>
                    </>}
                  </div>
                  <img src={couple} alt="Figurka pary" width={768} height={768} className="absolute bottom-0 right-2 h-[95%] w-[45%] object-contain object-bottom" />
                </section>
                <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  {cur ? <>
                    <p className="text-[13px] font-semibold">Twoje aktualne zamówienie</p>
                    <div className="mt-1 flex items-center justify-between gap-3 border-b border-border pb-3"><strong className="text-xl font-extrabold">{cur.order_number}</strong><Link to="/konto/zamowienia/$orderId" params={{ orderId: cur.id }} className="inline-flex items-center gap-1 text-[12px] font-bold text-primary">Zobacz szczegóły <ArrowRight className="size-3.5" /></Link></div>
                    <ol className="mt-4 grid grid-cols-8 gap-0">{stages.map((s, i) => { const Icon = s.icon; const done = i <= idx; const active = i === idx; return <li key={s.name} className="relative flex flex-col items-center text-center">
                      {i > 0 && <span className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${i <= idx ? "bg-primary/50" : "bg-border"}`} />}
                      <span className={`relative z-10 grid size-8 place-items-center rounded-full border ${active ? "border-primary bg-primary text-primary-foreground" : done ? "border-primary/30 bg-brand-soft text-primary" : "border-border bg-card text-muted-foreground"}`}><Icon className="size-3.5" /></span>
                      <span className={`mt-1.5 text-[8px] leading-tight sm:text-[9px] ${active ? "font-bold text-primary" : "text-muted-foreground"}`}>{s.name}</span>
                    </li>; })}</ol>
                    <div className="mt-5 flex items-center gap-4 rounded-lg bg-brand-soft p-4"><Clock3 className="size-7 shrink-0 text-primary" /><div><p className="text-[12px] text-muted-foreground">Planowane zakończenie</p><p className="text-lg font-extrabold text-primary">{start!.getDate()} – {fmt(end!)}</p></div></div>
                  </> : <div className="flex h-full flex-col justify-center"><p className="text-[13px] font-semibold">Twoje aktualne zamówienie</p><p className="mt-2 text-[13px] text-muted-foreground">Nie masz jeszcze aktywnego zamówienia. Tutaj zobaczysz postęp realizacji: od płatności, przez projekt i druk, aż po wysyłkę.</p><Button asChild variant="outline" className="mt-4 w-fit border-primary/40 text-primary"><Link to="/sklep">Zobacz gotowe modele <ArrowRight /></Link></Button></div>}
                </section>
              </div>;
            })()}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Łączna liczba zamówień", icon: ShoppingBag, color: "text-primary", bg: "bg-secondary" },
                { label: "W realizacji", icon: Clock3, color: "text-chart-1", bg: "bg-promo-soft" },
                { label: "Gotowe do pobrania", icon: CheckCircle2, color: "text-chart-2", bg: "bg-accent" },
                { label: "Wysłane", icon: Truck, color: "text-primary", bg: "bg-secondary" },
              ].map(({ label, icon: Icon, color, bg }) => <Button key={label} type="button" variant="ghost" onClick={() => setView("orders")} className="h-auto min-h-[98px] min-w-0 justify-start gap-2 rounded-md border border-border bg-card px-2 py-3 text-left shadow-sm hover:bg-card sm:gap-3 sm:px-4"><span className={`grid size-9 shrink-0 place-items-center rounded-full sm:size-11 ${bg} ${color}`}><Icon className="size-5" /></span><span className="min-w-0 flex-1 whitespace-normal"><span className="block break-words text-[10px] leading-4 font-semibold">{label}</span><strong className="block text-base leading-6">{countFor(label)}</strong><span className="block text-[10px] leading-4 font-normal text-muted-foreground">{countFor(label) ? "Zamówienia" : "Brak zamówień"}</span></span><ChevronRight className="hidden size-3 shrink-0 text-primary sm:block" /></Button>)}
            </div>

            <section className="pt-2">
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-extrabold">Ostatnie zamówienia</h2><Button type="button" variant="link" onClick={() => setView("orders")} className="h-auto p-0 text-[13px] font-bold">Zobacz wszystkie <ArrowRight className="size-4" /></Button></div>
              {orders.length ? dashboardOrderList(orders.slice(0, 3)) : <div className="mt-3 flex flex-col items-center justify-center rounded-lg border border-border bg-card py-6 text-center"><img src={emptyBox} alt="Otwarte puste pudełko" loading="lazy" width={768} height={768} className="h-[110px] w-[150px] object-contain" /><h3 className="mt-1 text-[15px] font-bold">Brak zamówień</h3><p className="mt-1 text-[12px] leading-5 text-muted-foreground">Rozpocznij od stworzenia własnej figurki 3D lub wybierz gotowy model ze sklepu.</p><Button asChild variant="hero" size="sm" className="mt-3 px-6"><Link to="/oferta">Przejdź do oferty <ArrowRight /></Link></Button></div>}
            </section>

            <section className="pt-2">
              <h2 className="text-lg font-extrabold">Ostatnia aktywność</h2>
              {orders.length ? <ul className="mt-3 space-y-3">{orders.slice(0, 4).map(o => <li key={o.id} className="flex items-center gap-3 text-[13px]"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-primary"><Package className="size-4" /></span><span className="flex-1"><strong className="font-bold">{o.order_number}</strong> — status: {statusStyle(o.status).label}</span><span className="text-[12px] text-muted-foreground">{new Date(o.created_at).toLocaleDateString("pl-PL")}</span></li>)}</ul> : <Link to="/oferta" className="mt-3 flex items-center gap-3 text-[13px] hover:text-primary"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-primary"><Lightbulb className="size-4" /></span>Świetny moment, aby stworzyć swoją pierwszą figurkę!<ChevronRight className="size-4 text-primary" /></Link>}
            </section>

            <Link to="/oferta" className="relative flex min-h-[82px] items-center gap-3 overflow-hidden rounded-md border border-border bg-gradient-to-r from-secondary/60 via-card to-secondary/60 p-4 shadow-sm hover:border-primary/40"><img src={couple} alt="" loading="lazy" width={768} height={768} className="hidden h-[72px] w-[145px] shrink-0 object-cover object-top sm:block" /><div className="min-w-0 flex-1"><h2 className="text-sm font-extrabold">Zamów swoją wymarzoną figurkę 3D!</h2><p className="mt-1 text-[11px] leading-5">Przekształć swoje zdjęcia w wyjątkową figurkę, która będzie doskonałą pamiątką lub prezentem.</p></div><span className="hidden items-center gap-2 rounded-md bg-primary px-4 py-2 text-[11px] font-semibold text-primary-foreground sm:inline-flex">Zobacz ofertę <ArrowRight className="size-3" /></span></Link>
          </div> : view === "orders" ? <section className="min-h-[520px] space-y-4 p-4 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="py-1"><h1 className="text-xl font-extrabold sm:text-2xl">Moje zamówienia</h1><p className="mt-1 max-w-md text-[12px] leading-5 text-muted-foreground">Tutaj znajdziesz wszystkie swoje zamówienia – zarówno figurki 3D na zamówienie, jak i gotowe modele 3D ze sklepu.</p></div>
              <div className="relative flex min-h-[108px] overflow-hidden rounded-md border border-border bg-card p-2"><div className="relative w-full overflow-hidden rounded-md bg-secondary/70 p-4"><div className="relative z-10 max-w-[64%]"><h2 className="text-[13px] font-bold">Stwórz swoją figurkę 3D</h2><p className="mt-1 text-[11px] leading-4">Zamów personalizowaną figurkę ze swoich zdjęć i ciesz się wyjątkową pamiątką!</p><Link to="/oferta" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary underline underline-offset-2">Przejdź do konfiguratora <ArrowRight className="size-3" /></Link></div><img src={couple} alt="Figurka pary z psem" width={768} height={768} className="absolute -bottom-6 right-0 h-[125px] w-[38%] object-contain object-bottom" /></div></div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">{(["Wszystkie", "Figurki na zamówienie", "Modele 3D"] as const).map(t => <Button key={t} type="button" size="sm" variant={typeFilter === t ? "hero" : "outline"} onClick={() => setTypeFilter(t)} className="h-8 rounded-full px-4 text-[11px] font-semibold">{t}</Button>)}</div>
              <div className="flex flex-wrap gap-2">{(["Wszystkie", "W realizacji", "Wymaga działania", "Zakończone"] as const).map(s => <Button key={s} type="button" size="sm" variant={statusFilter === s ? "hero" : "outline"} onClick={() => setStatusFilter(s)} className="h-8 rounded-full px-4 text-[11px] font-semibold">{s}</Button>)}</div>
            </div>

            {filtered.length ? orderList(filtered) : <div className="flex flex-col items-center rounded-md border border-border bg-card px-5 py-10 text-center">
              <img src={emptyBox} alt="Otwarte puste pudełko" width={768} height={768} className="h-36 w-40 object-contain" />
              <h2 className="mt-3 text-lg font-extrabold">Nie masz jeszcze żadnych zamówień</h2>
              <p className="mt-2 max-w-md text-[12px] leading-5 text-muted-foreground">{query ? `Nie znaleziono zamówień dla „${query}”.` : "Gdy złożysz zamówienie na personalizowaną figurkę 3D lub kupisz gotowy model 3D, pojawi się ono tutaj. Możesz od razu przejść do konfiguratora i stworzyć coś wyjątkowego!"}</p>
              <Button asChild variant="hero" className="mt-5 px-6"><Link to="/oferta"><Box className="size-4" /> Stwórz swoją figurkę 3D <ArrowRight /></Link></Button>
              <div className="mt-8 grid w-full grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: Camera, title: "Własne zdjęcia", text: "Wyślij nam zdjęcia, a my zajmiemy się resztą." },
                  { icon: Box, title: "Precyzyjne modele 3D", text: "Wysoka jakość i dbałość o detale." },
                  { icon: Paintbrush, title: "Ręczne malowanie", text: "Opcja personalizacji i ręcznego malowania." },
                  { icon: Truck, title: "Bezpieczna dostawa", text: "Twoja figurka dotrze do Ciebie w idealnym stanie." },
                ].map(({ icon: Icon, title, text }) => <div key={title} className="flex items-start gap-3 text-left"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary"><Icon className="size-5" /></span><span><strong className="block text-[12px] font-bold">{title}</strong><span className="block text-[11px] leading-4 text-muted-foreground">{text}</span></span></div>)}
              </div>
            </div>}
          </section> : view === "profile" ? <section className="min-h-[520px] space-y-4 p-4 sm:p-6">
            <div><h1 className="text-xl font-extrabold sm:text-2xl">Dane konta</h1><p className="mt-1 text-[12px] text-muted-foreground">Zarządzaj swoimi danymi i ustawieniami konta.</p></div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-md border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between"><h2 className="text-sm font-extrabold">Podstawowe informacje</h2><Button type="button" variant="link" className="h-auto gap-1 p-0 text-[11px]">Edytuj <Pencil className="size-3" /></Button></div>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex flex-col items-center gap-2"><span className="grid size-20 place-items-center rounded-full bg-secondary text-primary"><UserRound className="size-9" /></span><Button type="button" variant="link" className="h-auto gap-1 p-0 text-[11px]"><Camera className="size-3" /> Zmień zdjęcie</Button></div>
                  <dl className="flex-1 space-y-4 text-[12px]">
                    <div><dt className="text-[11px] text-muted-foreground">Imię i nazwisko</dt><dd className="font-semibold">{profile?.display_name || "—"}</dd></div>
                    <div><dt className="text-[11px] text-muted-foreground">Email</dt><dd className="font-semibold">{profile?.email || "—"}</dd></div>
                    <div><dt className="text-[11px] text-muted-foreground">Numer telefonu</dt><dd className="font-semibold">+48 123 456 789</dd></div>
                  </dl>
                </div>
              </div>
              <div className="rounded-md border border-border bg-card p-5 shadow-sm">
                <h2 className="text-sm font-extrabold">Ustawienia konta</h2>
                <div className="mt-4 space-y-5">
                  {([
                    { key: "newsletter", title: "Newsletter", text: "Otrzymuj informacje o nowościach i promocjach." },
                    { key: "orderStatus", title: "Powiadomienia o statusie zamówień", text: "Bądź na bieżąco z postępem realizacji." },
                    { key: "savedAddresses", title: "Zapisane adresy", text: "Używaj zapisanych adresów podczas składania zamówień." },
                  ] as const).map(({ key, title, text }) => <div key={key} className="flex items-center justify-between gap-4"><div><h3 className="text-[12px] font-bold">{title}</h3><p className="text-[11px] text-muted-foreground">{text}</p></div><Toggle on={settings[key]} onClick={() => setSettings(s => ({ ...s, [key]: !s[key] }))} label={title} /></div>)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/50 p-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary"><ShieldCheck className="size-5" /></span><div><h2 className="text-[13px] font-bold">Twoje konto jest bezpieczne</h2><p className="text-[11px] text-muted-foreground">Wszystkie dane są chronione i wykorzystywane wyłącznie do realizacji zamówień.</p></div></div>
          </section> : view === "addresses" ? <section className="min-h-[520px] space-y-4 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-xl font-extrabold sm:text-2xl">Adresy</h1><p className="mt-1 text-[12px] text-muted-foreground">Zarządzaj swoimi adresami dostawy i rozliczeniowymi.</p></div><Button type="button" variant="hero" size="sm" className="gap-1 px-4"><Plus className="size-4" /> Dodaj nowy adres</Button></div>
            <div className="grid gap-4 lg:grid-cols-2">
              {[
                { tag: "Adres dostawy", selected: true, name: "Jan Kowalski", street: "ul. Kwiatowa 12", city: "00-123 Warszawa", country: "Polska" },
                { tag: "Adres rozliczeniowy", selected: false, name: "Jan Kowalski", street: "ul. Słoneczna 8", city: "00-123 Warszawa", country: "Polska" },
              ].map(a => <div key={a.tag} className="rounded-md border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${a.selected ? "bg-secondary text-primary" : "bg-accent text-chart-2"}`}>{a.tag}</span><span className="flex items-center gap-1"><Button type="button" variant="link" className="h-auto gap-1 p-0 text-[11px]"><Pencil className="size-3" /> Edytuj</Button><Button type="button" variant="ghost" size="icon" className="size-7" aria-label="Więcej opcji"><MoreVertical className="size-4" /></Button></span></div>
                <div className="mt-3 flex items-start gap-3"><span className={`mt-0.5 size-3.5 shrink-0 rounded-full border-2 ${a.selected ? "border-primary bg-primary" : "border-border bg-card"}`} /><div className="text-[12px] leading-5"><strong className="block text-[13px]">{a.name}</strong><span className="block">{a.street}</span><span className="block">{a.city}</span><span className="block">{a.country}</span></div></div>
                <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><Phone className="size-3.5" /> +48 123 456 789</span><span className="flex items-center gap-2"><Mail className="size-3.5" /> {profile?.email || "jan.kowalski@example.com"}</span></div>
              </div>)}
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-secondary/50 p-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary"><MapPin className="size-5" /></span><div className="min-w-0 flex-1"><h2 className="text-[13px] font-bold">Nie widzisz tutaj swojego adresu?</h2><p className="text-[11px] text-muted-foreground">Jeśli chcesz zmienić adres zamówienia, skontaktuj się z naszym zespołem.</p></div><Button asChild variant="outline" size="sm" className="gap-1 px-4"><Link to="/kontakt">Skontaktuj się <ArrowRight className="size-3" /></Link></Button></div>
          </section> : <section className="min-h-[520px] space-y-4 p-4 sm:p-6">
            <div><h1 className="text-xl font-extrabold sm:text-2xl">Płatności i faktury</h1><p className="mt-1 text-[12px] text-muted-foreground">Tutaj znajdziesz historię płatności oraz wystawione faktury.</p></div>
            <div className="flex flex-col items-center rounded-md border border-border bg-card px-5 py-16 text-center">
              <span className="grid size-24 place-items-center rounded-full bg-secondary/70 text-primary"><FileText className="size-10" /></span>
              <h2 className="mt-4 text-lg font-extrabold">Brak faktur</h2>
              <p className="mt-2 max-w-sm text-[12px] leading-5 text-muted-foreground">Na razie nie masz żadnych wystawionych faktur.<br />Po zrealizowaniu zamówień, faktury będą dostępne w tym miejscu.</p>
            </div>
          </section>}
        </div>
      </div>
    </main>
    <SiteFooter />
  </div>;
}