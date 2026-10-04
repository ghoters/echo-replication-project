import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, MessageSquare, PencilLine, Plus, Search, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_STATUSES, money } from "@/lib/order-workflow";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel admina – prezent3d.com" },
      { name: "description", content: "Zarządzanie zamówieniami i klientami prezent3d.com." },
      { property: "og:title", content: "Panel admina – prezent3d.com" },
      { property: "og:description", content: "Zarządzanie zamówieniami i klientami." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Order = {
  id: string; user_id: string; order_number: string; status: string; created_at: string;
  figurine_price: number; delivery_price: number; delivery_label: string;
  product_type: string; configuration: Record<string, unknown> | null;
};
type Profile = { id: string; display_name: string; email: string; created_at: string };
type Alerts = { revisions: number; accepted: boolean; messages: number };

const input = "h-9 rounded-md border border-border bg-background px-2 text-[13px] outline-none focus:border-primary";
const PRODUCT_LABELS: Record<string, string> = { custom_figurine: "Figurka 3D" };

const statusStyle: Record<string, string> = {
  "Opłacone": "bg-[hsl(210_80%_50%/0.12)] text-[hsl(210_80%_38%)]",
  "Projektowanie": "bg-[hsl(262_60%_55%/0.12)] text-[hsl(262_60%_42%)]",
  "Wizualizacja": "bg-[hsl(30_90%_50%/0.14)] text-[hsl(30_90%_38%)]",
  "Poprawki": "bg-[hsl(30_90%_50%/0.18)] text-[hsl(25_95%_35%)]",
  "Produkcja": "bg-[hsl(190_70%_40%/0.12)] text-[hsl(190_70%_30%)]",
  "Gotowe": "bg-[hsl(145_60%_38%/0.14)] text-[hsl(145_60%_30%)]",
  "Wysłane": "bg-[hsl(145_60%_38%/0.2)] text-[hsl(145_65%_26%)]",
  "Anulowane": "bg-destructive/10 text-destructive",
};

const fmtDate = (v: string) => new Date(v).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });

function AdminPage() {
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const [tab, setTab] = useState<"orders" | "clients">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [alerts, setAlerts] = useState<Record<string, Alerts>>({});
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ user_id: "", figurine_price: "0", delivery_price: "0", delivery_label: "Kurier", status: "Opłacone" });
  const [err, setErr] = useState("");

  const load = async () => {
    const [{ data: o }, { data: p }, { data: revs }, { data: evs }, { data: msgs }, { data: files }] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,display_name,email,created_at").order("created_at", { ascending: false }),
      supabase.from("revision_requests").select("order_id,status"),
      supabase.from("order_events").select("order_id,event_type").eq("event_type", "visualization_accepted"),
      supabase.from("order_messages").select("order_id,from_admin"),
      supabase.from("order_files").select("order_id,storage_path,mime_type").order("created_at", { ascending: true }),
    ]);
    const orderList = (o as Order[]) ?? [];
    setOrders(orderList);
    setProfiles((p as Profile[]) ?? []);

    const map: Record<string, Alerts> = {};
    (revs ?? []).forEach(r => { if (r.status === "submitted") { map[r.order_id] ??= { revisions: 0, accepted: false, messages: 0 }; map[r.order_id]!.revisions++; } });
    (evs ?? []).forEach(e => { map[e.order_id] ??= { revisions: 0, accepted: false, messages: 0 }; map[e.order_id]!.accepted = true; });
    (msgs ?? []).forEach(m => { if (!m.from_admin) { map[m.order_id] ??= { revisions: 0, accepted: false, messages: 0 }; map[m.order_id]!.messages++; } });
    setAlerts(map);

    const firstPath: Record<string, string> = {};
    (files ?? []).forEach(f => { if (f.mime_type.startsWith("image/") && !firstPath[f.order_id]) firstPath[f.order_id] = f.storage_path; });
    const paths = Object.values(firstPath);
    if (paths.length) {
      const { data } = await supabase.storage.from("order-files").createSignedUrls(paths, 3600);
      const byPath: Record<string, string> = {};
      data?.forEach(d => { if (d.path && d.signedUrl) byPath[d.path] = d.signedUrl; });
      const t: Record<string, string> = {};
      Object.entries(firstPath).forEach(([oid, path]) => { if (byPath[path]) t[oid] = byPath[path]!; });
      setThumbs(t);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return setState("denied");
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (!data?.length) return setState("denied");
      setState("ok");
      load();
    });
  }, []);

  const who = (id: string) => profiles.find(x => x.id === id);
  const update = async (id: string, patch: Partial<Order>) => {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) setErr(error.message); else load();
  };
  const remove = async (o: Order) => {
    if (!confirm(`Usunąć zamówienie ${o.order_number}?`)) return;
    const { error } = await supabase.from("orders").delete().eq("id", o.id);
    if (error) setErr(error.message); else load();
  };
  const add = async () => {
    if (!form.user_id) return setErr("Wybierz klienta.");
    const { error } = await supabase.from("orders").insert({
      user_id: form.user_id, order_number: "P3D-" + Math.floor(100000 + Math.random() * 900000),
      figurine_price: Number(form.figurine_price), delivery_price: Number(form.delivery_price),
      delivery_label: form.delivery_label, status: form.status,
    });
    if (error) setErr(error.message); else { setErr(""); load(); }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    orders.forEach(o => { c[o.status] = (c[o.status] ?? 0) + 1; });
    return c;
  }, [orders]);

  const list = orders.filter(o => {
    const p = who(o.user_id);
    const hay = `${o.order_number} ${p?.display_name ?? ""} ${p?.email ?? ""}`.toLowerCase();
    return (!filter || o.status === filter) && (!q || hay.includes(q.toLowerCase()));
  });

  const configSummary = (o: Order) => {
    const c = (o.configuration ?? {}) as Record<string, unknown>;
    const parts = [c["sizeLabel"], c["finishLabel"], c["baseLabel"]].filter((v): v is string => typeof v === "string" && !!v);
    return parts.length ? parts.join(" · ") : PRODUCT_LABELS[o.product_type] ?? "Figurka 3D";
  };

  return <div className="flex min-h-screen flex-col bg-background">
    <SiteHeader />
    <main className="section-shell-wide w-full flex-1 py-6 md:py-9">
      {state === "loading" ? <p className="text-sm text-muted-foreground">Ładowanie…</p> : state === "denied" ? <div className="rounded-md border border-border bg-card p-8 text-center"><h1 className="text-2xl font-extrabold">Brak dostępu</h1><p className="mt-2 text-sm text-muted-foreground">Ta strona jest dostępna tylko dla administratora.</p><Button asChild variant="hero" className="mt-5"><Link to="/logowanie">Zaloguj się</Link></Button></div> : <>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold md:text-[28px]">Panel admina</h1>
          <div className="flex gap-2">
            <Button variant={tab === "orders" ? "hero" : "outline"} size="sm" onClick={() => setTab("orders")}>Zamówienia ({orders.length})</Button>
            <Button variant={tab === "clients" ? "hero" : "outline"} size="sm" onClick={() => setTab("clients")}>Klienci ({profiles.length})</Button>
          </div>
        </div>
        {err && <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">{err}</p>}
        {tab === "orders" ? <>
          <section className="mt-6 rounded-md border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-extrabold">Dodaj zamówienie</h2>
            <div className="mt-3 flex flex-wrap items-end gap-2 text-[11px] text-muted-foreground">
              <label className="flex flex-col gap-1">Klient<select className={input} value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })}><option value="">— wybierz —</option>{profiles.map(p => <option key={p.id} value={p.id}>{p.display_name || p.email}</option>)}</select></label>
              <label className="flex flex-col gap-1">Cena figurki<input type="number" className={`${input} w-28`} value={form.figurine_price} onChange={e => setForm({ ...form, figurine_price: e.target.value })} /></label>
              <label className="flex flex-col gap-1">Dostawa (zł)<input type="number" className={`${input} w-24`} value={form.delivery_price} onChange={e => setForm({ ...form, delivery_price: e.target.value })} /></label>
              <label className="flex flex-col gap-1">Rodzaj dostawy<input className={`${input} w-36`} value={form.delivery_label} onChange={e => setForm({ ...form, delivery_label: e.target.value })} /></label>
              <label className="flex flex-col gap-1">Status<select className={input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
              <Button variant="hero" size="sm" onClick={add}><Plus /> Dodaj</Button>
            </div>
          </section>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button onClick={() => setFilter("")} className={`rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors ${!filter ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50"}`}>Wszystkie ({orders.length})</button>
            {ORDER_STATUSES.filter(s => counts[s]).map(s => <button key={s} onClick={() => setFilter(filter === s ? "" : s)} className={`rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors ${filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50"}`}>{s} ({counts[s]})</button>)}
            <div className="relative ml-auto w-full max-w-[280px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input type="search" placeholder="Szukaj: numer, klient, e-mail…" value={q} onChange={e => setQ(e.target.value)} className={`${input} w-full pl-8`} />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {list.map(o => {
              const p = who(o.user_id);
              const a = alerts[o.id];
              const total = Number(o.figurine_price) + Number(o.delivery_price);
              return <div key={o.id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md md:flex-row md:items-center">
                {thumbs[o.id] ? <img src={thumbs[o.id]} alt="" className="size-16 shrink-0 rounded-md border border-border object-cover" /> : <div className="grid size-16 shrink-0 place-items-center rounded-md border border-border bg-muted text-[10px] font-bold text-muted-foreground">3D</div>}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-extrabold">#{o.order_number}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${statusStyle[o.status] ?? "bg-muted text-foreground"}`}>{o.status}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[13px] font-semibold">{configSummary(o)}</p>
                  <p className="text-[11px] text-muted-foreground">{p ? <>{p.display_name || "Klient"} · {p.email}</> : o.user_id.slice(0, 8)} · złożone {fmtDate(o.created_at)}</p>
                  {a && (a.revisions > 0 || a.accepted || a.messages > 0) && <div className="mt-2 flex flex-wrap gap-1.5">
                    {a.revisions > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(30_90%_50%/0.15)] px-2 py-0.5 text-[10px] font-extrabold text-[hsl(25_95%_35%)]"><PencilLine className="size-3" /> Poprawki do obsłużenia ({a.revisions})</span>}
                    {a.accepted && <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(145_60%_38%/0.15)] px-2 py-0.5 text-[10px] font-extrabold text-[hsl(145_65%_28%)]"><CheckCircle2 className="size-3" /> Wizualizacja zaakceptowana</span>}
                    {a.messages > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(210_80%_50%/0.12)] px-2 py-0.5 text-[10px] font-extrabold text-[hsl(210_80%_38%)]"><MessageSquare className="size-3" /> Wiadomości od klienta ({a.messages})</span>}
                  </div>}
                </div>
                <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-2">
                  <span className="text-[15px] font-extrabold">{money(total)}</span>
                  <div className="flex items-center gap-1.5">
                    <Button asChild size="sm" variant="hero" className="h-8 text-[12px]"><Link to="/admin/zamowienia/$orderId" params={{ orderId: o.id }}>Przejdź do obsługi <ArrowRight /></Link></Button>
                    <Button variant="ghost" size="icon" aria-label="Usuń" className="size-8" onClick={() => remove(o)}><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                </div>
              </div>;
            })}
            {!list.length && <p className="rounded-lg border border-border bg-card py-10 text-center text-sm text-muted-foreground">Brak zamówień spełniających kryteria.</p>}
          </div>
        </> : <section className="mt-6 overflow-x-auto rounded-md border border-border bg-card p-4 shadow-sm">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead className="text-[11px] uppercase text-muted-foreground"><tr><th className="py-2">Nazwa</th><th>E-mail</th><th>Rejestracja</th><th>Zamówienia</th></tr></thead>
            <tbody className="divide-y divide-border">{profiles.map(p => <tr key={p.id}><td className="py-2 font-bold">{p.display_name || "—"}</td><td>{p.email}</td><td>{fmtDate(p.created_at)}</td><td>{orders.filter(o => o.user_id === p.id).length}</td></tr>)}</tbody>
          </table>
        </section>}
      </>}
    </main>
    <SiteFooter />
  </div>;
}
