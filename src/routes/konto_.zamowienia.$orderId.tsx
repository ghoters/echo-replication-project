import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bell, Box, Camera, Check, CheckCircle2, ChevronLeft, ChevronRight, CreditCard, Expand, Info as InfoIcon, LogOut, MapPin, Package, Paintbrush, Pencil, Search, Truck, Upload, UserRound, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { OrderMessages } from "@/components/OrderMessages";
import { ORDER_STAGES, dateLabel, money, safeFileName, statusIndex, type Order, type OrderEvent, type RevisionRequest, type Visualization, type VisualizationImage } from "@/lib/order-workflow";
import logoAsset from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/konto_/zamowienia/$orderId")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Szczegóły zamówienia — prezent3d.com" },
    { name: "description", content: "Postęp, wizualizacje i pliki Twojego zamówienia prezent3d.com." },
    { property: "og:title", content: "Szczegóły zamówienia — prezent3d.com" },
    { property: "og:description", content: "Sprawdź postęp i zaakceptuj wizualizację figurki." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: CustomerOrderPage,
});

type Shot = VisualizationImage & { url: string };
const STAGE_ICONS = [CreditCard, Pencil, Camera, Paintbrush, Package, Truck];
const NAV = [
  { view: "dashboard", label: "Pulpit", icon: Box },
  { view: "orders", label: "Moje zamówienia", icon: Package },
  { view: "profile", label: "Dane konta", icon: UserRound },
  { view: "addresses", label: "Adresy", icon: MapPin },
  { view: "payments", label: "Płatności i faktury", icon: CreditCard },
] as const;

function CustomerOrderPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [revisions, setRevisions] = useState<RevisionRequest[]>([]);
  const [activeShot, setActiveShot] = useState(0);
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [mode, setMode] = useState<"details" | "revision">("details");
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [feedback, setFeedback] = useState("");

  const load = async () => {
    const { data: current } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (!current) { setState("missing"); return; }
    const [{ data: history }, { data: versions }, { data: changes }] = await Promise.all([
      supabase.from("order_events").select("*").eq("order_id", orderId).order("created_at", { ascending: false }),
      supabase.from("order_visualizations").select("*").eq("order_id", orderId).order("version", { ascending: false }),
      supabase.from("revision_requests").select("*").eq("order_id", orderId).order("created_at", { ascending: false }),
    ]);
    const versionIds = (versions ?? []).map(v => v.id);
    const { data: imageRows } = versionIds.length ? await supabase.from("visualization_images").select("*").in("visualization_id", versionIds).order("sort_order") : { data: [] };
    const withUrls = await Promise.all((imageRows ?? []).map(async image => ({ ...image, url: (await supabase.storage.from("order-files").createSignedUrl(image.storage_path, 3600)).data?.signedUrl ?? "" })));
    setOrder(current); setEvents(history ?? []); setVisualizations(versions ?? []); setShots(withUrls); setRevisions(changes ?? []); setState("ready");
  };
  useEffect(() => { void load(); }, [orderId]);

  const currentVisualization = visualizations.find(v => v.state === "awaiting_review") ?? visualizations[0];
  const currentShots = useMemo(() => shots.filter(s => s.visualization_id === currentVisualization?.id), [shots, currentVisualization]);
  useEffect(() => setActiveShot(0), [currentVisualization?.id]);

  const accept = async () => {
    if (!currentVisualization || !confirm("Zaakceptować ten projekt? Po akceptacji figurka przejdzie do produkcji.")) return;
    const { error } = await supabase.rpc("accept_order_visualization", { _visualization_id: currentVisualization.id });
    setFeedback(error?.message ?? "Projekt został zaakceptowany. Rozpoczynamy produkcję."); if (!error) await load();
  };
  const requestRevision = async () => {
    if (!currentVisualization || message.trim().length < 3 || !order) { setFeedback("Opisz, co chcesz zmienić."); return; }
    let attachmentPath: string | undefined;
    if (attachment) {
      attachmentPath = `${order.id}/revisions/${crypto.randomUUID()}-${safeFileName(attachment.name)}`;
      const { error } = await supabase.storage.from("order-files").upload(attachmentPath, attachment);
      if (error) { setFeedback(error.message); return; }
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) await supabase.from("order_files").insert({ order_id: order.id, uploaded_by: userData.user.id, storage_path: attachmentPath, file_name: attachment.name, file_size: attachment.size, mime_type: attachment.type || "application/octet-stream", category: "revision_reference" });
    }
    const { data, error } = await supabase.rpc("request_order_revision", { _visualization_id: currentVisualization.id, _message: message.trim(), _attachment_path: attachmentPath ?? "" });
    setFeedback(error?.message ?? (data === "awaiting_payment" ? "Prośba o dodatkową rundę została wysłana. Skontaktujemy się w sprawie płatności." : "Uwagi zostały wysłane. Przygotujemy nową wersję wizualizacji."));
    if (!error) { setMessage(""); setAttachment(null); setMode("details"); await load(); }
  };

  if (state === "loading") return <Shell><p className="p-8 text-sm text-muted-foreground">Ładowanie zamówienia…</p></Shell>;
  if (state === "missing" || !order) return <Shell><div className="p-8 text-center"><h1 className="text-xl font-extrabold">Nie znaleziono zamówienia</h1><Button asChild className="mt-4"><Link to="/konto" search={{ view: "orders" }}>Wróć do zamówień</Link></Button></div></Shell>;

  const active = statusIndex(order.status);
  const awaiting = currentVisualization?.state === "awaiting_review";
  const freeUsed = order.revision_rounds_used >= 2 && !order.paid_revision_unlocked;
  const cfg = (order.configuration ?? {}) as Record<string, unknown>;
  const val = (k: string, fallback = "—") => (typeof cfg[k] === "string" || typeof cfg[k] === "number") ? String(cfg[k]) : fallback;
  const total = Number(order.figurine_price) + Number(order.delivery_price);
  const shot = currentShots[activeShot];

  if (mode === "revision") return <Shell>
    <div className="space-y-5 p-4 sm:p-6">
      <div><h1 className="text-xl font-extrabold">{freeUsed ? "Wykorzystano bezpłatne rundy poprawek" : "Wprowadź zmiany do wizualizacji"}</h1><button type="button" onClick={() => setMode("details")} className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-primary"><ArrowLeft className="size-3.5" /> Powrót do szczegółów</button></div>
      {feedback && <p className="rounded-md border border-primary/30 bg-secondary px-4 py-3 text-[12px]">{feedback}</p>}
      {freeUsed ? <section className="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-soft text-primary"><Wand2 className="size-7" /></span>
        <h2 className="mt-4 text-[15px] font-extrabold">Wykorzystano bezpłatne rundy poprawek</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">Możesz poprosić o kolejną zmianę. Koszt kolejnej rundy to 50 zł.</p>
        <textarea value={message} onChange={e => setMessage(e.target.value.slice(0, 500))} className="mx-auto mt-4 block min-h-24 w-full max-w-lg rounded-md border border-border bg-background p-3 text-[12px] outline-none focus:border-primary" placeholder="Opisz, co chcesz zmienić…" />
        <Button className="mt-4 h-10 px-6 font-bold" onClick={requestRevision}>Zamów dodatkową rundę <ArrowRight /></Button>
      </section> : <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-[110px_1fr]">
          <span className="grid aspect-[4/5] place-items-center overflow-hidden rounded-md bg-muted">{currentShots[0] ? <img src={currentShots[0].url} alt="" className="size-full object-cover" /> : <Camera className="size-6 text-muted-foreground" />}</span>
          <div>
            <h2 className="text-[13px] font-extrabold">Co chcesz zmienić?</h2>
            <textarea value={message} onChange={e => setMessage(e.target.value.slice(0, 500))} className="mt-2 min-h-28 w-full rounded-md border border-border bg-background p-3 text-[12px] outline-none focus:border-primary" placeholder="np. Zmień kolor kurtki na ciemniejszy, dodaj plecak, zmień pozycję postaci itp…" />
            <p className="text-right text-[10px] text-muted-foreground">{message.length} / 500</p>
            <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-md border border-border p-3"><span className="grid size-9 place-items-center rounded-md bg-brand-soft text-primary"><Upload className="size-4" /></span><input type="file" accept="image/*" className="sr-only" onChange={e => setAttachment(e.target.files?.[0] ?? null)} /><span className="text-[12px]"><strong>Dodaj zdjęcie</strong> <span className="text-muted-foreground">(opcjonalnie)</span><span className="block text-[11px] text-muted-foreground">{attachment?.name ?? "Możesz dodać pliki referencyjne"}</span></span></label>
            <Button className="mt-4 h-10 w-full font-bold" onClick={requestRevision}>Wyślij</Button>
          </div>
        </div>
      </section>}
      {freeUsed ? <section><h2 className="text-[14px] font-extrabold">Historia zmian</h2><div className="mt-3 rounded-lg border border-border bg-card p-4 shadow-sm">{visualizations.map((v, i) => <div key={v.id} className="flex items-center gap-4 border-b border-border py-3 text-[12px] last:border-0"><span className="size-2.5 rounded-full bg-primary" /><span className="w-12 font-semibold">{new Date(v.created_at).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" })}</span><span className="flex-1">{v.name}{i === 0 ? " – aktualna wersja" : ""}</span><span className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${v.state === "accepted" ? "bg-success-soft text-success" : v.state === "changes_requested" ? "bg-warning-soft text-warning" : "bg-brand-soft text-primary"}`}>{i === 0 ? "Aktualna" : v.state === "changes_requested" ? "Poprawki" : v.state === "accepted" ? "Zaakceptowana" : "Archiwalna"}</span></div>)}</div></section>
        : <section className="flex gap-4 rounded-lg border border-primary/30 bg-brand-soft p-5"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-primary"><InfoIcon className="size-4" /></span><div><h2 className="text-[13px] font-extrabold">Czy projekt wymaga zmiany?</h2><p className="mt-1 text-[12px] text-muted-foreground">Po otrzymaniu Twoich uwag przygotujemy nową wersję wizualizacji.</p></div></section>}
    </div>
  </Shell>;

  return <Shell><div className="space-y-4 p-4 sm:p-6">
    <div>
      <Link to="/konto" search={{ view: "orders" }} className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary"><ArrowLeft className="size-3.5" /> Powrót do listy</Link>
      <div className="mt-2 flex flex-wrap items-end gap-3">
        <h1 className="text-2xl font-extrabold sm:text-[28px]">{order.order_number}</h1>
        <span className="mb-1 rounded-full border border-primary/30 bg-brand-soft px-3 py-1 text-[11px] font-bold text-primary">{order.product_type === "model_3d" ? "Model 3D" : "Figurka na zamówienie"}</span>
        <div className="ml-auto text-right"><span className="block text-[10px] text-muted-foreground">Wartość zamówienia</span><strong className="text-xl font-extrabold">{money(total)}</strong></div>
      </div>
    </div>

    <section className="overflow-x-auto rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <div className="flex min-w-[560px] items-start">{ORDER_STAGES.map((stage, index) => { const Icon = STAGE_ICONS[index] ?? Check; const done = index < active; const cur = index === active; return <div key={stage} className="flex flex-1 items-start last:flex-none">
        <div className="flex w-20 flex-col items-center text-center">
          <span className={`grid size-8 place-items-center rounded-full border-2 transition-colors ${cur ? "border-primary bg-primary text-primary-foreground shadow-md" : done ? "border-primary bg-brand-soft text-primary" : "border-border bg-card text-muted-foreground"}`}>{done ? <Check className="size-4" /> : <Icon className="size-4" />}</span>
          <span className={`mt-1.5 text-[11px] ${cur ? "font-extrabold text-primary" : done ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>{stage}</span>
        </div>
        {index < ORDER_STAGES.length - 1 && <span className={`mt-4 h-0.5 flex-1 rounded-full ${done ? "bg-primary" : "bg-border"}`} />}
      </div>; })}</div>
    </section>

    {feedback && <p className="rounded-md border border-primary/30 bg-secondary px-4 py-3 text-[12px]">{feedback}</p>}

    {(order.status === "Wysłane" || order.tracking_number) && <section className="flex flex-wrap items-center gap-4 rounded-lg border border-primary/30 bg-brand-soft p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-card text-primary"><Truck className="size-5" /></span>
      <div className="min-w-0 flex-1"><h2 className="text-[14px] font-extrabold">{order.status === "Wysłane" ? "Twoja paczka jest w drodze!" : "Przesyłka przygotowana"}</h2><p className="mt-1 text-[12px] text-muted-foreground">{order.courier_name ?? "Kurier"}{order.tracking_number ? ` · nr przesyłki: ${order.tracking_number}` : ""}</p></div>
      {order.tracking_url && <Button asChild className="font-bold"><a href={order.tracking_url} target="_blank" rel="noreferrer">Śledź przesyłkę <ArrowRight /></a></Button>}
    </section>}

    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <h2 className="text-[13px] font-extrabold">{currentVisualization ? `Wizualizacja projektu (v${currentVisualization.version})` : "Wizualizacja projektu"}</h2>
        {currentVisualization && currentShots.length > 0 ? <div className="mt-3 grid gap-3 sm:grid-cols-[64px_1fr]">
          <div className="flex gap-2 overflow-x-auto sm:max-h-[420px] sm:flex-col sm:overflow-y-auto">{currentShots.map((s, index) => <button type="button" key={s.id} onClick={() => setActiveShot(index)} className={`size-14 shrink-0 overflow-hidden rounded-md border-2 bg-muted transition-colors ${index === activeShot ? "border-primary" : "border-transparent hover:border-border"}`}><img src={s.url} alt={`Ujęcie ${index + 1}`} className="size-full object-cover" /></button>)}</div>
          <div className="relative overflow-hidden rounded-md bg-muted">
            <img src={shot?.url} alt={currentVisualization.name} className="h-[420px] w-full object-contain" />
            {currentShots.length > 1 && <><Button size="icon" variant="secondary" className="absolute left-2 top-1/2 size-7 -translate-y-1/2 rounded-full bg-card shadow" onClick={() => setActiveShot(i => (i - 1 + currentShots.length) % currentShots.length)} aria-label="Poprzednie"><ChevronLeft /></Button><Button size="icon" variant="secondary" className="absolute right-2 top-1/2 size-7 -translate-y-1/2 rounded-full bg-card shadow" onClick={() => setActiveShot(i => (i + 1) % currentShots.length)} aria-label="Następne"><ChevronRight /></Button></>}
            {shot && <a href={shot.url} target="_blank" rel="noreferrer" className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-md bg-card px-2.5 py-1.5 text-[10px] font-semibold shadow"><Expand className="size-3" /> Otwórz w nowym oknie <ArrowRight className="size-3" /></a>}
          </div>
        </div> : <div className="mt-3 grid min-h-[420px] place-items-center rounded-md bg-muted/50 p-6 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-primary">{active <= 1 ? <Pencil className="size-5" /> : <Camera className="size-5" />}</span><h3 className="mt-3 text-[13px] font-extrabold">{active === 0 ? "Zamówienie oczekuje na zatwierdzenie" : "Przygotowujemy wizualizację"}</h3><p className="mt-1 text-[11px] text-muted-foreground">{active === 0 ? "Wkrótce sprawdzimy Twoje zamówienie i rozpoczniemy projektowanie." : "Pojawi się tutaj, gdy będzie gotowa do Twojej akceptacji."}</p></div></div>}
      </section>

      <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <h2 className="text-[13px] font-extrabold">Informacje o zamówieniu</h2>
        <dl className="mt-3 divide-y divide-border text-[12px]">
          <Row label="Typ" value={order.product_type === "model_3d" ? "Model 3D" : "Figurka na zamówienie"} />
          <Row label="Rozmiar" value={val("size")} />
          <Row label="Wykończenie" value={<span className="rounded bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning">{val("finish", "Ręcznie malowana")}</span>} />
          <Row label="Podstawka" value={val("base")} />
          <Row label="Liczba osób" value={val("people")} />
          <Row label="Dodatkowe elementy" value={val("extras", "Brak")} />
          <Row label="Dostawa" value={order.delivery_label || "—"} />
          <Row label="Planowany start" value={order.estimated_start ? dateLabel(order.estimated_start) : "Wkrótce podamy"} />
          <Row label="Planowane zakończenie" value={order.estimated_end ? dateLabel(order.estimated_end) : "Wkrótce podamy"} />
        </dl>
      </section>
    </div>

    {awaiting && <section className="rounded-lg border border-primary/30 bg-brand-soft p-5">
      <div className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-primary bg-card" /><div><h2 className="text-[14px] font-extrabold">Czy projekt wygląda tak, jak oczekujesz?</h2><p className="mt-1 text-[12px] text-muted-foreground">Sprawdź przygotowany projekt i zaakceptuj go lub zgłoś zmiany.</p></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:pl-12"><Button className="h-11 font-bold" onClick={accept}><Check /> Akceptuję projekt</Button><Button variant="outline" className="h-11 border-primary/40 bg-card font-bold text-primary hover:bg-card hover:text-primary" onClick={() => setMode("revision")}>Chcę wprowadzić zmiany</Button></div>
    </section>}

    <OrderMessages orderId={order.id} />

    {events.length > 0 && <section className="rounded-lg border border-border bg-card p-4 shadow-sm"><h2 className="text-[13px] font-extrabold">Historia zamówienia</h2><div className="mt-3 space-y-3">{events.slice(0, 8).map(event => <div key={event.id} className="flex items-start gap-3 text-[12px]"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /><span className="flex-1"><strong>{event.title}</strong>{event.details && event.event_type === "revision_requested" && <span className="block text-muted-foreground">{event.details}</span>}</span><time className="text-[11px] text-muted-foreground">{dateLabel(event.created_at)}</time></div>)}</div></section>}
    {revisions.some(r => r.status === "awaiting_payment") && <p className="text-[11px] text-muted-foreground">Twoja prośba o dodatkową rundę poprawek oczekuje na potwierdzenie.</p>}
  </div></Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-background"><SiteHeader /><main className="section-shell-wide w-full flex-1 py-6 md:py-9">
    <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm lg:grid lg:min-h-[680px] lg:grid-cols-[174px_minmax(0,1fr)]">
      <aside className="border-b border-border bg-card p-3 lg:border-b-0 lg:border-r lg:py-5" aria-label="Panel klienta">
        <Link to="/" className="mb-5 hidden px-2 lg:block" aria-label="Strona główna"><img src={logoAsset.url} alt="prezent3d.com" className="h-7 w-auto" /></Link>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Menu konta">
          {NAV.map(({ view, label, icon: Icon }) => <Button key={view} asChild variant="ghost" className={`h-10 shrink-0 justify-start gap-2 px-2.5 text-[12px] font-semibold lg:w-full ${view === "orders" ? "bg-secondary text-primary hover:bg-secondary" : "text-foreground hover:text-primary"}`}><Link to="/konto" search={{ view }}><Icon className="size-4" />{label}</Link></Button>)}
          <Button type="button" variant="ghost" onClick={() => window.location.assign("/logowanie")} className="h-10 shrink-0 justify-start gap-2 px-2.5 text-[12px] font-semibold text-foreground lg:mt-1 lg:w-full"><LogOut className="size-4" />Wróć do logowania</Button>
        </nav>
      </aside>
      <div className="min-w-0 bg-background/50">
        <div className="flex min-h-14 items-center justify-between gap-4 border-b border-border bg-card px-4 py-2 sm:px-5">
          <label className="flex h-9 w-full max-w-[260px] items-center gap-2 rounded-md border border-border bg-background px-3"><Search className="size-4 shrink-0 text-primary" /><input type="search" placeholder="Szukaj zamówień..." aria-label="Szukaj zamówień" className="w-full min-w-0 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground" /></label>
          <div className="flex items-center gap-2 sm:gap-4"><Bell className="size-5 text-primary" /><span className="hidden text-[11px] font-semibold sm:block">Moje konto</span><span className="grid size-8 place-items-center rounded-full bg-secondary text-primary"><UserRound className="size-4" /></span></div>
        </div>
        {children}
      </div>
    </div>
  </main><SiteFooter /></div>;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) { return <div className="grid grid-cols-[120px_1fr] gap-3 py-1.5"><dt className="text-muted-foreground">{label}</dt><dd className="font-semibold">{value}</dd></div>; }
