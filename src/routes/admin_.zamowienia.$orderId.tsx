import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { OrderMessages } from "@/components/OrderMessages";
import { ArrowLeft, CheckCircle2, FileText, Send, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_STATUSES, dateLabel, money, safeFileName, type Order, type OrderEvent, type OrderFile, type RevisionRequest, type Visualization, type VisualizationImage } from "@/lib/order-workflow";

export const Route = createFileRoute("/admin_/zamowienia/$orderId")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Obsługa zamówienia — prezent3d.com" },
    { name: "description", content: "Administracyjna obsługa procesu zamówienia." },
    { property: "og:title", content: "Obsługa zamówienia — prezent3d.com" },
    { property: "og:description", content: "Administracyjna obsługa procesu zamówienia." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }), component: AdminOrderPage,
});

const field = "h-9 w-full rounded-md border border-border bg-background px-3 text-[12px] outline-none focus:border-primary";

function AdminOrderPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [versions, setVersions] = useState<Visualization[]>([]);
  const [images, setImages] = useState<VisualizationImage[]>([]);
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [revisions, setRevisions] = useState<RevisionRequest[]>([]);
  const [profile, setProfile] = useState<{ display_name: string; email: string } | null>(null);
  const [visualFiles, setVisualFiles] = useState<File[]>([]);
  const [generalFile, setGeneralFile] = useState<File | null>(null);
  const [form, setForm] = useState({ status: "Opłacone", estimated_start: "", estimated_end: "", courier_name: "", tracking_number: "", tracking_url: "" });
  const [feedback, setFeedback] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "denied">("loading");

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setState("denied"); return; }
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin");
    if (!role?.length) { setState("denied"); return; }
    const { data: current } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (!current) { setState("denied"); return; }
    const [{ data: history }, { data: visualData }, { data: docs }, { data: changes }, { data: owner }] = await Promise.all([
      supabase.from("order_events").select("*").eq("order_id", orderId).order("created_at", { ascending: false }),
      supabase.from("order_visualizations").select("*").eq("order_id", orderId).order("version", { ascending: false }),
      supabase.from("order_files").select("*").eq("order_id", orderId).order("created_at", { ascending: false }),
      supabase.from("revision_requests").select("*").eq("order_id", orderId).order("created_at", { ascending: false }),
      supabase.from("profiles").select("display_name,email").eq("id", current.user_id).maybeSingle(),
    ]);
    const visualIds = (visualData ?? []).map(v => v.id);
    const { data: shotRows } = visualIds.length ? await supabase.from("visualization_images").select("*").in("visualization_id", visualIds).order("sort_order") : { data: [] };
    setOrder(current); setEvents(history ?? []); setVersions(visualData ?? []); setImages(shotRows ?? []); setFiles(docs ?? []); setRevisions(changes ?? []); setProfile(owner);
    setForm({ status: current.status, estimated_start: current.estimated_start ?? "", estimated_end: current.estimated_end ?? "", courier_name: current.courier_name ?? "", tracking_number: current.tracking_number ?? "", tracking_url: current.tracking_url ?? "" }); setState("ready");
  };
  useEffect(() => { void load(); }, [orderId]);

  const saveOrder = async () => {
    const { error } = await supabase.from("orders").update({ status: form.status, estimated_start: form.estimated_start || null, estimated_end: form.estimated_end || null, courier_name: form.courier_name || null, tracking_number: form.tracking_number || null, tracking_url: form.tracking_url || null }).eq("id", orderId);
    setFeedback(error?.message ?? "Zmiany zostały zapisane."); if (!error) await load();
  };
  const setStage = async (status: string) => {
    const { error } = await supabase.from("orders").update({ status, courier_name: form.courier_name || null, tracking_number: form.tracking_number || null, tracking_url: form.tracking_url || null }).eq("id", orderId);
    setFeedback(error?.message ?? `Zamówienie przeszło do etapu: ${status}.`); if (!error) await load();
  };
  const uploadVisualization = async () => {
    if (!visualFiles.length) { setFeedback("Wybierz przynajmniej jedno ujęcie."); return; }
    const { data: userData } = await supabase.auth.getUser(); if (!userData.user) return;
    const version = (versions[0]?.version ?? 0) + 1;
    const { data: visual, error } = await supabase.from("order_visualizations").insert({ order_id: orderId, version, name: `Wizualizacja v${version}`, created_by: userData.user.id }).select().single();
    if (error || !visual) { setFeedback(error?.message ?? "Nie udało się utworzyć wersji."); return; }
    for (let index = 0; index < visualFiles.length; index += 1) {
      const file = visualFiles[index]; if (!file) continue;
      const path = `${orderId}/visualizations/v${version}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const uploaded = await supabase.storage.from("order-files").upload(path, file);
      if (uploaded.error) { setFeedback(uploaded.error.message); return; }
      await supabase.from("visualization_images").insert({ visualization_id: visual.id, storage_path: path, file_name: file.name, sort_order: index });
    }
    const published = await supabase.rpc("publish_order_visualization", { _visualization_id: visual.id });
    setFeedback(published.error?.message ?? `Wizualizacja v${version} została wysłana klientowi.`); setVisualFiles([]); if (!published.error) await load();
  };
  const uploadGeneral = async () => {
    if (!generalFile) return; const { data: userData } = await supabase.auth.getUser(); if (!userData.user) return;
    const path = `${orderId}/files/${crypto.randomUUID()}-${safeFileName(generalFile.name)}`;
    const uploaded = await supabase.storage.from("order-files").upload(path, generalFile); if (uploaded.error) { setFeedback(uploaded.error.message); return; }
    const { error } = await supabase.from("order_files").insert({ order_id: orderId, uploaded_by: userData.user.id, storage_path: path, file_name: generalFile.name, file_size: generalFile.size, mime_type: generalFile.type || "application/octet-stream", category: "general" });
    setFeedback(error?.message ?? "Plik został dodany."); setGeneralFile(null); if (!error) await load();
  };
  const unlockPaidRound = async (request: RevisionRequest) => {
    const { error } = await supabase.from("orders").update({ paid_revision_unlocked: true }).eq("id", orderId);
    if (!error) await supabase.from("revision_requests").update({ status: "approved" }).eq("id", request.id);
    setFeedback(error?.message ?? "Dodatkowa runda została odblokowana."); if (!error) await load();
  };

  if (state !== "ready" || !order) return <Shell><div className="p-8 text-center"><h1 className="text-xl font-extrabold">{state === "loading" ? "Ładowanie…" : "Brak dostępu"}</h1></div></Shell>;
  return <Shell><div className="space-y-5 p-4 sm:p-6">
    <div><Link to="/admin" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary"><ArrowLeft className="size-3" /> Panel admina</Link><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="text-xl font-extrabold sm:text-2xl">{order.order_number}</h1><span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold text-primary">{order.status}</span><strong className="ml-auto text-sm">{money(Number(order.figurine_price) + Number(order.delivery_price))}</strong></div><p className="mt-1 text-[11px] text-muted-foreground">{profile?.display_name || "Klient"} · {profile?.email || order.user_id}</p></div>
    {feedback && <p className="rounded-md border border-primary/30 bg-secondary px-4 py-3 text-[12px]">{feedback}</p>}
    <AdminAlert events={events} revisions={revisions} lastMsg={lastMsg} />
    {(() => {
      const latest = events[0];
      return latest ? <div className="hidden" data-latest={latest.id} /> : null;
    })()}
    <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
      <div className="space-y-5">
<section className="rounded-md border border-primary/30 bg-secondary/50 p-4"><h2 className="text-sm font-extrabold">Następny krok</h2>{(() => {
          const s = order.status;
          if (s === "Opłacone") return <><p className="mt-1 text-[11px] text-muted-foreground">Sprawdź zamówienie i zatwierdź je, aby rozpocząć projektowanie.</p><Button className="mt-3" onClick={() => setStage("Projektowanie")}><CheckCircle2 /> Zatwierdź zamówienie i rozpocznij projektowanie</Button></>;
          if (s === "Projektowanie" || s === "Poprawki") return <p className="mt-1 text-[11px] text-muted-foreground">Dodaj zdjęcia w sekcji „Dodaj wizualizację” poniżej — klient dostanie je do akceptacji.</p>;
          if (s === "Wizualizacja") return <p className="mt-1 text-[11px] text-muted-foreground">Czekamy na decyzję klienta (akceptacja lub poprawki).</p>;
          if (s === "Produkcja") return <><p className="mt-1 text-[11px] text-muted-foreground">Modelowanie, druk i malowanie. Gdy figurka będzie gotowa, oznacz to.</p><Button className="mt-3" onClick={() => setStage("Gotowe")}><CheckCircle2 /> Oznacz jako gotowe do wysyłki</Button></>;
          if (s === "Gotowe") return <><p className="mt-1 text-[11px] text-muted-foreground">Uzupełnij firmę kurierską i numer przesyłki poniżej, a potem kliknij.</p><Button className="mt-3" onClick={() => setStage("Wysłane")}><Send /> Oznacz jako wysłane</Button></>;
          return <p className="mt-1 text-[11px] text-muted-foreground">Zamówienie zakończone.</p>;
        })()}</section>
        <section className="rounded-md border border-border bg-card p-4"><h2 className="text-sm font-extrabold">Zmień etap realizacji</h2><p className="mt-1 text-[11px] text-muted-foreground">Kliknij etap, aby od razu ustawić go w zamówieniu. Klient zobaczy zmianę na swoim koncie.</p><div className="mt-3 flex flex-wrap gap-2">{ORDER_STATUSES.map(s => <Button key={s} size="sm" variant={order.status === s ? "default" : "outline"} disabled={order.status === s} onClick={() => { if (confirm(`Zmienić etap na „${s}”?`)) void setStage(s); }}>{s}</Button>)}</div></section>
        <section className="rounded-md border border-border bg-card p-4"><h2 className="text-sm font-extrabold">Proces realizacji</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-[11px]">Status<select className={`${field} mt-1`} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}</select></label><span /><label className="text-[11px]">Planowany początek<input type="date" className={`${field} mt-1`} value={form.estimated_start} onChange={e => setForm({ ...form, estimated_start: e.target.value })} /></label><label className="text-[11px]">Planowane zakończenie<input type="date" className={`${field} mt-1`} value={form.estimated_end} onChange={e => setForm({ ...form, estimated_end: e.target.value })} /></label><label className="text-[11px]">Firma kurierska<input className={`${field} mt-1`} value={form.courier_name} onChange={e => setForm({ ...form, courier_name: e.target.value })} /></label><label className="text-[11px]">Numer przesyłki<input className={`${field} mt-1`} value={form.tracking_number} onChange={e => setForm({ ...form, tracking_number: e.target.value })} /></label><label className="text-[11px] sm:col-span-2">Link śledzenia<input type="url" className={`${field} mt-1`} value={form.tracking_url} onChange={e => setForm({ ...form, tracking_url: e.target.value })} /></label></div><Button className="mt-4" onClick={saveOrder}><CheckCircle2 /> Zapisz zmiany</Button></section>
        <section className="rounded-md border border-border bg-card p-4"><h2 className="text-sm font-extrabold">Dodaj wizualizację</h2><p className="mt-1 text-[11px] text-muted-foreground">Wybrane zdjęcia utworzą wersję v{(versions[0]?.version ?? 0) + 1} i zostaną od razu wysłane do akceptacji.</p><label className="mt-3 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border p-4 text-[11px]"><Upload className="size-4 text-primary" /><input type="file" accept="image/*" multiple className="sr-only" onChange={e => setVisualFiles(Array.from(e.target.files ?? []))} />{visualFiles.length ? `${visualFiles.length} wybranych ujęć` : "Wybierz obrazy wizualizacji"}</label><Button className="mt-3" disabled={!visualFiles.length} onClick={uploadVisualization}><Send /> Wyślij do akceptacji</Button>{versions.length > 0 && <div className="mt-4 space-y-2">{versions.map(v => <div key={v.id} className="flex items-center justify-between rounded-md border border-border p-3 text-[11px]"><span><strong>{v.name}</strong><small className="ml-2 text-muted-foreground">{images.filter(i => i.visualization_id === v.id).length} ujęć</small></span><span className="rounded-full bg-secondary px-2 py-1 text-primary">{v.state}</span></div>)}</div>}</section>
        <section className="rounded-md border border-border bg-card p-4"><h2 className="text-sm font-extrabold">Poprawki klienta</h2>{revisions.length ? <div className="mt-3 space-y-3">{revisions.map(r => <div key={r.id} className="rounded-md border border-border p-3 text-[11px]"><div className="flex items-center justify-between gap-2"><strong>Runda {r.round_number}</strong><span className="text-primary">{r.status}</span></div><p className="mt-2 text-muted-foreground">{r.message}</p>{r.status === "awaiting_payment" && <Button size="sm" className="mt-3" onClick={() => unlockPaidRound(r)}>Potwierdź i odblokuj rundę</Button>}</div>)}</div> : <p className="mt-3 text-[11px] text-muted-foreground">Klient nie zgłosił poprawek.</p>}</section>
        <OrderMessages orderId={orderId} asAdmin />
      </div>
      <aside className="space-y-5">
        <section className="rounded-md border border-border bg-card p-4"><h2 className="text-sm font-extrabold">Pliki zamówienia</h2><label className="mt-3 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border p-3 text-[11px]"><FileText className="size-4 text-primary" /><input type="file" className="sr-only" onChange={e => setGeneralFile(e.target.files?.[0] ?? null)} />{generalFile?.name ?? "Wybierz plik dla klienta"}</label><Button size="sm" className="mt-3" disabled={!generalFile} onClick={uploadGeneral}>Dodaj plik</Button>{files.filter(f => f.category === "general").map(f => <div key={f.id} className="mt-2 truncate rounded-md border border-border p-2 text-[11px]">{f.file_name}</div>)}</section>
        <section className="rounded-md border border-border bg-card p-4"><h2 className="text-sm font-extrabold">Historia</h2><div className="mt-3 space-y-4">{events.map(event => <div key={event.id} className="relative pl-5 text-[11px] before:absolute before:left-1 before:top-1.5 before:size-2 before:rounded-full before:bg-primary"><strong className="block">{event.title}</strong>{event.details && <p className="text-muted-foreground">{event.details}</p>}<time className="text-[10px] text-muted-foreground">{dateLabel(event.created_at)}</time></div>)}</div></section>
      </aside>
    </div>
  </div></Shell>;
}

function Shell({ children }: { children: React.ReactNode }) { return <div className="flex min-h-screen flex-col bg-background"><SiteHeader /><main className="section-shell-wide w-full flex-1 py-6">{children}</main><SiteFooter /></div>; }

const when = (v: string) => new Date(v).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function AdminAlert({ events, revisions, lastMsg }: { events: OrderEvent[]; revisions: RevisionRequest[]; lastMsg: { from_admin: boolean; body: string; created_at: string } | null }) {
  const lastPublished = events.find(e => e.event_type === "visualization_published");
  const accepted = events.find(e => e.event_type === "visualization_accepted");
  const rev = revisions[0];
  const alerts: { at: string; tone: string; icon: typeof Send; title: string; text?: string }[] = [];
  if (rev && (!lastPublished || rev.created_at > lastPublished.created_at)) alerts.push({ at: rev.created_at, tone: "border-[hsl(30_90%_50%)] bg-[hsl(30_90%_50%/0.1)]", icon: AlertTriangle, title: rev.status === "awaiting_payment" ? "Klient prosi o płatną rundę poprawek" : `Klient zgłosił poprawki (runda ${rev.round_number})`, text: rev.message });
  if (accepted && (!lastPublished || accepted.created_at > lastPublished.created_at)) alerts.push({ at: accepted.created_at, tone: "border-[hsl(145_60%_38%)] bg-[hsl(145_60%_38%/0.1)]", icon: CheckCircle2, title: "Klient zaakceptował projekt", text: accepted.title });
  if (lastMsg && !lastMsg.from_admin) alerts.push({ at: lastMsg.created_at, tone: "border-primary bg-secondary", icon: MessageSquare, title: "Nowa wiadomość od klienta — czeka na odpowiedź", text: lastMsg.body });
  if (!alerts.length) return null;
  return <div className="space-y-2">{alerts.sort((a, b) => b.at.localeCompare(a.at)).map((a, i) => <a key={i} href="#komunikacja" className={`flex items-start gap-3 rounded-md border-2 p-3 text-[12px] ${a.tone}`}><a.icon className="mt-0.5 size-5 shrink-0 text-primary" /><span className="flex-1"><strong className="block text-[13px]">{a.title}</strong>{a.text && <span className="line-clamp-2 text-muted-foreground">„{a.text}”</span>}</span><time className="text-[11px] font-semibold">{when(a.at)}</time></a>)}</div>;
}