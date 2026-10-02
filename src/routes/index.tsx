import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Box,
  Crosshair,
  PackageCheck,
  Printer,
  CalendarDays,
  Camera,
  Check,
  CircleCheck,
  Gift,
  Paintbrush,
  Hexagon,
  Image as ImageIcon,
  Instagram,
  ShieldCheck,
  Star,
  UserRound,
  UsersRound,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import banerAsset from "@/assets/baner.jpg.asset.json";
import heroBgAsset from "@/assets/baner-ver2.jpg.asset.json";
import realizacjaZdjecieAsset from "@/assets/realizacja-zdjecie.jpg.asset.json";
import model3dAsset from "@/assets/model-3d.jpg.asset.json";
import reczneMalowanieAsset from "@/assets/reczne-malowanie.jpg.asset.json";
import gotowaFigurkaAsset from "@/assets/gotowa-figurka.jpg.asset.json";
import boksJednokolorowaAsset from "@/assets/boks-figurka-jednokolorowa.jpg.asset.json";
import boksMalowanaAsset from "@/assets/boks-figurka-malowana.jpg.asset.json";
import dlaNiejiDlaNiegoAsset from "@/assets/DlaniejIJego-v4.jpg.asset.json";
import dlaParyAsset from "@/assets/DlaPary-v4.jpg.asset.json";
import dlaRodzinyAsset from "@/assets/DlaRodziny-v4.jpg.asset.json";
import dlaPupilaAsset from "@/assets/DlaPupila-v4.jpg.asset.json";
import hobbyAsset from "@/assets/Hobby-v4.jpg.asset.json";
import urodzinyAsset from "@/assets/urodziny-v4.jpg.asset.json";
import slubAsset from "@/assets/slub-v4.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Personalizowane figurki 3D | prezent3d.com" },
      { name: "description", content: "Tworzymy personalizowane figurki 3D ze zdjęć — od projektu po ręczne malowanie." },
      { property: "og:title", content: "Personalizowane figurki 3D | prezent3d.com" },
      { property: "og:description", content: "Wyjątkowe figurki 3D tworzone na podstawie Twoich zdjęć." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const occasions = [
  { label: "Dla niej i dla niego", image: dlaNiejiDlaNiegoAsset.url, alt: "Figurki dla niej i dla niego" },
  { label: "Dla par", image: dlaParyAsset.url, alt: "Figurka pary" },
  { label: "Dla rodziny", image: dlaRodzinyAsset.url, alt: "Figurka rodziny" },
  { label: "Dla miłośników zwierząt", image: dlaPupilaAsset.url, alt: "Figurka osoby z psem", wrap: true },
  { label: "Hobby i  pasje", image: hobbyAsset.url, alt: "Figurka rowerzysty" },
  { label: "Urodziny i rocznice", image: urodzinyAsset.url, alt: "Figurka kobiety z tortem urodzinowym" },
  { label: "Ślub", image: slubAsset.url, alt: "Figurka ślubna" },
];
const process = [
  [Camera, "Prześlij zdjęcia", "Wybierz zdjęcia, na których dobrze widać postać."],
  [Box, "Tworzymy model 3D", "Przygotowujemy indywidualny model figurki na podstawie zdjęć."],
  [CircleCheck, "Akceptujesz projekt", "Pokazujemy Ci projekt do akceptacji. Możesz zgłosić zmiany przed wykonaniem figurki."],
  [CalendarDays, "Drukujemy i obrabiamy", "Drukujemy figurkę 3D, a następnie starannie ją wykańczamy i malujemy."],
  [Gift, "Otrzymujesz gotową figurkę", "Gotową figurkę bezpiecznie pakujemy i wysyłamy do Ciebie."],
] as const;
const additionalOptions = [
  { icon: UsersRound, title: "Dodatkowa postać / zwierzę", text: "+1 / +2 / +3" },
  { icon: Gift, title: "Opakowanie prezentowe", text: "Stylowe, gotowe na prezent" },
  { icon: Hexagon, title: "Personalizowana podstawa", text: "Grawer, napis, data" },
  { icon: ShieldCheck, title: "Inne dodatki", text: "np. elementy dekoracyjne" },
];
const heroHighlights = [
  { icon: Gift, line1: "Idealny prezent", line2: "na każdą okazję" },
  { icon: ShieldCheck, line1: "Wysoka jakość", line2: "wykonania" },
  { icon: Camera, line1: "Oryginalny projekt", line2: "na podstawie zdjęcia" },
  { icon: Printer, line1: "Druk 3D", line2: "i ręczne wykończenie" },
  { icon: Paintbrush, line1: "Ręczne", line2: "malowanie" },
];

function Placeholder({ className = "", label = "Miejsce na zdjęcie" }: { className?: string; label?: string }) {
  return <div className={`image-placeholder grid place-items-center overflow-hidden ${className}`}><ImageIcon className="size-8 text-muted-foreground/45" aria-hidden="true" /><span className="sr-only">{label}</span></div>;
}

function SectionTitle({ eyebrow, title, text, textClass = "max-w-2xl" }: { eyebrow: string; title: string; text?: string; textClass?: string }) {
  return <div><p className="text-[11px] font-extrabold uppercase text-primary">{eyebrow}</p><h2 className="mt-1 text-2xl font-extrabold leading-tight text-foreground md:text-[28px]">{title}</h2>{text && <p className={`mt-2 text-sm leading-6 text-muted-foreground ${textClass}`}>{text}</p>}</div>;
}

function SectionDivider() {
  return <div aria-hidden="true" className="h-px w-full bg-border" />;
}

function Index() {
  return (
    <main className="min-h-screen overflow-x-clip bg-background">
      <SiteHeader active="home" />

      <section
        className="responsive-hero relative bg-brand-soft bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBgAsset.url})` }}
      >
        <div className="pointer-events-none absolute inset-0 bg-background/5" aria-hidden="true" />
        <div className="section-shell relative grid items-stretch lg:min-h-[500px] lg:grid-cols-[1.08fr_.92fr]">
          <div className="flex min-w-0 flex-col justify-center py-10 sm:py-12 lg:py-14 lg:pr-16">
            <p className="text-xs font-extrabold uppercase text-primary">Personalizowane figurki 3D</p>
            <h1 className="mt-3 max-w-[640px] text-[36px] font-extrabold leading-[1.08] sm:text-[44px] lg:text-[52px]">Stwórz personalizowaną <span className="text-primary">figurkę 3D</span> ze zdjęcia.</h1>
            <p className="mt-5 max-w-[560px] text-[15px] leading-7 text-muted-foreground">Zamień swoje zdjęcie w wyjątkową figurkę 3D. Wybierz rozmiar, liczbę postaci&nbsp;&nbsp;i sposób wykończenia, a my przygotujemy ją na podstawie Twoich zdjęć.</p>
            <Button variant="hero" size="hero" className="mt-6 w-fit" asChild><Link to="/oferta">Stwórz swoją figurkę <ArrowRight /></Link></Button>
          </div>
        </div>
        <div className="relative h-[260px] bg-cover bg-[58%_center] bg-no-repeat sm:h-[310px] lg:hidden" style={{ backgroundImage: `url(${heroBgAsset.url})` }}>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/70 to-transparent" aria-hidden="true" />
        </div>
        <div className="border-t border-border/60 bg-background">
          <div className="section-shell grid grid-cols-2 gap-x-4 gap-y-2.5 py-4 text-[10px] font-semibold sm:text-[11px] lg:flex lg:items-center lg:justify-between lg:gap-0">
            {heroHighlights.map(({ icon: Icon, line1, line2 }, i) => (
              <div key={line1} className={`flex min-w-0 items-center gap-2 ${i === heroHighlights.length - 1 ? "col-span-2 justify-center lg:-translate-x-[3px]" : ""}`}>
                <Icon className="size-7 shrink-0 text-primary" />
                <span>{line1}<br />{line2}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />


      <section id="warianty" className="bg-card py-10 md:py-12">
        <div className="section-shell">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-extrabold uppercase text-primary">Nasza oferta</p>
              <h2 className="mt-1 text-3xl font-extrabold leading-tight text-foreground">Wybierz swoją figurkę 3D</h2>
              <p className="mt-2 max-w-[580px] text-sm leading-6 text-muted-foreground">Dopasuj rozmiar, liczbę postaci, sposób wykończenia i dodatkowe elementy.<br className="hidden md:block" /> Stworzymy figurkę dopasowaną do Twoich potrzeb.</p>
            </div>
            <Link to="/oferta" className="hidden shrink-0 items-center gap-2 pb-2 text-xs font-bold text-primary md:flex">Zobacz pełną ofertę <ArrowRight className="size-4" /></Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_.52fr]">
            <article
              className="relative min-h-[360px] overflow-hidden rounded-md bg-cover bg-center bg-no-repeat p-6 md:min-h-[390px]"
              style={{ backgroundImage: `url(${boksJednokolorowaAsset.url})` }}
            >
              <div className="relative z-10 max-w-[58%]">
<span className="inline-block rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary">PROMOCJA POTRWA DO <span className="text-promo">30.11.2026</span></span>
                <h3 className="mt-2 text-base font-extrabold text-foreground">Figurka jednokolorowa</h3>
                <p className="mt-1 text-[11px] text-muted-foreground">Minimalistyczna forma, maksymalny efekt.</p>
                <p className="mt-6 flex items-baseline gap-2 text-foreground">
                  <s className="text-xs font-semibold text-promo">310zł</s>
                  <strong className="text-2xl font-extrabold text-primary">180 zł</strong>
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Cena od</p>
                <ul className="mt-4 space-y-3">
                  {["Model 3D na podstawie zdjęcia", "Druk 3D i obróbka", "Jeden kolor materiału", "Standardowe opakowanie"].map((item) => <li key={item} className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground"><Check className="size-4 shrink-0 text-primary" strokeWidth={3} />{item}</li>)}
                </ul>
              </div>
              <Button variant="hero" size="sm" className="absolute bottom-7 left-6 z-10 px-6" asChild><Link to="/oferta">Wybierz <ArrowRight /></Link></Button>
            </article>

            <article
              className="relative min-h-[360px] overflow-hidden rounded-md bg-cover bg-center bg-no-repeat p-6 md:min-h-[390px]"
              style={{ backgroundImage: `url(${boksMalowanaAsset.url})` }}
            >
              <div className="relative z-10 max-w-[58%]">
                <span className="inline-block rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary">PROMOCJA POTRWA DO <span className="text-promo">30.11.2026</span></span>
                <h3 className="mt-2 text-base font-extrabold text-foreground">Figurka malowana</h3>
                <p className="mt-1 text-[11px] text-muted-foreground">Jeszcze więcej realizmu i detali.</p>
                <p className="mt-6 flex items-baseline gap-2 text-foreground">
                  <s className="text-xs font-semibold text-promo">410zł</s>
                  <strong className="text-2xl font-extrabold text-primary">280zł</strong>
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Cena od</p>
                <ul className="mt-4 space-y-3">
                  {["Model 3D na podstawie zdjęcia", "Druk 3D i obróbka", "Ręczne malowanie", "Standardowe opakowanie"].map((item) => <li key={item} className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground"><Check className="size-4 shrink-0 text-primary" strokeWidth={3} />{item}</li>)}
                </ul>
              </div>
              <Button variant="hero" size="sm" className="absolute bottom-7 left-6 z-10 px-6" asChild><Link to="/oferta">Wybierz <ArrowRight /></Link></Button>
            </article>

            <aside className="rounded-md bg-brand-soft p-6 md:col-span-2 lg:col-span-1">
              <div className="flex items-start gap-3 border-b border-border/70 pb-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-background/70 text-primary"><Hexagon className="size-5" /></div>
                <div><h3 className="text-base font-extrabold">Dodatkowe opcje</h3><p className="mt-1 text-[10px] leading-4 text-muted-foreground">Rozszerz swoją figurkę o dodatkowe elementy.</p></div>
              </div>
              {additionalOptions.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-center gap-3 border-b border-border/70 py-3.5 last:border-b-0">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-background/70 text-primary"><Icon className="size-4" /></div>
                  <div className="min-w-0 flex-1"><h4 className="whitespace-nowrap text-[11px] font-bold text-foreground">{title}</h4><p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{text}</p></div>
                  <ArrowRight className="size-4 shrink-0 text-primary" />
                </div>
              ))}
            </aside>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section id="realizacje" className="bg-card py-8 md:py-10">
        <div className="section-shell">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"><SectionTitle eyebrow="PROCES POWSTAWANIA FIGUREK" title="Zobacz, jak powstaje Twoja figurka" text="Od zdjęcia do gotowej figurki 3D – poznaj kolejne etapy tworzenia Twojej wyjątkowej pamiątki."/><a href="#" className="hidden text-xs font-bold text-primary md:block">Zobacz więcej realizacji →</a></div>
          <div className="mt-5 grid gap-3 md:grid-cols-[repeat(4,minmax(0,1fr))_1.35fr]">
            {[
              { id: "zdjecie", label: <span className="inline-flex items-center gap-1">zdjęcie <ArrowRight className="h-3 w-5" /> model 3D</span>, image: realizacjaZdjecieAsset.url, alt: "Zdjęcie klienta" },
              { id: "model", label: "Wydruk i obróbka", image: model3dAsset.url, alt: "Wydruk i obróbka" },
              { id: "malowanie", label: "Ręczne malowanie", image: reczneMalowanieAsset.url, alt: "Ręczne malowanie" },
              { id: "gotowa", label: "Gotowa figurka", image: gotowaFigurkaAsset.url, alt: "Gotowa figurka" },
            ].map((item) => (
              <article key={item.id} className="overflow-hidden rounded-md border border-border">
                {item.image ? <img src={item.image} alt={item.alt} className="aspect-[1.04] w-full object-cover" /> : <Placeholder className="aspect-[1.04]" />}
                <div className="h-10 px-3 py-3 text-[11px] font-semibold">{item.label}</div>
              </article>
            ))}


            <aside className="flex min-h-[210px] flex-col justify-center rounded-md bg-brand-soft p-7"><Gift className="size-7 text-primary"/><h3 className="mt-3 text-xl font-extrabold leading-tight">Wyjątkowy prezent?<br/><span className="text-primary">Zróbmy go w 3D.</span></h3><p className="mt-2 text-xs leading-5 text-muted-foreground">Personalizowana figurka to doskonały pomysł na prezent dla bliskiej osoby.</p><Button variant="hero" size="sm" className="mt-4 w-fit">Zobacz inspiracje <ArrowRight/></Button></aside>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section id="proces" className="bg-background py-6 md:py-7">
        <div className="section-shell grid gap-7 xl:grid-cols-[250px_minmax(0,1fr)] xl:items-center xl:gap-9">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight text-foreground">Jak to działa?</h2>
            <p className="mt-2 text-base font-bold text-primary">Od zdjęcia do gotowej figurki</p>
            <p className="mt-1 max-w-[240px] text-xs leading-5 text-muted-foreground">To prostsze, niż myślisz. Przesyłasz zdjęcie, a my zajmujemy się resztą.</p>
            <Button variant="hero" size="default" className="mt-5 w-full max-w-[230px]" asChild><Link to="/oferta">Stwórz swoją figurkę <ArrowRight /></Link></Button>
          </div>
          <div className="relative">
            <div className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-primary/20 xl:block" aria-hidden="true" />
            <div className="relative grid gap-7 sm:grid-cols-2 xl:grid-cols-5 xl:gap-6">
              {process.map(([Icon, title, text], i) => (
                <div key={title} className="relative z-10 min-w-0 text-center">
                  <div className="relative mx-auto w-fit">
                    <div className="grid size-14 place-items-center rounded-full border border-primary/25 bg-background text-primary shadow-sm">
                      <Icon className="size-6" strokeWidth={2.1} />
                    </div>
                    <span className="absolute -bottom-1.5 left-1/2 grid size-6 -translate-x-1/2 place-items-center rounded-full bg-brand-soft text-[9px] font-extrabold text-primary">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="mt-5 flex h-12 flex-col items-center">
                    <h3 className="text-sm font-extrabold leading-5 text-foreground">{title}</h3>
                    <div aria-hidden="true" className="w-px flex-1 bg-primary/30" />
                  </div>
                  <p className="text-xs leading-[1.15rem] text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section id="okazje" className="bg-card py-7 md:py-9">
        <div className="section-shell">
           <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"><SectionTitle eyebrow="ZAINSPIRUJ SIĘ" title="Figurki 3D na każdą okazję" text="Tworzymy personalizowane figurki 3D na podstawie zdjęć – dla osób, par, rodzin, miłośników zwierząt i nie tylko. Masz własny pomysł? Stworzymy figurkę według Twojego projektu.  " textClass="max-w-2xl md:max-w-none md:text-balance"/><a href="#realizacje" className="hidden text-xs font-bold text-primary md:block">Zobacz wszystkie kategorie→</a></div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {occasions.map((item) => (
              <article key={item.label} className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
                {item.image ? <img src={item.image} alt={item.alt} className="aspect-[1.05] w-full object-cover" /> : <Placeholder className="aspect-[1.05]" />}
                <div className="flex h-11 items-center justify-between gap-2 px-3 text-xs font-semibold"><span className={item.wrap ? "" : "whitespace-nowrap"}>{item.label}</span><ArrowRight className="size-4 shrink-0 text-primary"/></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      <section id="opinie" className="bg-background py-8 md:py-10">
        <div className="section-shell">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <SectionTitle eyebrow="Opinie klientów" title="Co mówią nasi klienci?" text="Każda figurka to osobna historia. Zobacz, jak klienci oceniają swoje zamówienia." />
            <Button variant="outline" className="hidden shrink-0 items-center gap-2 rounded-full text-xs font-bold text-primary md:inline-flex">Zobacz więcej opinii <ArrowRight className="size-4" /></Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { quote: "„Figurka przerosła nasze oczekiwania! Świetna jakość i dbałość o detale. Zdecydowanie polecam!”", name: "Anna K.", order: "Zamówienie: Para + pies | 20 cm" },
              { quote: "„Bardzo dobry kontakt, szybka realizacja i efekt końcowy idealny. To był strzał w dziesiątkę na prezent!”", name: "Michał S.", order: "Zamówienie: Rodzina | 25 cm" },
              { quote: "„Świetna jakość i profesjonalne podejście. Figurka wygląda dokładnie tak, jak na zdjęciu!”", name: "Katarzyna P.", order: "Zamówienie: Jedna osoba | 15 cm" },
              { quote: "„Piękne wykonanie, dbałość o szczegóły i świetny kontakt. Na pewno wrócę z kolejnym zamówieniem!”", name: "Tomasz L.", order: "Zamówienie: Hobby | 20 cm" },
            ].map((review) => (
              <article key={review.name} className="flex h-full flex-col rounded-md border border-border bg-card p-5 shadow-sm">
                <div className="flex gap-1 text-primary" aria-label="Ocena 5 na 5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="size-3.5" fill="currentColor" strokeWidth={0} />)}
                </div>
                <p className="mt-3 flex-1 text-[11px] leading-5 text-foreground">{review.quote}</p>
                <p className="mt-4 text-[11px] font-extrabold text-primary">{review.name}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{review.order}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="dlaczego-my"
        className="why-bg bg-brand-soft/60 py-6 md:py-8"
      >
        <div className="section-shell">
          <div className="grid gap-8 px-7 py-8 md:px-9 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
              <div>
                <h2 className="text-xl font-extrabold leading-snug text-foreground"><span className="text-primary">Dlaczego warto</span><br />wybrać właśnie nas?</h2>
                <p className="mt-3 text-[11px] leading-5 text-muted-foreground">Mała figurka, wielkie wspomnienia</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {([
                  [UserRound, "Indywidualne podejście", "do każdego zamówienia"],
                  [Printer, "Wysoka jakość", "wydruku 3D"],
                  [Crosshair, "Precyzyjne odwzorowanie", "detali"],
                  [PackageCheck, "Bezpieczne pakowanie", "i szybka wysyłka"],
                ] as const).map(([Icon, title, sub]) => (
                  <div key={title} className="border-primary/10 lg:border-l lg:pl-6 lg:first:border-l-0 lg:first:pl-0">
                    <div className="grid size-12 place-items-center rounded-xl bg-card text-primary shadow-sm">
                      <Icon className="size-6" strokeWidth={2} />
                    </div>
                    <p className="mt-5 text-xs font-bold leading-5 text-foreground">{title}<br /><span className="font-semibold text-muted-foreground">{sub}</span></p>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </section>

      <section className="mt-2 bg-primary/5">
        <div className="section-shell">
          <div className="flex flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
            <div className="flex items-start gap-4">
              <Gift className="mt-0.5 size-8 shrink-0 text-primary" strokeWidth={2.2} />
              <div>
                <h2 className="text-lg font-extrabold text-foreground">Gotowy na swoją figurkę?</h2>
                <p className="mt-1 text-xs text-muted-foreground">Prześlij zdjęcie i stwórz własną, personalizowaną figurkę.</p>
              </div>
            </div>
            <Button variant="hero" size="hero" className="shrink-0" asChild><Link to="/oferta">Stwórz swoją figurkę <ArrowRight/></Link></Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}