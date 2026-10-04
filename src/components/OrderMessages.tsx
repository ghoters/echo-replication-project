import { useEffect, useState } from "react";
import { CheckCircle2, Image as ImageIcon, MessageSquare, PencilLine, Send, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Message = Database["public"]["Tables"]["order_messages"]["Row"];
type Revision = Database["public"]["Tables"]["revision_requests"]["Row"];
type Event = Database["public"]["Tables"]["order_events"]["Row"];

type Item = { id: string; at: string; fromAdmin: boolean; kind: "message" | "revision" | "accepted" | "published" | "status"; title: string; body?: string; attachment?: string | null; badge?: string };

const fmt = (v: string) => new Date(v).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const kindStyle: Record<Item["kind"], { icon: typeof Send; cls: string }> = {
  message: { icon: MessageSquare, cls: "border-border" },
  revision: { icon: PencilLine, cls: "border-l-4 border-l-[hsl(30_90%_50%)] border-border bg-[hsl(30_90%_50%/0.06)]" },
  accepted: { icon: CheckCircle2, cls: "border-l-4 border-l-[hsl(145_60%_38%)] border-border bg-[hsl(145_60%_38%/0.07)]" },
  published: { icon: Sparkles, cls: "border-l-4 border-l-primary border-border bg-secondary/60" },
  status: { icon: Truck, cls: "border-border bg-muted/40" },
};

export function OrderMessages({ orderId, asAdmin = false, onChange }: { orderId: string; asAdmin?: boolean; onChange?: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    const [{ data: msgs }, { data: revs }, { data: evs }] = await Promise.all([
      supabase.from("order_messages").select("*").eq("order_id", orderId),
      supabase.from("revision_requests").select("*").eq("order_id", orderId),
      supabase.from("order_events").select("*").eq("order_id", orderId).in("event_type", ["visualization_accepted", "visualization_published", "status_changed"]),
    ]);
    const list: Item[] = [
      ...((msgs ?? []) as Message[]).map(m => ({ id: m.id, at: m.created_at, fromAdmin: m.from_admin, kind: "message" as const, title: "Wiadomość", body: m.body, attachment: m.attachment_path })),
      ...((revs ?? []) as Revision[]).map(r => ({ id: r.id, at: r.created_at, fromAdmin: false, kind: "revision" as const, title: `Zgłoszone poprawki — runda ${r.round_number}`, body: r.message, attachment: r.attachment_path, badge: r.status === "awaiting_payment" ? "Czeka na potwierdzenie płatnej rundy" : r.is_paid ? "Runda płatna" : undefined })),
      ...((evs ?? []) as Event[]).map(e => ({ id: e.id, at: e.created_at, fromAdmin: e.event_type !== "visualization_accepted", kind: (e.event_type === "visualization_accepted" ? "accepted" : e.event_type === "visualization_published" ? "published" : "status") as Item["kind"], title: e.title })),
    ].sort((a, b) => a.at.localeCompare(b.at));
    setItems(list);
    const paths = list.map(i => i.attachment).filter((p): p is string => !!p);
    if (paths.length) {
      const { data } = await supabase.storage.from("order-files").createSignedUrls(paths, 3600);
      const map: Record<string, string> = {};
      data?.forEach(d => { if (d.path && d.signedUrl) map[d.path] = d.signedUrl; });
      setUrls(map);
    }
  };
  useEffect(() => { void load(); }, [orderId]);

  const send = async () => {
    const text = body.trim();
    if (!text) { setError("Wpisz treść wiadomości."); return; }
    setSending(true); setError(""); setSent("");
    const { error: err } = await supabase.from("order_messages").insert({ order_id: orderId, body: text.slice(0, 1000), from_admin: asAdmin });
    setSending(false);
    if (err) { setError("Nie udało się wysłać wiadomości. Spróbuj ponownie."); return; }
    setBody(""); setSent(`Wysłano ${fmt(new Date().toISOString())}. ${asAdmin ? "Klient zobaczy wiadomość na swoim koncie." : "Odpowiemy najszybciej, jak to możliwe."}`);
    await load(); onChange?.();
  };

  return <section id="komunikacja" className="rounded-lg border border-border bg-card p-4 shadow-sm">
    <h2 className="text-[13px] font-extrabold">{asAdmin ? "Komunikacja z klientem" : "Komunikacja z nami"}</h2>
    <p className="mt-1 text-[11px] text-muted-foreground">Wszystkie wiadomości, poprawki i decyzje w jednym miejscu — z dokładną datą i godziną.</p>
    {items.length > 0 ? <div className="mt-3 max-h-[480px] space-y-2 overflow-y-auto pr-1">{items.map(item => {
      const mine = item.fromAdmin === asAdmin;
      const { icon: Icon, cls } = kindStyle[item.kind];
      const author = item.fromAdmin ? (asAdmin ? "Ty (prezent3d.com)" : "prezent3d.com") : (asAdmin ? "Klient" : "Ty");
      if (item.kind === "message") return <div key={item.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-lg px-3 py-2 text-[12px] ${mine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
        <span className="block text-[10px] font-bold opacity-80">{author} · {fmt(item.at)}{mine && " · wysłano ✓"}</span>
        <p className="whitespace-pre-wrap">{item.body}</p>
      </div></div>;
      return <div key={item.id} className={`rounded-md border p-3 text-[12px] ${cls}`}>
        <div className="flex flex-wrap items-center gap-2"><Icon className="size-4 text-primary" /><strong>{item.title}</strong><span className="ml-auto text-[10px] text-muted-foreground">{author} · {fmt(item.at)}</span></div>
        {item.badge && <span className="mt-1 inline-block rounded-full bg-background px-2 py-0.5 text-[10px] font-bold">{item.badge}</span>}
        {item.body && <p className="mt-2 whitespace-pre-wrap rounded bg-background/70 p-2">„{item.body}”</p>}
        {item.attachment && (urls[item.attachment] ? <button type="button" onClick={() => setPreview(urls[item.attachment!]!)} className="mt-2 block"><img src={urls[item.attachment]} alt="Załącznik" className="h-20 w-20 rounded-md border border-border object-cover" /></button> : <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground"><ImageIcon className="size-3" /> Załącznik</span>)}
      </div>;
    })}</div> : <p className="mt-3 text-[11px] text-muted-foreground">Brak wiadomości.</p>}
    <textarea value={body} onChange={e => setBody(e.target.value.slice(0, 1000))} className="mt-3 min-h-20 w-full rounded-md border border-border bg-background p-3 text-[12px] outline-none focus:border-primary" placeholder="Napisz wiadomość…" />
    {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    {sent && <p className="mt-1 text-[11px] font-semibold text-primary">{sent}</p>}
    <Button className="mt-2 font-bold" disabled={sending} onClick={send}><Send /> Wyślij wiadomość</Button>
    {preview && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/80 p-4" onClick={() => setPreview(null)}><img src={preview} alt="Podgląd załącznika" className="max-h-[90vh] max-w-full rounded-md" /></div>}
  </section>;
}
