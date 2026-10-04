import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, CircleCheck, Clock3, Gift, Images, Mail, MessageSquareText, PackageCheck, Paintbrush, Phone, ShieldCheck, Truck, UserRound, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { readFigurineConfig, type FigurineConfig } from "@/lib/figurine-config";
import { readOrderPhotos } from "@/lib/order-photos";
import { OrderPhotoGallery } from "@/components/OrderPhotoGallery";
import { savePaymentSummary } from "@/lib/payment-summary";
import previewImage from "@/assets/podglad-figurki-para-pies.jpg.asset.json";
import orderPreview from "@/assets/zamowienie-podglad.png.asset.json";
import singlePreview from "@/assets/podglad-figurki.jpg.asset.json";
import finishedPreview from "@/assets/gotowa-figurka.jpg.asset.json";

export const Route = createFileRoute("/zamowienie")({
  head: () => ({ meta: [
    { title: "Dane i zamówienie | prezent3d.com" },
    { name: "description", content: "Uzupełnij dane dostawy i sprawdź podsumowanie swojej personalizowanej figurki 3D." },
    { property: "og:title", content: "Dane i zamówienie | prezent3d.com" },
    { property: "og:description", content: "Uzupełnij dane dostawy i sprawdź podsumowanie swojej personalizowanej figurki 3D." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: OrderPage,
});

const sizes = { "15": { label: "15 cm", price: 0 }, "20": { label: "20 cm", price: 15 }, "25": { label: "25 cm", price: 30 } } as const;
const finishes = { single: { label: "Figurka jednokolorowa", price: 0 }, painted: { label: "Figurka ręcznie malowana", price: 100 } } as const;
const bases = { standard: { label: "Podstawka standardowa", price: 0 }, personalized: { label: "Personalizowana", price: 40 }, none: { label: "Bez podstawki", price: 0 } } as const;
const packages = { standard: { label: "Pudełko standardowe", price: 0 }, gift: { label: "Pudełko prezentowe", price: 40 } } as const;
const previews = [previewImage, orderPreview, singlePreview, finishedPreview];
type Delivery = "courier" | "parcel";

function Field({ label, required, error, children, className = "" }: { label: string; required?: boolean; error?: string | undefined; children: ReactNode; className?: string }) {
  return <label className={`order-field ${className}`}><span>{label}{required && <b> *</b>}</span><span className="order-field-control">{children}</span><span className="order-error" aria-hidden={!error}>{error ?? ""}</span></label>;
}

function SectionTitle({ number, icon: Icon, title, subtitle }: { number: number; icon: typeof UserRound; title: string; subtitle?: string }) {
  return <div className="order-section-title"><Icon aria-hidden="true" /><div><h2>{number}. {title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>;
}

function OrderPage() {
  const navigate = useNavigate({ from: "/zamowienie" });
  const [config, setConfig] = useState<FigurineConfig | null>(null);
  const [configReady, setConfigReady] = useState(false);
  const [orderPhotos, setOrderPhotos] = useState<File[]>([]);
  const [delivery, setDelivery] = useState<Delivery>("parcel");
  const [parcelPoint, setParcelPoint] = useState("Warszawa, ul. Marszałkowska 142");
  const [carrier, setCarrier] = useState("InPost");
  const [accepted, setAccepted] = useState(true);
  const [portfolio, setPortfolio] = useState(true);
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contact, setContact] = useState({ fullName: "", email: "", phone: "" });

  useEffect(() => {
    let mounted = true;
    setConfig(readFigurineConfig());
    readOrderPhotos().then((files) => { if (mounted) setOrderPhotos(files); }).catch(() => { if (mounted) setOrderPhotos([]); }).finally(() => { if (mounted) setConfigReady(true); });
    return () => { mounted = false; };
  }, []);

  if (!configReady) return <><SiteHeader variant="checkout" /><main className="order-page" /><SiteFooter /></>;
  if (!config) return <><SiteHeader variant="checkout" /><main className="order-page"><div className="order-empty"><h1>Najpierw skonfiguruj figurkę</h1><p>Wybierz wszystkie opcje i dodaj zdjęcia, aby przejść do zamówienia.</p><Button asChild><Link to="/oferta">Przejdź do konfiguratora <ArrowRight /></Link></Button></div></main><SiteFooter /></>;

  const size = config.size ? sizes[config.size as keyof typeof sizes] : undefined;
  const finish = config.finish ? finishes[config.finish as keyof typeof finishes] : undefined;
  const base = config.base ? bases[config.base as keyof typeof bases] : undefined;
  const pack = config.pack ? packages[config.pack as keyof typeof packages] : undefined;
  const subjectCount = (config.subjects.includes("person") ? config.personCount : 0) + (config.subjects.includes("animal") ? config.animalCount : 0) || 1;
  const subjectPrice = (config.subjects.includes("person") ? 180 + 80 * (config.personCount - 1) : 0) + (config.subjects.includes("animal") ? 80 * config.animalCount : 0) + (config.subjects.includes("custom") ? 40 : 0);
  const figurinePrice = subjectPrice + (size?.price ?? 0) * subjectCount + (finish?.price ?? 0) + (base?.price ?? 0) + (pack?.price ?? 0);
  const deliveryPrice = figurinePrice >= 299 ? 0 : delivery === "courier" ? 18 : 14;
  const subjectLabel = [config.subjects.includes("person") ? `${config.personCount} ${config.personCount === 1 ? "osoba" : "osoby"}` : "", config.subjects.includes("animal") ? `${config.animalCount} ${config.animalCount === 1 ? "zwierzę" : "zwierzęta"}` : "", config.subjects.includes("custom") ? (config.customText || "własny element") : ""].filter(Boolean).join(" + ");
  const colorLabel = config.color === "white" ? "biały" : config.color === "beige" ? "beżowy" : config.colorText;
  const finishLabel = config.finish === "single" ? `${finish?.label} (${colorLabel})` : finish?.label;
  const money = (amount: number) => `${amount.toFixed(2).replace(".", ",")} zł`;
  const isTwoPartName = (value: string) => value.trim().split(/\s+/).filter(Boolean).length >= 2;
  const nameError = "Wpisz imię i nazwisko (co najmniej dwa słowa).";
  const clearError = (name: string, value: string) => {
    if (!value.trim() || !errors[name]) return;
    setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
  };
  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const emailError = (value: string) => {
    if (!value.includes("@")) return "Błędny adres e-mail — brakuje znaku @.";
    const afterAt = value.slice(value.indexOf("@") + 1);
    if (!afterAt) return "Błędny adres e-mail — po znaku @ wpisz nazwę poczty, np. jan@gmail.com.";
    if (!afterAt.includes(".")) return "Błędny adres e-mail — brakuje końcówki, np. .com lub .pl.";
    return "Błędny adres e-mail.";
  };
  const trackContact = (name: keyof typeof contact) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = name === "phone" ? event.target.value.replace(/[^\d]/g, "").slice(0, 20) : event.target.value;
    if (name === "phone" && value !== event.target.value) event.target.value = value;
    setContact((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      const trimmed = value.trim();
      if (name === "email" && trimmed && !isValidEmail(trimmed)) return next;
      if (name === "fullName" && trimmed && !isTwoPartName(trimmed)) return next;
      delete next[name];
      return next;
    });
  };
  const validateEmailOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const trimmed = event.target.value.trim();
    setErrors((prev) => {
      const next = { ...prev };
      if (!trimmed || isValidEmail(trimmed)) delete next["email"];
      else next["email"] = emailError(trimmed);
      return next;
    });
  };
  const validateNameOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const trimmed = event.target.value.trim();
    setErrors((prev) => {
      const next = { ...prev };
      if (!trimmed || isTwoPartName(trimmed)) delete next["fullName"];
      else next["fullName"] = nameError;
      return next;
    });
  };

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const required = delivery === "courier" ? ["fullName", "email", "phone", "street", "postalCode", "city"] : ["fullName", "email", "phone"];
    const nextErrors: Record<string, string> = {};
    required.forEach((name) => { if (!String(form.get(name) ?? "").trim()) nextErrors[name] = "To pole jest wymagane."; });
    const fullName = String(form.get("fullName") ?? "").trim();
    if (fullName && !isTwoPartName(fullName)) nextErrors["fullName"] = nameError;
    const email = String(form.get("email") ?? "").trim();
    if (email && !isValidEmail(email)) nextErrors["email"] = emailError(email);
    if (delivery === "parcel" && !parcelPoint) nextErrors["parcelPoint"] = "Wybierz paczkomat.";
    if (!accepted) nextErrors["accepted"] = "Zaznacz wymaganą zgodę.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      savePaymentSummary({
        figurinePrice,
        deliveryPrice,
        deliveryLabel: delivery === "parcel" ? "Paczkomat" : "Kurier",
        configuration: {
          title: subjectLabel,
          size: size?.label ?? "",
          finish: finishLabel ?? "",
          base: config.base === "personalized" && config.graverText ? `${base?.label} — ${config.graverText}` : base?.label ?? "",
          people: subjectLabel,
          extras: config.subjects.includes("custom") ? (config.customText || "Własny element") : "Brak",
        },
      });
      void navigate({ to: "/platnosc" });
    }
  }

  return <><SiteHeader variant="checkout" /><main className="order-page"><div className="order-layout">
    <header className="order-intro"><p className="order-eyebrow">Dane i zamówienie</p><h1>Skończ konfigurację. Złóż zamówienie!</h1><p>Uzupełnij swoje dane, wybierz sposób dostawy i sprawdź podsumowanie zamówienia.<br className="order-desktop-break" /> Po zatwierdzeniu przejdziesz do płatności, a my zajmiemy się resztą!</p></header>
    <form className="order-grid" onSubmit={submit} noValidate>
      <div className="order-form-column">
        <section className="order-panel"><SectionTitle number={1} icon={UserRound} title="Dane kontaktowe" subtitle="Podaj swoje dane, abyśmy mogli skontaktować się z Tobą w sprawie zamówienia." />
          <div className="order-contact-grid">
            <Field label="Imię i nazwisko" required error={errors["fullName"]}><span className="order-input-wrap"><UserRound aria-hidden="true" /><Input name="fullName" autoComplete="name" maxLength={100} placeholder="Jan Kowalski" aria-invalid={!!errors["fullName"]} onChange={trackContact("fullName")} onBlur={validateNameOnBlur} /></span></Field>
            <Field label="E-mail" required error={errors["email"]}><span className="order-input-wrap"><Mail aria-hidden="true" /><Input name="email" type="email" autoComplete="email" maxLength={255} placeholder="jan.kowalski@example.com" aria-invalid={!!errors["email"]} onChange={trackContact("email")} onBlur={validateEmailOnBlur} /></span></Field>
            <Field label="Telefon" required error={errors["phone"]}><span className="order-input-wrap"><Phone aria-hidden="true" /><Input name="phone" type="tel" inputMode="numeric" pattern="[0-9]*" autoComplete="tel" maxLength={20} placeholder="123456789" aria-invalid={!!errors["phone"]} value={contact.phone} onChange={trackContact("phone")} /></span></Field>
            <label className="order-account"><Checkbox disabled /><span><strong>Utwórz konto</strong> (opcjonalnie)<small>Ta możliwość będzie dostępna wkrótce.</small></span></label>
          </div>
        </section>
        <section className="order-panel"><SectionTitle number={2} icon={Truck} title="Dostawa" subtitle="Wybierz sposób dostawy. Koszt dostawy zostanie doliczony do zamówienia." />
          <div className="order-delivery-grid">
            <div className={`order-delivery-card ${delivery === "parcel" ? "is-selected" : ""}`}><label className="order-delivery-head"><input type="radio" name="delivery" value="parcel" checked={delivery === "parcel"} onChange={() => setDelivery("parcel")} /><PackageCheck aria-hidden="true" /><span><strong>Paczkomat</strong><small>Szybko i wygodnie, odbiór 24/7</small></span></label><label className="order-select-label">Wybierz paczkomat<select value={parcelPoint} onChange={(event) => { setParcelPoint(event.target.value); clearError("parcelPoint", event.target.value); }}><option value="Warszawa, ul. Marszałkowska 142">Warszawa, ul. Marszałkowska 142</option><option value="Warszawa, ul. Puławska 24">Warszawa, ul. Puławska 24</option><option value="Kraków, ul. Długa 10">Kraków, ul. Długa 10</option></select></label><small className="order-error" aria-hidden={!errors["parcelPoint"]}>{errors["parcelPoint"] ?? ""}</small><p className="order-delivery-time"><Clock3 aria-hidden="true" /> Czas dostawy: 1–2 dni robocze</p></div>
            <div className={`order-delivery-card ${delivery === "courier" ? "is-selected" : ""}`}><label className="order-delivery-head"><input type="radio" name="delivery" value="courier" checked={delivery === "courier"} onChange={() => setDelivery("courier")} /><Truck aria-hidden="true" /><span><strong>Kurier</strong><small>Dostawa pod wskazany adres</small></span></label><label className="order-select-label">Wybierz firmę kurierską<select value={carrier} onChange={(event) => setCarrier(event.target.value)}><option>InPost</option><option>DPD</option><option>DHL</option></select></label><p className="order-delivery-time"><Clock3 aria-hidden="true" /> Czas dostawy: 1–3 dni robocze</p></div>
          </div>
          {delivery === "courier" && <div className="order-address-grid"><Field label="Ulica i numer" required error={errors["street"]} className="order-full-field"><Input name="street" autoComplete="street-address" maxLength={120} placeholder=" " onChange={(e) => clearError("street", e.target.value)} /></Field><Field label="Kod pocztowy" required error={errors["postalCode"]}><Input name="postalCode" autoComplete="postal-code" maxLength={12} placeholder="00-000" onChange={(e) => clearError("postalCode", e.target.value)} /></Field><Field label="Miejscowość" required error={errors["city"]}><Input name="city" autoComplete="address-level2" maxLength={100} placeholder=" " onChange={(e) => clearError("city", e.target.value)} /></Field></div>}
          <div className="order-shipping-note"><Truck aria-hidden="true" /><strong>Darmowa dostawa od 299 zł</strong><span>Więcej informacji <ArrowRight aria-hidden="true" /></span></div>
        </section>
        <section className="order-panel"><SectionTitle number={3} icon={MessageSquareText} title="Dodatkowe informacje" subtitle="Jeśli masz dodatkowe uwagi dotyczące wyglądu figurki, jej pozy lub zamówienia, możesz wpisać je tutaj." /><Textarea name="notes" aria-label="Dodatkowe informacje" maxLength={500} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Napisz tutaj swoje uwagi..." /><p className="order-counter">{notes.length} / 500</p></section>
        <section className="order-panel order-agreements"><SectionTitle number={4} icon={ShieldCheck} title="Zgody" /><label><Checkbox checked={accepted} onCheckedChange={(value) => { setAccepted(value === true); if (value === true) setErrors((prev) => { const next = { ...prev }; delete next["accepted"]; return next; }); }} /><span>Akceptuję <u>Regulamin</u> i <u>Politykę prywatności</u> oraz składam zamówienie z obowiązkiem zapłaty. <b>*</b></span></label><p className="order-error" aria-hidden={!errors["accepted"]}>{errors["accepted"] ?? ""}</p><label><Checkbox checked={portfolio} onCheckedChange={(value) => setPortfolio(value === true)} /><span>Zgadzam się na wykorzystanie zdjęć wykonanej figurki w portfolio prezentującym realizacje. (opcjonalnie)</span></label></section>
      </div>
      <aside className="order-sidebar"><div className="order-preview-frame" aria-label="Podgląd figurki">
        <img className="order-preview-image" src={previews[preview]?.url ?? previewImage.url} alt="Podgląd figurki" />
        <div className="order-preview-overlay"><span className="order-preview-label"><span className="order-preview-dot" />Wizualizacja poglądowa</span><span className="order-preview-badge">Poglądowy</span></div>
      </div>
        <div className="order-dots" aria-label="Zdjęcia podglądu">{previews.map((_, index) => <Button key={index} type="button" variant="ghost" size="icon" aria-label={`Pokaż zdjęcie ${index + 1}`} aria-pressed={preview === index} onClick={() => setPreview(index)} className={preview === index ? "is-active" : ""}><span /></Button>)}</div>
        <div className="order-summary-block"><h3><PackageCheck aria-hidden="true" /> Podsumowanie konfiguracji</h3><OrderRow icon={UsersRound} label="Liczba osób / zwierząt" value={subjectLabel} /><OrderRow icon={UsersRound} label="Rozmiar figurki" value={size?.label ?? "—"} /><OrderRow icon={Paintbrush} label="Wykończenie" value={finishLabel ?? "—"} /><OrderRow icon={CircleCheck} label="Podstawka" value={config.base === "personalized" && config.graverText ? `${base?.label} — ${config.graverText}` : base?.label ?? "—"} /><OrderRow icon={Gift} label="Opakowanie" value={pack?.label ?? "—"} /><div className="order-row"><Images aria-hidden="true" /><span>Zdjęcia</span>{orderPhotos.length ? <OrderPhotoGallery files={orderPhotos} compact /> : <strong>Brak zdjęć — dodaj w Ofercie</strong>}</div><Button variant="outline" size="sm" asChild className="order-edit-summary"><Link to="/oferta">Edytuj konfigurację <ArrowRight aria-hidden="true" /></Link></Button></div>
        <div className="order-summary-block order-totals"><h3><ShieldCheck aria-hidden="true" /> Szczegóły zamówienia</h3><div><span>Figurka</span><strong>{money(figurinePrice)}</strong></div><div><span>Dostawa ({delivery === "parcel" ? "Paczkomat" : "Kurier"})</span><strong>{deliveryPrice === 0 ? "Darmowa" : money(deliveryPrice)}</strong></div><div className="order-total"><strong>Razem</strong><strong>{money(figurinePrice + deliveryPrice)}</strong></div></div>
        <p className="order-estimate"><Clock3 aria-hidden="true" /> Przewidywany czas realizacji: do 14 dni roboczych</p>
        <Button type="submit" className="order-submit">Przejdź do płatności <ArrowRight aria-hidden="true" /></Button>
      </aside>
    </form>
  </div></main><SiteFooter /></>;
}

function OrderRow({ icon: Icon, label, value }: { icon: typeof UsersRound; label: string; value: string }) {
  return <div className="order-row"><Icon aria-hidden="true" /><span>{label}</span><strong>{value}</strong></div>;
}
