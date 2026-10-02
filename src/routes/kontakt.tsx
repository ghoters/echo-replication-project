import { createFileRoute, Link } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useState } from "react";
import {
  ArrowRight,
  Box,
  CircleHelp,
  CreditCard,
  Mail,
  MapPin,
  PackageCheck,
  Paintbrush,
  Phone,
  Lock,
} from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import kontaktBannerAsset from "@/assets/kontakt-banner.jpg.asset.json";

export const Route = createFileRoute("/kontakt")({
  head: () => ({
    meta: [
      { title: "Kontakt | prezent3d.com" },
      { name: "description", content: "Skontaktuj się z nami – odpowiemy na pytania o projekt, wycenę i realizację personalizowanej figurki 3D." },
      { property: "og:title", content: "Kontakt | prezent3d.com" },
      { property: "og:description", content: "Masz pytanie lub pomysł na figurkę? Napisz do nas – chętnie pomożemy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KontaktPage,
});

const CONTACT_EMAIL = "prezent3d@gmail.com";

const subjects = ["Pytanie o zamówienie", "Wycena projektu", "Poprawki do projektu", "Współpraca", "Inne"];

const inputClass = "w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

const contactDetails = [
  { icon: Mail, label: "Email", value: CONTACT_EMAIL, note: "Napisz do nas o dowolnej porze.", href: `mailto:${CONTACT_EMAIL}` },
  { icon: Phone, label: "Telefon", value: "+48 576 309 671", note: "Pon. – Pt. 9:00 – 17:00", href: undefined },
  { icon: MapPin, label: "Siedziba", value: "Polska", note: "Działamy na terenie całego kraju.", href: undefined },
] as const;

const quickFaq = [
  { icon: PackageCheck, title: "Czas realizacji", text: "Jak długo trwa wykonanie figurki?" },
  { icon: Paintbrush, title: "Personalizacja", text: "Czy mogę wysłać więcej zdjęć?" },
  { icon: CreditCard, title: "Płatności", text: "Jakie formy płatności akceptujecie?" },
  { icon: Box, title: "Dostawa", text: "Jak wygląda wysyłka i ile kosztuje?" },
] as const;

function KontaktPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(subjects[0] ?? "");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = `Imię i nazwisko: ${name}\nAdres e-mail: ${email}\n\n${message}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main className="flex min-h-screen flex-col overflow-x-clip bg-background">
      <SiteHeader active="kontakt" />

      <div className="flex-1">
      <section className="relative min-h-[270px] overflow-hidden bg-brand-soft sm:min-h-[310px]">
        <img src={kontaktBannerAsset.url} alt="Personalizowana figurka 3D pary" width={1920} height={700} className="absolute inset-0 size-full object-cover object-[74%_center] sm:object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/55 to-transparent sm:via-background/20" aria-hidden="true" />
        <div className="section-shell relative z-10 flex min-h-[270px] items-center py-10 sm:min-h-[310px]">
          <div className="max-w-[510px]">
            <p className="text-[11px] font-extrabold uppercase text-primary">Kontakt</p>
            <h1 className="mt-3 text-[36px] font-extrabold leading-[1.08] text-foreground sm:text-[44px] lg:text-[52px]">Skontaktuj się z nami</h1>
            <p className="mt-5 max-w-[560px] text-[15px] leading-7 text-muted-foreground">Masz pytanie dotyczące figurki, zamówienia lub realizacji Twojego pomysłu? Napisz lub zadzwoń — chętnie pomożemy.</p>
          </div>
        </div>
      </section>

      <section className="bg-background py-7 md:py-10">
        <div className="section-shell grid gap-3 lg:grid-cols-[0.92fr_1.58fr_0.95fr]">
          <section className="rounded-lg border border-border bg-card px-6 py-6 sm:px-7" aria-labelledby="contact-details-title">
            <p className="text-[11px] font-extrabold uppercase text-primary">Skontaktuj się z nami</p>
            <h2 id="contact-details-title" className="mt-1 text-2xl font-extrabold leading-tight text-foreground md:text-[28px]">Dane kontaktowe</h2>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">Jesteśmy dostępni od poniedziałku <br />do piątku w godzinach 9:00–17:00. Odpowiadamy na wszystkie wiadomości <br />w ciągu 24 godzin.</p>
            <div className="mt-7 space-y-6">
              {contactDetails.map((item) => {
                const content = (
                  <>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary"><item.icon className="size-5" /></span>
                    <span>
                      <span className="block text-[11px] font-bold text-foreground">{item.label}</span>
                      <span className="mt-1 block text-xs font-semibold text-foreground">{item.value}</span>
                      <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{item.note}</span>
                    </span>
                  </>
                );
                return item.href ? <a key={item.label} href={item.href} className="flex items-start gap-4 transition-colors hover:text-primary">{content}</a> : <div key={item.label} className="flex items-start gap-4">{content}</div>;
              })}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card px-6 py-6 sm:px-7" aria-labelledby="contact-form-title">
            <p className="text-[11px] font-extrabold uppercase text-primary">Napisz do nas</p>
            <h2 id="contact-form-title" className="mt-1 text-2xl font-extrabold leading-tight text-foreground md:text-[28px]">Formularz kontaktowy</h2>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">Wypełnij krótki formularz, a my jak najszybciej odpowiemy na Twoje pytanie.</p>
            <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <input required value={name} onChange={(event) => setName(event.target.value)} className={inputClass} placeholder="Imię i nazwisko *" aria-label="Imię i nazwisko" />
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="Adres e-mail *" aria-label="Adres e-mail" />
              </div>
              <select required value={subject} onChange={(event) => setSubject(event.target.value)} className={inputClass} aria-label="Temat wiadomości">
                {subjects.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <textarea required rows={5} value={message} onChange={(event) => setMessage(event.target.value)} className={`${inputClass} resize-none`} placeholder="Wiadomość *" aria-label="Wiadomość" />
              <Button variant="hero" type="submit" className="w-full"><Mail /> Wyślij wiadomość <ArrowRight /></Button>
            </form>
            <p className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground"><Lock className="size-3.5 shrink-0 text-primary" /> Twoje dane są bezpieczne. Nie udostępniamy ich osobom trzecim.</p>
          </section>

          <aside className="rounded-lg border border-border bg-secondary/45 px-6 py-6 sm:px-7" aria-labelledby="quick-help-title">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-primary"><CircleHelp className="size-6" /></span>
              <div>
                <p className="text-[11px] font-extrabold uppercase text-primary">Szybka pomoc</p>
                <h2 id="quick-help-title" className="mt-1 text-base font-extrabold text-foreground">Najczęściej zadawane pytania</h2>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">Zanim napiszesz do nas wiadomość, sprawdź czy odpowiedź na Twoje pytanie nie znajduje się w FAQ.</p>
            <Button variant="outline" size="sm" asChild className="mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground"><Link to="/faq">Przejdź do FAQ <ArrowRight /></Link></Button>
            <div className="mt-5 border-t border-border">
              {quickFaq.map((item) => (
                <Link key={item.title} to="/faq" className="group flex items-center gap-3 border-b border-border py-3 last:border-b-0">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-card text-primary"><item.icon className="size-4" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-[11px] font-bold text-foreground">{item.title}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">{item.text}</span></span>
                  <ArrowRight className="size-3.5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
      </div>

      <section className="border-t border-border bg-background" aria-label="Pomoc">
        <div className="section-shell flex items-center justify-center gap-2.5 py-6">
          <CircleHelp className="size-5 shrink-0 text-primary" />
          <p className="text-[11px] leading-5 text-foreground">
            Nie znalazłeś odpowiedzi? Napisz na{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-primary transition-colors hover:underline">prezent3d@gmail.com</a>
            {" "}- odpowiadamy w ciągu 24 godzin.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
