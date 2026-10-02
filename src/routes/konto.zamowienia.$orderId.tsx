import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Download, FileText, MessageSquare, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_STAGES, dateLabel, money, safeFileName, statusIndex, type Order, type OrderEvent, type OrderFile, type RevisionRequest, type Visualization, type VisualizationImage } from "@/lib/order-workflow";

export const Route = createFileRoute("/konto/zamowienia/$orderId")({
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

function CustomerOrderPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [files, setFiles] = useState<(OrderFile & { url: string })[]>([]);
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [revisions, setRevisions] = useState<RevisionRequest[]>([]);
  const [activeShot, setActiveShot] = useState(0);
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [showRevision, setShowRevision] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [feedback, setFeedback] = useState("");

  const load = async () => {
    const { data: current } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (!current) { setState("missing"); return; }
    const [{ data: history }, { data: versions }, { data: docs }, { data: changes }] = await Promise.all([
      supabase.from("order_events").select("*").eq("order_id", orderId).order("created_at", { ascending: false }),
      supabase.from("order_visualizations").select("*").eq("order_id", orderId).order("version", { ascending: false }),
      supabase.from("order_files").select("*").eq("order_id", orderId).order("created_at", { ascending: false }),
      supabase.from("revision_requests").select("*").eq("order_id", orderId).order("created_at", { ascending: false }),
    ]);
    const versionIds = (versions ?? []).map(v => v.id);
    const { data: imageRows } = versionIds.length ? await supabase.from("visualization_images").select("*").in("visualization_id", versionIds).order("sort_order") : { data: [] };
    const withUrls = await Promise.all((imageRows ?? []).map(async image => ({ ...image, url: (await supabase.storage.from("order-files").createSignedUrl(image.storage_path, 3600)).data?.signedUrl ?? "" })));
    const docsWithUrls = await Promise.all((docs ?? []).filter(d => d.category === "general").map(async doc => ({ ...doc, url: (await supabase.storage.from("order-files").createSignedUrl(doc.storage_path, 3600)).data?.signedUrl ?? "" })));
    setOrder(current); setEvents(history ?? []); setVisualizations(versions ?? []); setShots(withUrls); setFiles(docsWithUrls); setRevisions(changes ?? []); setState("ready");
  };
  useEffect(() => { void load(); }, [orderId]);

  const currentVisualization = visualizations.find(v => v.state === "awaiting_review") ?? visualizations[0];
  const currentShots = useMemo(() => shots.filter(s => s.visualization_id === currentVisualization?.id), [shots, currentVisualization]);
  useEffect(() => setActiveShot(0), [currentVisualization?.id]);

  const accept = async () => {
    if (!currentVisualization || !confirm("Zaakceptować tę wizualizację? Po akceptacji projekt przejdzie do modelowania.")) return;
    const { error } = await supabase.rpc("accept_order_visualization", { _visualization_id: currentVisualization.id });
    setFeedback(error?.message ?? "Projekt został zaakceptowany."); if (!error) await load();
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
    setFeedback(error?.message ?? (data === "awaiting_payment" ? "Prośba o dodatkową rundę za 50 zł została wysłana do administratora." : "Uwagi zostały wysłane."));
    if (!error) { setMessage(""); setAttachment(null); setShowRevision(false); await load(); }
  };

  if (state === "loading") return <Page><p className="p-8 text-sm text-muted-foreground">Ładowanie zamówienia…</p></Page>;
  if (state === "missing" || !order) return <Page><div className="p-8 text-center"><h1 className="text-xl font-extrabold">Nie znaleziono zamówienia</h1><Button asChild className="mt-4"><Link to="/konto" search={{ view: "orders" }}>Wróć do zamówień</Link></Button></div></Page>;
  const active = statusIndex(order.status);
  const awaiting = currentVisualization?.state === "awaiting_review";
  const paidRound = order.revision_rounds_used >= 2 && !order.paid_revision_unlocked;

  return <Page><div className="space-y-5 p-4 sm:p-6">
    <div><Link to="/konto" search={{ view: "orders" }} className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary"><ArrowLeft className="size-3" /> Powrót do listy</Link><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="text-xl font-extrabold sm:text-2xl">{order.order_number}</h1><span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold text-primary">Figurka na zamówienie</span><strong className="ml-auto text-sm">{money(Number(order.figurine_price) + Number(order.delivery_price))}</strong></div></div>
    <section className="overflow-x-auto rounded-md border border-border bg-card p-4"><div className="flex min-w-[720px] items-start">{ORDER_STAGES.map((stage, index) => <div key={stage} className="flex flex-1 items-start"><div className="flex min-w-16 flex-col items-center text-center"><span className={`grid size-7 place-items-center rounded-full border text-[10px] font-bold ${index < active ? "border-primary bg-primary text-primary-foreground" : index === active ? "border-primary bg-secondary text-primary" : "border-border bg-card text-muted-foreground"}`}>{index < active ? <Check className="size-3.5" /> : index + 1}</span><span className={`mt-1 text-[9px] font-semibold ${index === active ? "text-primary" : "text-muted-foreground"}`}>{stage}</span></div>{index < ORDER_STAGES.length - 1 && <span className={`mt-3.5 h-px flex-1 ${index < active ? "bg-primary" : "bg-border"}`} />}</div>)}</div></section>
    {order.status === "Projektowanie" && <Notice title="Przygotowujemy Twoją wizualizację" text="Nasz zespół pracuje nad projektem Twojej figurki." />}
    {feedback && <p className="rounded-md border border-primary/30 bg-secondary px-4 py-3 text-[12px]">{feedback}</p>}
    <div className="grid gap-5 lg:grid-cols-[1.45fr_.8fr]">
      <div className="space-y-5">
        {currentVisualization && currentShots.length > 0 ? <section className="rounded-md border border-border bg-card p-4"><div className="flex items-center justify-between"><h2 className="text-sm font-extrabold">{currentVisualization.name}</h2><span className="text-[10px] text-muted-foreground">v{currentVisualization.version}</span></div><div className="mt-3 grid gap-3 sm:grid-cols-[72px_1fr]"><div className="flex gap-2 overflow-x-auto sm:flex-col">{currentShots.map((shot, index) => <Button key={shot.id} variant={index === activeShot ? "secondary" : "ghost"} className="size-16 shrink-0 p-1" onClick={() => setActiveShot(index)}><img src={shot.url} alt={`Ujęcie ${index + 1}`} className="size-full rounded-sm object-cover" /></Button>)}</div><div className="relative overflow-hidden rounded-md bg-muted"><img src={currentShots[activeShot]?.url} alt={currentVisualization.name} className="aspect-square w-full object-contain" />{currentShots.length > 1 && <><Button size="icon" variant="secondary" className="absolute left-2 top-1/2 -translate-y-1/2" onClick={() => setActiveShot(i => (i - 1 + currentShots.length) % currentShots.length)}><ChevronLeft /></Button><Button size="icon" variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setActiveShot(i => (i + 1) % currentShots.length)}><ChevronRight /></Button></>}</div></div></section> : <section className="grid min-h-56 place-items-center rounded-md border border-border bg-card p-6 text-center"><div><Clock3 className="mx-auto size-8 text-primary" /><h2 className="mt-3 text-sm font-extrabold">Wizualizacja jeszcze nie jest gotowa</h2><p className="mt-1 text-[11px] text-muted-foreground">Pojawi się tutaj, gdy administrator wyśle ją do akceptacji.</p></div></section>}
        {awaiting && <section className="rounded-md border border-primary/30 bg-secondary/50 p-4"><h2 className="text-[13px] font-extrabold">Czy projekt wygląda tak, jak oczekujesz?</h2><p className="mt-1 text-[11px] text-muted-foreground">Sprawdź przygotowany projekt i zaakceptuj go lub zgłoś zmiany.</p>{paidRound ? <div className="mt-4 rounded-md bg-card p-5 text-center"><h3 className="text-sm font-bold">Wykorzystano bezpłatne rundy poprawek</h3><p className="mt-1 text-[11px] text-muted-foreground">Kolejna runda zmian kosztuje 50 zł. Wyślij zgłoszenie do administratora.</p><Button className="mt-3" onClick={() => setShowRevision(true)}>Zamów dodatkową rundę — 50 zł</Button></div> : <div className="mt-4 flex flex-wrap gap-2"><Button onClick={accept}><CheckCircle2 /> Akceptuję projekt</Button><Button variant="outline" onClick={() => setShowRevision(true)}><MessageSquare /> Chcę wprowadzić zmiany</Button></div>}</section>}
        {showRevision && <section className="rounded-md border border-border bg-card p-4"><h2 className="text-sm font-extrabold">Co chcesz zmienić?</h2><textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={1000} className="mt-3 min-h-28 w-full rounded-md border border-border bg-background p-3 text-[12px] outline-none focus:border-primary" placeholder="Opisz dokładnie oczekiwane zmiany…" /><label className="mt-3 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border p-3 text-[11px] text-muted-foreground"><Upload className="size-4 text-primary" /><input type="file" accept="image/*" className="sr-only" onChange={e => setAttachment(e.target.files?.[0] ?? null)} />{attachment?.name ?? "Dodaj zdjęcie referencyjne (opcjonalnie)"}</label><div className="mt-3 flex gap-2"><Button onClick={requestRevision}>Wyślij</Button><Button variant="ghost" onClick={() => setShowRevision(false)}>Anuluj</Button></div></section>}
      </div>
      <aside className="space-y-5">
        <section className="rounded-md border border-border bg-card p-4"><h2 className="text-sm font-extrabold">Informacje o zamówieniu</h2><dl className="mt-3 divide-y divide-border text-[11px]"><Info label="Status" value={order.status} /><Info label="Dostawa" value={`${order.delivery_label} · ${money(Number(order.delivery_price))}`} /><Info label="Darmowe poprawki" value={`${Math.min(order.revision_rounds_used, 2)} z 2 wykorzystane`} />{order.estimated_start && order.estimated_end && <Info label="Planowany termin" value={`${dateLabel(order.estimated_start)} – ${dateLabel(order.estimated_end)}`} />}{order.tracking_number && <Info label="Przesyłka" value={`${order.courier_name ?? "Kurier"}: ${order.tracking_number}`} />}</dl>{order.tracking_url && <Button asChild variant="outline" size="sm" className="mt-3 w-full"><a href={order.tracking_url} target="_blank" rel="noreferrer">Śledź przesyłkę</a></Button>}</section>
        <section className="rounded-md border border-border bg-card p-4"><h2 className="text-sm font-extrabold">Pliki zamówienia</h2>{files.length ? <div className="mt-3 space-y-2">{files.map(file => <a key={file.id} href={file.url} download={file.file_name} className="flex items-center gap-2 rounded-md border border-border p-3 text-[11px] hover:border-primary"><FileText className="size-4 text-primary" /><span className="min-w-0 flex-1 truncate">{file.file_name}</span><Download className="size-4" /></a>)}</div> : <p className="mt-3 text-[11px] text-muted-foreground">Nie dodano jeszcze plików.</p>}</section>
        <section className="rounded-md border border-border bg-card p-4"><h2 className="text-sm font-extrabold">Historia zamówienia</h2><div className="mt-3 space-y-4">{events.map(event => <div key={event.id} className="relative pl-5 text-[11px] before:absolute before:left-1 before:top-1.5 before:size-2 before:rounded-full before:bg-primary"><strong className="block">{event.title}</strong>{event.details && <p className="mt-0.5 text-muted-foreground">{event.details}</p>}<time className="text-[10px] text-muted-foreground">{dateLabel(event.created_at)}</time></div>)}{!events.length && <p className="text-[11px] text-muted-foreground">Brak zapisanych zdarzeń.</p>}</div></section>
        {revisions.length > 0 && <section className="rounded-md border border-border bg-card p-4"><h2 className="text-sm font-extrabold">Zgłoszone poprawki</h2>{revisions.map(r => <div key={r.id} className="mt-3 border-t border-border pt-3 text-[11px]"><strong>Runda {r.round_number}{r.status === "awaiting_payment" ? " · oczekuje na kontakt" : ""}</strong><p className="mt-1 text-muted-foreground">{r.message}</p></div>)}</section>}
      </aside>
    </div>
  </div></Page>;
}

function Page({ children }: { children: React.ReactNode }) { return <div className="flex min-h-screen flex-col bg-background"><SiteHeader /><main className="section-shell-wide w-full flex-1 py-6">{children}</main><SiteFooter /></div>; }
function Notice({ title, text }: { title: string; text: string }) { return <div className="rounded-md border border-primary/30 bg-secondary p-4"><h2 className="text-sm font-extrabold">{title}</h2><p className="mt-1 text-[11px] text-muted-foreground">{text}</p></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 py-2"><dt className="text-muted-foreground">{label}</dt><dd className="text-right font-semibold">{value}</dd></div>; }