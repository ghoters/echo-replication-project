import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_STATUSES } from "@/lib/order-workflow";

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

const STATUSES: readonly string[] = ORDER_STATUSES;
type Order = { id: string; user_id: string; order_number: string; figurine_price: number; delivery_price: number; delivery_label: string; status: string; created_at: string };
type Profile = { id: string; display_name: string; email: string; created_at: string };
const input = "h-9 rounded-md border border-border bg-background px-2 text-[13px] outline-none focus:border-primary";

function AdminPage() {
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const [tab, setTab] = useState<"orders" | "clients">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ user_id: "", figurine_price: "0", delivery_price: "0", delivery_label: "Kurier", status: "Opłacone" });
  const [err, setErr] = useState("");

  const load = async () => {
    const [{ data: o }, { data: p }] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,display_name,email,created_at").order("created_at", { ascending: false }),
    ]);
    setOrders((o as Order[]) ?? []);
    setProfiles((p as Profile[]) ?? []);
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

  const who = (id: string) => { const p = profiles.find(x => x.id === id); return p ? p.display_name || p.email : id.slice(0, 8); };
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

  const list = orders.filter(o => (!filter || o.status === filter) && (!q || o.order_number.toLowerCase().includes(q.toLowerCase()) || who(o.user_id).toLowerCase().includes(q.toLowerCase())));

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
              <label className="flex flex-col gap-1">Status<select className={input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
              <Button variant="hero" size="sm" onClick={add}><Plus /> Dodaj</Button>
            </div>
          </section>
          <section className="mt-6 rounded-md border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <input type="search" placeholder="Szukaj po numerze lub kliencie…" value={q} onChange={e => setQ(e.target.value)} className={`${input} w-full max-w-[280px]`} />
              <select className={input} value={filter} onChange={e => setFilter(e.target.value)}><option value="">Wszystkie statusy</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-[13px]">
                <thead className="text-[11px] uppercase text-muted-foreground"><tr><th className="py-2">Numer</th><th>Klient</th><th>Data</th><th>Figurka</th><th>Dostawa</th><th>Status</th><th /><th /></tr></thead>
                <tbody className="divide-y divide-border">{list.map(o => <tr key={o.id}>
                  <td className="py-2 font-bold">{o.order_number}</td>
                  <td>{who(o.user_id)}</td>
                  <td>{new Date(o.created_at).toLocaleDateString("pl-PL")}</td>
                  <td><input type="number" defaultValue={o.figurine_price} onBlur={e => Number(e.target.value) !== Number(o.figurine_price) && update(o.id, { figurine_price: Number(e.target.value) })} className={`${input} w-24`} /></td>
                  <td>{o.delivery_label} · {Number(o.delivery_price).toFixed(2)} zł</td>
                  <td><select className={input} value={o.status} onChange={e => update(o.id, { status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></td>
                  <td><Button asChild size="sm" variant="outline" className="h-8 text-[11px]"><Link to="/admin/zamowienia/$orderId" params={{ orderId: o.id }}>Obsługa</Link></Button></td>
                  <td className="text-right"><Button variant="ghost" size="icon" aria-label="Usuń" onClick={() => remove(o)}><Trash2 className="text-destructive" /></Button></td>
                </tr>)}</tbody>
              </table>
              {!list.length && <p className="py-6 text-center text-sm text-muted-foreground">Brak zamówień.</p>}
            </div>
          </section>
        </> : <section className="mt-6 overflow-x-auto rounded-md border border-border bg-card p-4 shadow-sm">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead className="text-[11px] uppercase text-muted-foreground"><tr><th className="py-2">Nazwa</th><th>E-mail</th><th>Rejestracja</th><th>Zamówienia</th></tr></thead>
            <tbody className="divide-y divide-border">{profiles.map(p => <tr key={p.id}><td className="py-2 font-bold">{p.display_name || "—"}</td><td>{p.email}</td><td>{new Date(p.created_at).toLocaleDateString("pl-PL")}</td><td>{orders.filter(o => o.user_id === p.id).length}</td></tr>)}</tbody>
          </table>
        </section>}
      </>}
    </main>
    <SiteFooter />
  </div>;
}
