import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Building2, CalendarCheck2, Check, ChevronRight, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { readPaymentSummary, type PaymentSummary } from "@/lib/payment-summary";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_NUMBER_KEY, ORDER_PLACED_KEY } from "@/routes/potwierdzenie";

export const Route = createFileRoute("/platnosc")({
  head: () => ({
    meta: [
      { title: "Płatność | prezent3d.com" },
      { name: "description", content: "Wybierz metodę płatności i sprawdź podsumowanie zamówienia figurki 3D." },
      { property: "og:title", content: "Płatność | prezent3d.com" },
      { property: "og:description", content: "Wybierz metodę płatności i sprawdź podsumowanie zamówienia figurki 3D." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentPage,
});

type PaymentMethod = "blik" | "transfer" | "card" | "apple" | "google";

const paymentMethods: Array<{ id: PaymentMethod; label: string; mark: string; icon?: typeof CreditCard }> = [
  { id: "blik", label: "BLIK", mark: "blik" },
  { id: "transfer", label: "Szybki przelew", mark: "", icon: Building2 },
  { id: "card", label: "Karta płatnicza", mark: "", icon: CreditCard },
  { id: "apple", label: "Apple Pay", mark: "Pay" },
  { id: "google", label: "Google Pay", mark: "G Pay" },
];

const money = (amount: number) => `${amount.toFixed(2).replace(".", ",")} zł`;

function PaymentPage() {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [ready, setReady] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("blik");
  const navigate = useNavigate();

  useEffect(() => {
    setSummary(readPaymentSummary());
    setReady(true);
  }, []);

  if (!ready) return <><SiteHeader variant="checkout" /><main className="payment-page" /><SiteFooter /></>;

  if (!summary) return <><SiteHeader variant="checkout" /><main className="payment-page"><div className="payment-empty"><h1>Brak zamówienia do opłacenia</h1><p>Najpierw uzupełnij dane zamówienia, aby zobaczyć poprawną kwotę.</p><Button asChild><Link to="/oferta">Przejdź do konfiguratora <ArrowRight /></Link></Button></div></main><SiteFooter /></>;

  const total = summary.figurinePrice + summary.deliveryPrice;

  return <><SiteHeader variant="checkout" /><main className="payment-page"><div className="payment-layout">
    <header className="payment-intro"><h1>Płatność</h1><p>Wybierz dogodną metodę płatności i sfinalizuj zamówienie.</p></header>
    <div className="payment-grid">
      <div className="payment-left">
        <section className="payment-card payment-amount"><div><h2>Kwota do zapłaty</h2><strong>{money(total)}</strong></div><span><ShieldCheck aria-hidden="true" /> Bezpieczna płatność</span></section>
        <section className="payment-card payment-methods"><h2>Wybierz metodę płatności</h2><div className="payment-method-list">
          {paymentMethods.map(({ id, label, mark, icon: Icon }) => <label key={id} className={`payment-method ${method === id ? "is-selected" : ""}`}>
            <input type="radio" name="payment-method" value={id} checked={method === id} onChange={() => setMethod(id)} />
            <span className="payment-method-mark">{Icon ? <Icon aria-hidden="true" /> : <b>{mark}</b>}</span>
            <span>{label}</span><ChevronRight aria-hidden="true" />
          </label>)}
        </div>
          <Button type="button" className="payment-submit" onClick={async () => {
            const orderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;
            window.sessionStorage.setItem(ORDER_PLACED_KEY, "1");
            window.sessionStorage.setItem(ORDER_NUMBER_KEY, orderNumber);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) await supabase.from("orders").insert({ user_id: user.id, order_number: orderNumber, figurine_price: summary.figurinePrice, delivery_price: summary.deliveryPrice, delivery_label: summary.deliveryLabel });
            navigate({ to: "/potwierdzenie" });
          }}>Zapłać i złóż zamówienie <ArrowRight aria-hidden="true" /></Button>
        </section>
      </div>
      <aside className="payment-right">
        <section className="payment-card payment-summary"><h2>Twoje zamówienie</h2><div><span>Figurka</span><strong>{money(summary.figurinePrice)}</strong></div><div><span>Dostawa</span><strong>{summary.deliveryPrice === 0 ? "Darmowa" : money(summary.deliveryPrice)}</strong></div><div className="payment-total"><strong>Razem</strong><strong>{money(total)}</strong></div></section>
        <div className="payment-security"><span><CalendarCheck2 aria-hidden="true" /></span><div><strong>Bezpieczna płatność</strong><small>SSL / szyfrowanie danych</small></div></div>
        <div className="payment-security"><span><ShieldCheck aria-hidden="true" /></span><div><strong>Dane chronione</strong><small>Twoje informacje są bezpieczne</small></div></div>
      </aside>
    </div>
  </div></main><SiteFooter /></>;
}