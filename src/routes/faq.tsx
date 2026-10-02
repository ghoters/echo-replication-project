import { createFileRoute } from "@tanstack/react-router";
import type { ComponentType } from "react";
import {
  ArrowRight,
  Box,
  CircleHelp,
  ClipboardList,
  CreditCard,
  Headphones,
  Heart,
  PackageCheck,
  Palette,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import faqHeroAsset from "@/assets/faq-hero.jpg.asset.json";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Najczęściej zadawane pytania | prezent3d.com" },
      { name: "description", content: "Odpowiedzi na najczęstsze pytania o zamówienie, projekt, wykonanie, dostawę i płatność za personalizowaną figurkę 3D." },
      { property: "og:title", content: "Najczęściej zadawane pytania | prezent3d.com" },
      { property: "og:description", content: "Sprawdź najważniejsze informacje o zamawianiu personalizowanej figurki 3D." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});

type FaqCategory = "order" | "project" | "production" | "delivery" | "payments" | "account" | "other";
type IconType = ComponentType<{ className?: string; strokeWidth?: number }>;
type FaqItem = { question: string; answer: string };
type Category = { id: FaqCategory; label: string; icon: IconType; intro: string; items: FaqItem[] };

const categories: Category[] = [
  {
    id: "order", label: "Zamówienie", icon: ClipboardList, intro: "Jak zamówić figurkę, jakie zdjęcia przesłać i ile osób może być na figurce.",
    items: [
      { question: "Jak zamówić figurkę 3D?", answer: "Przejdź do konfiguratora, wybierz wariant figurki, rozmiar, wykończenie i dodatki. Następnie prześlij zdjęcia, uzupełnij dane i złóż zamówienie." },
      { question: "Czy mogę zamówić figurkę samego zwierzęcia, lub kilka zwierząt np. psa/kota?", answer: "Tak. Jeśli zamawiasz figurkę z jednym zwierzakiem, w kroku „Kogo ma przedstawiać figurka?” pozostaw zaznaczoną opcję „Osoba” (traktujemy ją jako postać bazową). Każde dodatkowe zwierzę dodasz opcją „Zwierzę”." },
      { question: "Ile zdjęć potrzebujecie?", answer: "Wystarczy 1 wyraźne zdjęcie, ale zalecamy przesłanie kilku ujęć. Pozwoli nam to precyzyjnie uchwycić rysy twarzy, sylwetkę\ni charakterystyczne szczegóły." },
      { question: "Ile osób może być na jednej figurce?", answer: "W konfiguratorze można dodać do 6 osób i 6 zwierząt. Przy większych zamówieniach wyceniamy indywidualnie." },
      { question: "Nie znalazłem opcji w konfiguratorze – co zrobić?", answer: "Skontaktuj się z nami mailowo (prezent3d@gmail.com) lub opisz swój pomysł w uwagach do zamówienia." },
      { question: "Czy mogę dodać coś, czego nie ma w konfiguratorze?", answer: "Tak. W konfiguratorze możesz skorzystać z opcji „Dodaj własny element” albo opisać nietypowy pomysł w uwagach do zamówienia lub mailowo (prezent3d@gmail.com)." },
      { question: "Czy mogę zamówić więcej niż jedną figurkę?", answer: "Tak. Jeśli chcesz zamówić kilka kopii tego samego projektu (np. jako prezent dla kilku osób) lub zupełnie różne figurki, podaj taką informację w uwagach do zamówienia albo napisz do nas na prezent3d@gmail.com – przygotujemy indywidualną wycenę" },
      { question: "Czy mogę wybrać pozę lub ubiór?", answer: "Tak. Opisz oczekiwaną pozę i ubiór w uwagach oraz dołącz zdjęcia referencyjne. Uwzględnimy je podczas przygotowania projektu." },
      { question: "Czy mogę zamówić kilka identycznych figurek?", answer: "Tak. W wiadomości do zamówienia podaj potrzebną liczbę egzemplarzy, a potwierdzimy cenę i termin realizacji." },
    ],
  },
  {
    id: "project", label: "Projekt", icon: Palette, intro: "Jak wygląda proces tworzenia modelu 3D i czy mogę wprowadzać zmiany?",
    items: [
      { question: "Czy mogę wybrać konkretną pozę?", answer: "Tak. Możesz wskazać pozę na przesłanym zdjęciu albo opisać ją w uwagach do zamówienia." },
      { question: "Czy mogę zmienić ubranie lub dodatki?", answer: "Tak. Możemy odwzorować ubranie ze zdjęcia lub przygotować inne na podstawie dodatkowych materiałów." },
      { question: "Jak wygląda proces akceptacji projektu?", answer: "Po przygotowaniu modelu 3D wysyłamy podgląd do akceptacji. Produkcja rozpoczyna się dopiero po Twoim zatwierdzeniu." },
      { question: "Ile zdjęć jest potrzebnych do wykonania modelu?", answer: "Wystarczy 1 wyraźne zdjęcie, ale zalecamy przesłanie kilku ujęć. Pozwoli nam to precyzyjnie uchwycić rysy twarzy, sylwetkę i charakterystyczne szczegóły." },
      { question: "Czy można zamówić kilka osób na jednym projekcie?", answer: "Tak. Liczbę postaci wybierzesz w konfiguratorze, a większą grupę możemy przygotować po indywidualnej wycenie." },
      { question: "Czy przed drukiem zobaczę projekt?", answer: "Tak. Zawsze otrzymasz cyfrowy podgląd modelu przed rozpoczęciem druku." },
      { question: "Czy mogę zgłosić poprawki do projektu?", answer: "Tak. Po otrzymaniu podglądu możesz przekazać uwagi, które omówimy przed ostateczną akceptacją." },
    ],
  },
  {
    id: "production", label: "Wykonanie", icon: Sparkles, intro: "Jak wygląda druk 3D, malowanie i cały proces realizacji?",
    items: [
      { question: "Z jakiego materiału wykonywane są figurki?", answer: "Figurki powstają z materiału przeznaczonego do precyzyjnego druku 3D, który dobrze odwzorowuje drobne detale." },
      { question: "Czy figurki są malowane ręcznie?", answer: "Tak, wariant kolorowy jest wykańczany i malowany ręcznie." },
      { question: "Jak trwałe są figurki?", answer: "Przy właściwym użytkowaniu figurka zachowuje wygląd przez lata. Zalecamy chronić ją przed upadkiem i długim działaniem słońca." },
      { question: "Jakie rozmiary figurek są dostępne?", answer: "Dostępne rozmiary znajdziesz w konfiguratorze. Rozmiar oznacza orientacyjną wysokość gotowej kompozycji." },
      { question: "Czy figurka może mieć personalizowaną podstawkę?", answer: "Tak. Możesz wybrać personalizowaną podstawkę i wpisać własny grawer." },
      { question: "Czy każda figurka jest wykonywana indywidualnie?", answer: "Tak. Każdy model tworzymy na podstawie zdjęć i wybranej konfiguracji konkretnego zamówienia." },
    ],
  },
  {
    id: "delivery", label: "Dostawa", icon: Truck, intro: "Jak wysyłamy figurkę i ile trwa dostawa?",
    items: [
      { question: "Jak długo trwa realizacja zamówienia?", answer: "Termin zależy od wariantu i liczby poprawek. Dokładny przewidywany czas potwierdzimy po przyjęciu zamówienia." },
      { question: "Jakie formy dostawy są dostępne?", answer: "Możesz wybrać przesyłkę kurierską lub dostawę do punktu odbioru." },
      { question: "Czy figurka jest bezpiecznie zapakowana?", answer: "Tak. Figurkę zabezpieczamy przed przemieszczaniem i uszkodzeniem podczas transportu." },
      { question: "Czy wysyłacie zamówienia za granicę?", answer: "Możliwość wysyłki zagranicznej i jej koszt ustalamy indywidualnie przed złożeniem zamówienia." },
      { question: "Czy otrzymam numer przesyłki?", answer: "Tak. Po nadaniu paczki otrzymasz informacje umożliwiające śledzenie przesyłki." },
    ],
  },
  {
    id: "payments", label: "Płatności", icon: CreditCard, intro: "Jakie formy płatności są dostępne i kiedy należy zapłacić?",
    items: [
      { question: "Jak mogę zapłacić za zamówienie?", answer: "Dostępne metody płatności zobaczysz na etapie finalizacji zamówienia." },
      { question: "Kiedy następuje płatność?", answer: "Płatność odbywa się po sprawdzeniu konfiguracji i danych zamówienia, przed rozpoczęciem realizacji." },
      { question: "Czy podane ceny są ostateczne?", answer: "Cena w podsumowaniu obejmuje wybrane opcje. Nietypowe elementy wymagające indywidualnej wyceny potwierdzimy osobno." },
      { question: "Czy mogę otrzymać dokument zakupu?", answer: "Tak. Dokument zakupu przekazujemy zgodnie z danymi podanymi podczas składania zamówienia." },
    ],
  },
  {
    id: "account", label: "Konto", icon: UserRound, intro: "Jak działa konto, gdzie sprawdzić status zamówienia?",
    items: [
      { question: "Czy muszę zakładać konto, aby złożyć zamówienie?", answer: "Nie. Zamówienie możesz złożyć bez tworzenia konta." },
      { question: "Gdzie sprawdzę status zamówienia?", answer: "Najważniejsze informacje o postępie realizacji przekazujemy na adres podany w zamówieniu." },
      { question: "Jak zmienić dane kontaktowe w zamówieniu?", answer: "Skontaktuj się z nami jak najszybciej i podaj dane pozwalające zidentyfikować zamówienie." },
    ],
  },
  {
    id: "other", label: "Inne", icon: CircleHelp, intro: "Masz inne pytanie? Sprawdź tutaj lub skontaktuj się z nami.",
    items: [{ question: "Czy mogę zamówić coś, czego nie ma w konfiguratorze?", answer: "Tak. Opisz swój pomysł i prześlij materiały, a sprawdzimy możliwości wykonania i przygotujemy indywidualną wycenę." }],
  },
];

const totalQuestions = categories.reduce((sum, category) => sum + category.items.length, 0);

function CategoryIcon({ icon: Icon }: { icon: IconType }) {
  return <span className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-primary"><Icon className="size-4" strokeWidth={2} /></span>;
}

function FaqPage() {
  const referenceSections = [
    {
      id: "order",
      label: "Zamówienie",
      icon: ClipboardList,
      intro: "Dowiedz się, jak złożyć zamówienie i czego potrzebujesz na jego realizację.",
      items: categories.find((category) => category.id === "order")?.items.slice(0, 7) ?? [],
    },
    {
      id: "project",
      label: "Projekt figurki",
      icon: Box,
      intro: "Poznaj szczegóły dotyczące wyglądu, personalizacji i możliwości projektowych.",
      items: categories.find((category) => category.id === "project")?.items.slice(0, 4) ?? [],
    },
    {
      id: "production",
      label: "Realizacja",
      icon: Sparkles,
      intro: "Sprawdź, jak wygląda proces tworzenia figurki, od modelu 3D po gotowy produkt.",
      items: [
        { question: "Jak długo trwa realizacja?", answer: "Termin zależy od wariantu figurki i liczby poprawek. Dokładny przewidywany czas potwierdzimy po przyjęciu zamówienia. Zwykle na realizację potrzebujemy 7 dni." },
        { question: "Jak wygląda druk 3D i malowanie?", answer: "Po akceptacji projektu drukujemy model z materiału przeznaczonego do precyzyjnego druku 3D. Wariant kolorowy jest następnie ręcznie wykańczany i malowany." },
        { question: "Czy zobaczę projekt przed wykonaniem?", answer: "Tak. Zawsze otrzymasz cyfrowy podgląd modelu i produkcja rozpocznie się dopiero po Twojej akceptacji." },
      ],
    },
    {
      id: "delivery",
      label: "Dostawa i płatność",
      icon: Truck,
      intro: "Dowiedz się, jak przebiega płatność, wysyłka i ile to kosztuje.",
      items: [
        { question: "Ile kosztuje dostawa?", answer: "Koszt dostawy zobaczysz w podsumowaniu zamówienia przed płatnością." },
        { question: "Jakie formy płatności są dostępne?", answer: "Dostępne metody płatności zobaczysz na etapie finalizacji zamówienia." },
        { question: "Jak figurka jest zabezpieczona podczas wysyłki?", answer: "Figurkę starannie zabezpieczamy przed przemieszczaniem i uszkodzeniem podczas transportu." },
      ],
    },
    {
      id: "account",
      label: "Konto i zamówienie",
      icon: UserRound,
      intro: "Sprawdź status zamówienia i zarządzaj swoim kontem.",
      items: [
        { question: "Gdzie mogę sprawdzić status zamówienia?", answer: "Najważniejsze informacje o postępie realizacji przekazujemy na adres podany w zamówieniu." },
        { question: "Czy mogę sprawdzić historię zamówień?", answer: "Informacje o poprzednich zamówieniach znajdziesz w wiadomościach wysłanych na Twój adres e-mail." },
        { question: "Jakie dane mogę edytować w swoim koncie?", answer: "Jeśli chcesz zmienić dane kontaktowe dotyczące zamówienia, skontaktuj się z nami jak najszybciej." },
      ],
    },
  ] as const;

  return (
    <main className="min-h-screen overflow-x-clip bg-background">
      <SiteHeader active="faq" />

      <section className="relative min-h-[270px] overflow-hidden bg-brand-soft sm:min-h-[310px]">
        <img src={faqHeroAsset.url} alt="Personalizowana figurka 3D pary" width={1920} height={700} className="absolute inset-0 size-full object-cover object-[62%_center] sm:object-center" />
        <div className="section-shell relative z-10 flex min-h-[270px] items-center py-10 sm:min-h-[310px]">
          <div className="max-w-[510px]">
            <p className="text-[11px] font-extrabold uppercase text-primary">FAQ</p>
            <h1 className="mt-2 text-[34px] font-extrabold leading-[1.08] text-foreground sm:text-[42px]">Najczęściej zadawane<br className="hidden sm:block" /> pytania</h1>
            <p className="mt-4 max-w-[470px] text-[13px] leading-6 text-muted-foreground">Zebraliśmy tutaj najważniejsze informacje, które pomogą Ci w łatwy sposób zamówić swoją personalizowaną figurkę 3D.</p>
          </div>
        </div>
      </section>

      <section className="bg-card py-7 md:py-10">
        <div className="section-shell">
          <div>
            {referenceSections.map((category, sectionIndex) => (
              <section key={category.id} aria-labelledby={`faq-${category.id}`} className={`grid gap-4 py-6 lg:grid-cols-[310px_minmax(0,1fr)] lg:gap-24 ${sectionIndex > 0 ? "border-t border-border" : "pt-0"}`}>
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-primary"><category.icon className="size-6" strokeWidth={1.8} /></span>
                  <div className="pt-1">
                    <h2 id={`faq-${category.id}`} className="text-[15px] font-extrabold text-foreground">{category.label}</h2>
                    <p className="mt-2 max-w-[230px] text-[10px] leading-[1.65] text-muted-foreground">{category.intro}</p>
                  </div>
                </div>
                <Accordion type="single" collapsible {...(sectionIndex === 0 ? { defaultValue: "order-0" } : {})} className="space-y-1.5">
                  {category.items.map((item, index) => (
                    <AccordionItem key={item.question} value={`${category.id}-${index}`} className="overflow-hidden rounded-md border border-border bg-background px-5 transition-colors data-[state=open]:border-primary/20 data-[state=open]:bg-secondary/40">
                      <AccordionTrigger className="min-h-10 py-2.5 text-[11px] font-bold leading-5 hover:text-primary hover:no-underline">{item.question}</AccordionTrigger>
                      <AccordionContent className="max-w-[760px] pr-8 pb-4 text-[11px] leading-5 text-muted-foreground">{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>

          <section className="mt-5 grid overflow-hidden rounded-lg bg-secondary/65 lg:grid-cols-2" aria-label="Dalsza pomoc">
            <div className="flex gap-5 px-6 py-7 sm:px-10">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-card text-primary shadow-sm"><Headphones className="size-6" /></span>
              <div>
                <h2 className="text-[14px] font-extrabold">Nie znalazłeś odpowiedzi na swoje pytanie?</h2>
                <p className="mt-2 max-w-[390px] text-[10px] leading-5 text-muted-foreground">Masz nietypowe pytanie dotyczące swojej figurki? Skontaktuj się z nami – chętnie pomożemy i odpowiemy na wszystkie wątpliwości.</p>
                <Button variant="hero" size="sm" asChild className="mt-4"><a href="mailto:prezent3d@gmail.com">Skontaktuj się z nami <ArrowRight /></a></Button>
              </div>
            </div>
            <div className="flex gap-5 border-t border-primary/20 px-6 py-7 sm:px-10 lg:border-t-0 lg:border-l">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-card text-primary shadow-sm"><Sparkles className="size-6" /></span>
              <div>
                <h2 className="text-[14px] font-extrabold">Chcesz stworzyć swoją figurkę?</h2>
                <p className="mt-2 max-w-[390px] text-[10px] leading-5 text-muted-foreground">Wybierz opcje, które Cię interesują i zobacz, ile może kosztować Twoja wyjątkowa figurka 3D.</p>
                <Button variant="outline" size="sm" asChild className="mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground"><a href="/oferta">Stwórz swoją figurkę <ArrowRight /></a></Button>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="border-y border-border bg-background">
        <div className="section-shell grid grid-cols-2 gap-y-6 py-7 lg:grid-cols-4">
          {([
            [ShieldCheck, "Bezpieczne płatności", "Szybkie i bezpieczne metody płatności."],
            [PackageCheck, "Terminowa realizacja", "Dokładamy starań, aby figurka dotarła na czas."],
            [Box, "Wysoka jakość", "Dbałość o każdy detal – od modelu po wykończenie."],
            [Heart, "Indywidualne podejście", "Każda figurka jest tworzona z myślą o Tobie."],
          ] as const).map(([Icon, title, text], index) => (
            <div key={title} className={`flex gap-3 px-3 sm:px-5 ${index > 0 ? "lg:border-l lg:border-border" : ""}`}>
              <Icon className="mt-0.5 size-6 shrink-0 text-primary" />
              <div><h2 className="text-[11px] font-bold text-foreground">{title}</h2><p className="mt-1 text-[9px] leading-4 text-muted-foreground">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}