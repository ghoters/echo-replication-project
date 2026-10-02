import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Eye, PenTool, Printer, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { readPaymentSummary, type PaymentSummary } from "@/lib/payment-summary";

export const ORDER_PLACED_KEY = "prezent3d-order-placed";
export const ORDER_NUMBER_KEY = "prezent3d-order-number";

export const Route = createFileRoute("/potwierdzenie")({
  head: () => ({
    meta: [
      { title: "Potwierdzenie zamówienia | prezent3d.com" },
      { name: "description", content: "Twoje zamówienie zostało złożone. Oto co dzieje się dalej z Twoją figurką 3D." },
      { property: "og:title", content: "Potwierdzenie zamówienia | prezent3d.com" },
      { property: "og:description", content: "Twoje zamówienie zostało złożone. Oto co dzieje się dalej z Twoją figurką 3D." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfirmationPage,
});

const nextSteps: Array<{ icon: typeof Search; title: string; text: string }> = [
  { icon: Search, title: "Weryfikujemy przesłane zdjęcia", text: "Sprawdzimy, czy materiały pozwolą na przygotowanie modelu." },
  { icon: PenTool, title: "Przygotujemy projekt 3D", text: "Na podstawie Twoich zdjęć stworzymy indywidualną figurkę." },
  { icon: Eye, title: "Otrzymasz projekt do akceptacji", text: "Przed rozpoczęciem druku pokażemy Ci przygotowany model." },
  { icon: Printer, title: "Drukujemy i wykańczamy figurkę", text: "Następnie zajmiemy się drukiem, obróbką i malowaniem." },
  { icon: Send, title: "Wysyłamy gotowe zamówienie", text: "Bezpiecznie zapakujemy i wyślemy Twoją figurkę." },
];

function ConfirmationPage() {
  const [ready, setReady] = useState(false);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    setSummary(readPaymentSummary());
    setOrderNumber(window.sessionStorage.getItem(ORDER_NUMBER_KEY) ?? "");
    setReady(true);
  }, []);

  if (!ready) return <><SiteHeader variant="checkout" /><main className="payment-page" /><SiteFooter /></>;

  if (!summary) {
    return <><SiteHeader variant="checkout" /><main className="payment-page"><div className="payment-empty"><h1>Brak złożonego zamówienia</h1><p>Najpierw uzupełnij dane zamówienia i przejdź przez płatność, aby zobaczyć potwierdzenie.</p><Button asChild><Link to="/oferta">Przejdź do konfiguratora <ArrowRight /></Link></Button></div></main><SiteFooter /></>;
  }

  return (
    <>
      <SiteHeader variant="checkout" />
      <main className="payment-page">
        <div className="payment-layout">
          <div className="confirm-shell">
            <span className="confirm-badge"><Check aria-hidden="true" /></span>
            <h1>Zamówienie zostało złożone!</h1>
            <p className="confirm-lead">Dziękujemy za zaufanie. Otrzymaliśmy Twoją płatność i rozpoczynamy przygotowanie Twojej figurki.</p>
            <section className="confirm-order" aria-label="Numer zamówienia">
              <h2>Numer zamówienia</h2>
              <strong>{orderNumber}</strong>
              <p>Na Twój adres e-mail wysłaliśmy potwierdzenie zamówienia.</p>
            </section>
            <section className="confirm-next" aria-label="Co teraz">
              <h2>Co teraz?</h2>
              <ol className="confirm-steps">
                {nextSteps.map(({ icon: Icon, title, text }, index) => (
                  <li key={title} className="confirm-step">
                    <span className="confirm-step-icon"><Icon aria-hidden="true" /></span>
                    <span className="confirm-step-num">{index + 1}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
            <Button asChild className="confirm-cta">
              <Link to="/konto" search={{ view: "orders" }}>Przejdź do panelu zamówienia <ArrowRight aria-hidden="true" /></Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
