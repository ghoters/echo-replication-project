import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Message = Database["public"]["Tables"]["order_messages"]["Row"];

export function OrderMessages({ orderId, asAdmin = false }: { orderId: string; asAdmin?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("order_messages").select("*").eq("order_id", orderId).order("created_at");
    setMessages(data ?? []);
  };
  useEffect(() => { void load(); }, [orderId]);

  const send = async () => {
    const text = body.trim();
    if (!text) { setError("Wpisz treść wiadomości."); return; }
    setSending(true); setError("");
    const { error: err } = await supabase.from("order_messages").insert({ order_id: orderId, body: text.slice(0, 1000), from_admin: asAdmin });
    setSending(false);
    if (err) { setError("Nie udało się wysłać wiadomości. Spróbuj ponownie."); return; }
    setBody(""); await load();
  };

  return <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
    <h2 className="text-[13px] font-extrabold">{asAdmin ? "Wiadomości z klientem" : "Wiadomości do zamówienia"}</h2>
    <p className="mt-1 text-[11px] text-muted-foreground">{asAdmin ? "Klient widzi tę rozmowę na swoim koncie." : "Masz dodatkowe uwagi lub pytania? Napisz do nas w każdej chwili."}</p>
    {messages.length > 0 && <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">{messages.map(m => {
      const mine = m.from_admin === asAdmin;
      return <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-lg px-3 py-2 text-[12px] ${mine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
        <span className="block text-[10px] font-bold opacity-80">{m.from_admin ? "prezent3d.com" : "Klient"} · {new Date(m.created_at).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
        <p className="whitespace-pre-wrap">{m.body}</p>
      </div></div>;
    })}</div>}
    <textarea value={body} onChange={e => setBody(e.target.value.slice(0, 1000))} className="mt-3 min-h-20 w-full rounded-md border border-border bg-background p-3 text-[12px] outline-none focus:border-primary" placeholder="Napisz wiadomość…" />
    {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    <Button className="mt-2 font-bold" disabled={sending} onClick={send}><Send /> Wyślij wiadomość</Button>
  </section>;
}
