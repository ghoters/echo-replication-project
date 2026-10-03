import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Clock3,
  Gift,
  Image as ImageIcon,
  Info,

  Lightbulb,
  Minus,
  Package,
  Palette,
  PawPrint,
  Plus,
  Sparkles,
  Star,
  UploadCloud,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CONFIG_STORAGE_KEY, readFigurineConfig, saveFigurineConfig } from "@/lib/figurine-config";
import { readOrderPhotos, saveOrderPhotos } from "@/lib/order-photos";
import { OrderPhotoGallery } from "@/components/OrderPhotoGallery";
import podgladFigurki from "@/assets/podglad-figurki-para-pies.jpg.asset.json";
import osoba1Asset from "@/assets/osoba1.jpg.asset.json";
import piesAsset from "@/assets/pies-nowy.jpg.asset.json";
import znakAsset from "@/assets/znak2.jpg.asset.json";
import rozmiar3Asset from "@/assets/rozmiar-3.jpg.asset.json";
import rozmiar2Asset from "@/assets/rozmiar-2.jpg.asset.json";
import rozmiar1Asset from "@/assets/rozmiar-1.jpg.asset.json";
import figurkaMalowanaAsset from "@/assets/figurka-recznie-malowana-v3.jpg.asset.json";
import figurkaJednokolorowaAsset from "@/assets/figurka-jednokolorowa.jpg.asset.json";
import podsatkaAsset from "@/assets/podsatka.jpg.asset.json";
import opakowanieStandardoweAsset from "@/assets/opakowanie-standardowe.jpg.asset.json";
import opakowaniePrezentoweAsset from "@/assets/opakowanie-prezentowe.jpg.asset.json";
import podstawkaPersonalizowanaAsset from "@/assets/podstawka-personalizowana.jpg.asset.json";
import bezPodstawkiAsset from "@/assets/bez-podstawki.jpg.asset.json";

export const Route = createFileRoute("/oferta")({
  head: () => ({
    meta: [
      { title: "Konfigurator figurki 3D | prezent3d.com" },
      { name: "description", content: "Skonfiguruj własną, personalizowaną figurkę 3D na podstawie zdjęć." },
      { property: "og:title", content: "Stwórz swoją figurkę 3D | prezent3d.com" },
      { property: "og:description", content: "Wybierz liczbę postaci, rozmiar, wykończenie i dodatki do swojej figurki 3D." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OfferPage,
});

type IconType = ComponentType<{ className?: string }>;
type ImageSide = "left" | "right";


// Ceny bazowe — zmiana tych wartości aktualizuje całą mechanikę cenową.
const BASE_PERSON_PRICE = 180;
// Dopłata za każdą dodatkową osobę/zwierzę (niezależnie od rozmiaru).
const EXTRA_SUBJECT_PRICE = 80;
// Maksymalna liczba dodatkowych osób/zwierząt na figurce.
const MAX_SUBJECTS = 6;

const subjectOptions: { id: string; title: string; text: string; icon: IconType; priceLabel: string; imageSide: ImageSide; recommended?: boolean; image?: string }[] = [
  { id: "person", title: "Osoba", text: "Figurka jednej lub więcej osób.", icon: UserRound, priceLabel: `${BASE_PERSON_PRICE} zł za 1. osobę\nkażda kolejna + ${EXTRA_SUBJECT_PRICE} zł`, imageSide: "right", recommended: true, image: osoba1Asset.url },
  { id: "animal", title: "Zwierzę", text: "Figurka zwierzęcia lub więcej zwierząt.", icon: PawPrint, priceLabel: `+${EXTRA_SUBJECT_PRICE} zł za zwierzę`, imageSide: "right", image: piesAsset.url },
  { id: "custom", title: "Dodaj własny element", text: "Przedmiot, pojazd lub inny element.", icon: Plus, priceLabel: "+ 80 zł", imageSide: "right", image: znakAsset.url },
];

// `price` = dopłata za rozmiar liczona ZA KAŻDĄ postać/zwierzę na figurce.
const sizes: { id: string; title: string; text: string; price: number; imageSide: ImageSide; recommended?: boolean; priceCentered?: boolean; image?: string; imageFull?: boolean }[] = [
  { id: "15", title: "15 cm", text: "Mała figurka", price: 0, imageSide: "left", image: rozmiar1Asset.url, imageFull: true },
  { id: "20", title: "20 cm", text: "Większa forma", price: 15, imageSide: "left", recommended: true, priceCentered: true, image: rozmiar2Asset.url, imageFull: true },
  { id: "25", title: "25 cm", text: "Najbardziej efektowny", price: 30, imageSide: "left", priceCentered: true, image: rozmiar3Asset.url, imageFull: true },
];

const finishes: { id: string; title: string; text: string; price: number; imageSide: ImageSide; recommended?: boolean; image?: string; imageFull?: boolean }[] = [
  { id: "single", title: "Figurka jednokolorowa", text: "Jeden kolor materiału lub wykończenia.", price: 0, imageSide: "left", image: figurkaJednokolorowaAsset.url, imageFull: true },
  { id: "painted", title: "Figurka ręcznie malowana", text: "Ręczne malowanie detali.", price: 100, imageSide: "left", recommended: true, image: figurkaMalowanaAsset.url, imageFull: true },
];

const bases: { id: string; title: string; text: string; price: number; imageSide: ImageSide; recommended?: boolean; image?: string; imageFull?: boolean; priceCentered?: boolean; textNowrap?: boolean; textRaised?: boolean }[] = [
  { id: "standard", title: "Standardowa", text: "Wliczona w cenę", price: 0, imageSide: "left", recommended: true, image: podsatkaAsset.url, imageFull: true },
  { id: "personalized", title: "Personalizowana", text: "Imię, data lub napis.", price: 40, imageSide: "left", image: podstawkaPersonalizowanaAsset.url, imageFull: true, priceCentered: true, textRaised: true },
  { id: "none", title: "Bez podstawki", text: "Bez dodatkowych kosztów", price: 0, imageSide: "left", image: bezPodstawkiAsset.url, imageFull: true, textNowrap: true },
];

const packages: { id: string; title: string; text: string; price: number; imageSide: ImageSide; recommended?: boolean; image?: string; imageFull?: boolean }[] = [
  { id: "standard", title: "Standardowe", text: "Wliczone w cenę", price: 0, imageSide: "left", image: opakowanieStandardoweAsset.url, imageFull: true },
  { id: "gift", title: "Pudełko prezentowe", text: "Eleganckie opakowanie gotowe do wręczenia.", price: 40, imageSide: "left", recommended: true, image: opakowaniePrezentoweAsset.url, imageFull: true },
];

function StepHeading({ number, title, subtitle, active }: { number: number; title: string; subtitle: string; active: boolean }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs font-extrabold transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`}>{number}</span>
      <div><h2 className="text-base font-extrabold">{title}</h2><p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p></div>
    </div>
  );
}

function ImageSlot({ image, side, className = "", contain = false }: { image?: string | undefined; side: ImageSide; className?: string; contain?: boolean }) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-md ${contain ? "bg-card bg-contain bg-center bg-no-repeat" : "bg-muted bg-cover"} ${className}`}
      style={image ? { backgroundImage: `url(${image})`, ...(!contain ? { backgroundPosition: side === "left" ? "center left" : "center right" } : {}) } : undefined}
      aria-hidden="true"
    >
      {!image && <ImageIcon className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/50" />}
    </span>
  );
}

function RecommendedBadge({ className }: { className: string }) {
  return (
    <span className={`absolute left-[5px] top-[3px] z-10 inline-flex h-5 min-w-[76px] items-center justify-center gap-1.5 rounded-full px-2.5 text-[10px] font-extrabold uppercase leading-none tracking-wider ${className}`}>
      <Star className="!size-3 shrink-0 fill-current" />
      <span>Polecam</span>
    </span>
  );
}

function ChoiceCard({ selected, stepActive, hoverable, locked, onClick, icon: Icon, title, text, price, priceLabel, priceViolet, priceCentered, counter, minCount, maxCount, onIncrement, onDecrement, image, imageSide, imageClassName, imageFull, imageContain, recommended, recommendedTone, textInput, titleNowrap, matchBadgePadding, tightGap }: {
  selected: boolean;
  stepActive: boolean;
  hoverable?: boolean;
  locked?: boolean;
  onClick: () => void;
  icon?: IconType;
  title: string;
  text: string;
  price?: number;
  priceLabel?: string;
  priceViolet?: boolean;
  priceCentered?: boolean;
  counter?: number | undefined;
  minCount?: number | undefined;
  maxCount?: number | undefined;
  onIncrement?: (() => void) | undefined;
  onDecrement?: (() => void) | undefined;
  image?: string | undefined;
  imageSide: ImageSide;
  imageClassName?: string | undefined;
  imageFull?: boolean | undefined;
  imageContain?: boolean | undefined;
  recommended?: boolean;
  recommendedTone?: "light-gray" | "dark-gray" | "purple" | undefined;
  textInput?: { value: string; placeholder: string; onChange: (value: string) => void; onCommit: () => void; onEdit: () => void; onCancel: () => void; onClear: () => void; committed: boolean; buttonLabel: string; error?: boolean | undefined; onEmpty?: (() => void) | undefined } | undefined;
  titleNowrap?: boolean | undefined;
  matchBadgePadding?: boolean | undefined;
  tightGap?: boolean | undefined;
}) {
  const recommendedClasses =
    recommendedTone === "light-gray" ? "bg-muted/60 text-muted-foreground/70" :
    recommendedTone === "dark-gray" ? "bg-muted-foreground/45 text-card" :
    recommendedTone === "purple" ? "bg-primary text-primary-foreground" :
    selected ? "bg-primary text-primary-foreground" :
    "bg-muted-foreground/30 text-muted-foreground";
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleCommit = () => {
    if (textInput?.value.trim()) {
      textInput.onCommit();
    }
  };
  const fullBackground = imageFull && image;
  // Full-background cards only need the wide bottom row while the user is editing.
  // The idle trigger and committed value stay aligned with the text column.
  const absEditor = Boolean(textInput && fullBackground && selected && !textInput.committed);
  const priceLines = (priceLabel ?? (price ? `+ ${price} zł` : "Cena podstawowa")).split("\n");
  const textInputPrice = textInput ? (
    <span className={`pt-3 text-xs font-bold ${priceViolet ? "text-primary" : ""} ${fullBackground ? "[&>span]:whitespace-normal" : ""}`}>
      {priceLines.map((line, index) => (
        <span key={index} className="block whitespace-nowrap">{line}</span>
      ))}
    </span>
  ) : null;
  const textInputTrigger = textInput && !selected ? (
    <button
      type="button"
      onClick={(event) => { event.stopPropagation(); onClick(); }}
      className="mt-3 inline-flex h-7 w-fit items-center justify-center gap-1.5 self-start rounded-full border border-primary/30 bg-primary/10 px-[6px] text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Plus className="size-3.5 shrink-0" />
      <span className="whitespace-nowrap text-center leading-none">{textInput.buttonLabel}</span>
    </button>
  ) : null;
  const textInputEditor = textInput && !textInput.committed && selected ? (
    <div className="mt-3 flex h-7 w-full gap-1">
      <input
        ref={inputRef}
        type="text"
        maxLength={40}
        autoFocus
        value={textInput.value}
        placeholder={textInput.placeholder}
        onChange={(event) => textInput.onChange(event.currentTarget.value)}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Enter") { event.preventDefault(); event.stopPropagation(); handleCommit(); }
          else if (event.key === " ") { event.stopPropagation(); }
          else if (event.key === "Escape") { event.stopPropagation(); inputRef.current?.blur(); }
        }}
        onBlur={(event) => {
          if (textInput.committed) return;
          if (event.relatedTarget && containerRef.current?.contains(event.relatedTarget as Node)) return;
          if (textInput.value.trim()) textInput.onCommit();
          else if (textInput.onEmpty) textInput.onEmpty();
          else textInput.onCancel();
        }}
        className={`h-7 min-w-0 flex-1 rounded border bg-card px-2 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring ${textInput.error ? "border-destructive" : "border-border"}`}
      />
      <button
        type="button"
        aria-label="Zatwierdź element"
        onMouseDown={(event) => event.preventDefault()}
        onClick={(event) => { event.stopPropagation(); handleCommit(); }}
        className="grid h-7 w-7 shrink-0 place-items-center rounded border border-primary/30 bg-primary/10 text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowRight className="size-3.5" />
      </button>
      {textInput.value.length > 0 && (
        <button
          type="button"
          aria-label="Wyczyść element"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => { event.stopPropagation(); textInput.onClear(); inputRef.current?.focus(); }}
          className="grid h-7 w-7 shrink-0 place-items-center rounded border border-border bg-muted/60 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  ) : null;
  const textInputChip = textInput?.committed && selected ? (
    <button
      type="button"
      onClick={(event) => { event.stopPropagation(); textInput.onEdit(); }}
      className="mt-3 flex h-7 w-[179px] items-center justify-between gap-1.5 rounded border border-primary/40 bg-primary/5 px-2 text-[11px] font-semibold text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="truncate text-left">{textInput.value}</span>
      <Check className="size-3.5 shrink-0 text-primary" />
    </button>
  ) : null;
  const slot = fullBackground ? <span aria-hidden="true" className={`block shrink-0 ${imageClassName ?? "w-[38%]"}`} /> : <ImageSlot image={image} side={imageSide} contain={Boolean(imageContain)} className={`h-full min-h-[108px] ${imageClassName ?? "w-[38%]"}`} />;
  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onClick}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onClick(); } }}
      className={`group relative flex min-h-[144px] w-full flex-row items-stretch justify-start ${tightGap ? "gap-3" : "gap-4"} overflow-hidden whitespace-normal rounded-md border p-3.5 text-left text-sm font-medium shadow-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${locked ? "cursor-default" : "cursor-pointer"} ${hoverable ? "hover:border-primary/40 hover:bg-accent hover:text-accent-foreground" : ""} ${selected ? "border-primary bg-card ring-1 ring-primary" : stepActive ? "border-border bg-card" : "border-border/60 bg-muted/50 text-muted-foreground"}`}
    >
      {fullBackground && image && (
        <span
          aria-hidden="true"
          className="absolute inset-0 z-0 bg-no-repeat bg-[length:100%_100%]"
          style={{ backgroundImage: `url(${image})`, backgroundPosition: "center center" }}
        />
      )}
      {hoverable && fullBackground && image && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-accent/55 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        />
      )}
      {recommended && <RecommendedBadge className={recommendedClasses} />}
      {imageSide === "left" && slot}
      <div className={`relative flex min-w-0 flex-1 flex-col items-start ${imageContain ? "max-w-[76%] pr-0" : priceCentered ? "pr-0" : "pr-5"} ${absEditor ? (recommended && imageSide === "right" ? "pt-[10px] pb-[44px]" : "pt-1 pb-[44px]") : recommended && imageSide === "right" ? "pb-1 pt-[10px]" : "py-1"}`}>
        <div className="flex items-start gap-2 text-sm font-extrabold leading-tight">{Icon && <Icon className="size-4 shrink-0 text-primary" />}<span className={titleNowrap ? "whitespace-nowrap" : "whitespace-pre-line"}>{title}</span></div>
        <p className={`${matchBadgePadding ? "mt-[14px]" : "mt-2"} text-xs font-normal leading-5 text-muted-foreground`}>{text}</p>
        {textInput ? (
          fullBackground ? (
            <div className="mt-auto flex w-full flex-col items-start">
              {textInputPrice}
              {!absEditor && textInputTrigger}
              {!absEditor && textInputChip}
            </div>
          ) : (
            <div className="mt-auto flex w-full flex-col">
              <div className="flex w-[153px] flex-col items-start">
                {textInputPrice}
                {textInputTrigger}
              </div>
              {textInputEditor}
              {textInputChip}
            </div>
          )
        ) : (
          <span className={`mt-auto pt-3 text-xs font-bold ${priceViolet ? "text-primary" : ""} ${priceCentered ? "w-full text-left" : ""}`}>{(priceLabel ?? (price ? `+ ${price} zł` : "Cena podstawowa")).split("\n").map((line, index) => (
            <span key={index} className={`block whitespace-nowrap ${line.startsWith("(") ? "tracking-[-0.04em]" : line.length > 18 ? "tracking-[-0.022em]" : ""}`}>{line}</span>
          ))}</span>
        )}
        {counter !== undefined && onIncrement !== undefined && onDecrement !== undefined && (
          <span className="mt-3 inline-flex h-7 items-center overflow-hidden rounded border border-border bg-card">
            <button
              type="button"
              aria-label={`Zmniejsz liczbę: ${title}`}
              disabled={counter <= (minCount ?? 1)}
              onClick={(event) => { event.stopPropagation(); onDecrement(); }}
              className="grid h-full w-8 place-items-center text-primary transition-opacity disabled:opacity-40"
            >
              <Minus className="size-3" />
            </button>
            <span className="grid h-full w-8 place-items-center border-x border-border text-xs" aria-live="polite">{counter}</span>
            <button
              type="button"
              aria-label={`Zwiększ liczbę: ${title}`}
              disabled={counter >= (maxCount ?? Infinity)}
              onClick={(event) => { event.stopPropagation(); onIncrement(); }}
              className="grid h-full w-8 place-items-center text-primary transition-opacity disabled:opacity-40"
            >
              <Plus className="size-3" />
            </button>
          </span>
        )}
      </div>
      {imageSide === "right" && slot}
      {absEditor && (
        <div className="absolute inset-x-3.5 bottom-[18px] z-10 flex flex-col">{textInputEditor}</div>
      )}
      <span className={`absolute right-3 top-3 size-4 rounded-full border ${selected ? "border-primary bg-primary ring-2 ring-card" : "border-border bg-card"}`} />
    </div>
  );
}

function CompactChoice({ selected, stepActive, hoverable, onClick, title, text, price, priceCentered, textNowrap, textRaised, image, imageFull, imageSide, recommended, recommendedTone }: {
  selected: boolean; stepActive: boolean; hoverable?: boolean; onClick: () => void; title: string; text: string; price: number; priceCentered?: boolean; textNowrap?: boolean; textRaised?: boolean | undefined; image?: string | undefined; imageFull?: boolean | undefined; imageSide: ImageSide; recommended?: boolean; recommendedTone?: "light-gray" | "dark-gray" | "purple" | undefined;
}) {
  const recommendedClasses =
    recommendedTone === "light-gray" ? "bg-muted/60 text-muted-foreground/70" :
    recommendedTone === "dark-gray" ? "bg-muted-foreground/45 text-card" :
    recommendedTone === "purple" ? "bg-primary text-primary-foreground" :
    selected ? "bg-primary text-primary-foreground" :
    "bg-muted-foreground/30 text-muted-foreground";
  const fullBackground = imageFull && image;
  const slot = fullBackground ? <span aria-hidden="true" className="block shrink-0 w-[32%]" /> : <ImageSlot image={image} side={imageSide} className="h-full w-[32%]" />;
  return (
    <Button type="button" variant="outline" onClick={onClick} className={`group relative h-[100px] w-full flex-row items-stretch justify-start gap-3 overflow-hidden whitespace-normal rounded-md p-2.5 text-left shadow-none transition-colors ${hoverable ? "hover:border-primary/40 hover:bg-accent hover:text-accent-foreground" : "hover:bg-transparent hover:text-inherit"} ${selected ? "border-primary bg-card ring-1 ring-primary" : stepActive ? "border-border bg-card" : "border-border/60 bg-muted/50 text-muted-foreground"}`}>
      {fullBackground && image && (
        <span
          aria-hidden="true"
          className="absolute inset-0 z-0 bg-no-repeat bg-[length:100%_100%]"
          style={{ backgroundImage: `url(${image})`, backgroundPosition: "center center" }}
        />
      )}
      {hoverable && fullBackground && image && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-accent/55 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        />
      )}
      {recommended && <RecommendedBadge className={recommendedClasses} />}
      {imageSide === "left" && slot}
      <div className={`relative flex min-w-0 flex-1 flex-col justify-start pt-1.5 ${textNowrap ? "pr-1 pl-[6px]" : priceCentered ? "pr-[18px]" : "pr-4"} ${fullBackground && !textNowrap ? "pl-[14px]" : ""} ${recommended && imageSide === "right" ? "pb-1 pt-[10px]" : "pb-1"}`}>
        <strong className="block text-xs">{title}</strong>
        <span className={`block pt-0.5 text-[11px] ${textRaised ? "mt-1" : "mt-auto"} ${price > 0 ? "text-muted-foreground" : "text-primary"} ${textNowrap ? "whitespace-nowrap" : ""}`}>{text}</span>
        {price > 0 && <span className={`block text-[11px] font-bold text-primary ${textRaised ? "mt-auto" : "mt-1"} ${priceCentered ? "w-full text-left" : ""}`}>{priceCentered && title === "Personalizowana" ? "+ 40 zł" : `+ ${price} zł`}</span>}
      </div>
      {imageSide === "right" && slot}
      <span className={`absolute right-3 top-3 size-4 rounded-full border ${selected ? "border-primary bg-primary ring-2 ring-card" : "border-border bg-card"}`} />
    </Button>
  );
}

function HelpRail() {
  const [open, setOpen] = useState(false);
  const faqs: { icon: IconType; question: string }[] = [
    { icon: PawPrint, question: "Czy mogę zamówić samą figurkę psa?" },
    { icon: ImageIcon, question: "Ile zdjęć potrzebujecie?" },
    { icon: UsersRound, question: "Czy mogę zamówić więcej niż jedną figurkę?" },
    { icon: Plus, question: "Czy mogę dodać coś, czego nie ma w konfiguratorze?" },
  ];
  const linkClass = "inline-flex items-center gap-1 text-[11px] font-bold text-primary transition-colors hover:text-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const collapseClass = `grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`;
  return (
    <div className="w-full space-y-2">
      <div className="rounded-lg border border-border bg-card">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="help-rail-content"
          className="flex w-full items-center gap-2 rounded-lg p-3.5 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-secondary text-primary"><ClipboardList className="size-4" /></span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">Potrzebujesz pomocy?</span>
          <span className={`relative ml-auto inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
            {!open && (
              <>
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full border ripple-ring opacity-0 animate-[info-ping_6s_cubic-bezier(0.25,0.6,0.35,1)_infinite]" />
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full border ripple-ring opacity-0 animate-[info-ping_6s_cubic-bezier(0.25,0.6,0.35,1)_infinite]" style={{ animationDelay: "2s" }} />
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full border ripple-ring opacity-0 animate-[info-ping_6s_cubic-bezier(0.25,0.6,0.35,1)_infinite]" style={{ animationDelay: "4s" }} />
              </>
            )}
            <ChevronDown className="relative size-4" />
          </span>


        </button>
        <div id="help-rail-content" className={collapseClass}>
          <div className="overflow-hidden">
            <div className="px-3.5 pb-3.5">
              <h2 className="text-base font-extrabold leading-snug">Nie znalazłeś opcji, której szukasz?</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Możemy przygotować indywidualną wycenę i dopasować figurkę do Twoich potrzeb.</p>
              <Button type="button" variant="hero" className="mt-2.5 h-8 w-full text-xs">Napisz do nas <ArrowRight /></Button>
            </div>
          </div>
        </div>
      </div>

      <div className={collapseClass} inert={!open || undefined}>
        <div className="overflow-hidden">
          <div className="space-y-2">
      <div className="rounded-lg border border-border bg-card p-3.5">
        <h3 className="text-xs font-extrabold">Najczęściej zadawane pytania</h3>
        <div className="mt-1 divide-y divide-border/60">
          {faqs.map((item) => (
            <div key={item.question} className="flex items-center gap-2.5 py-1.5">
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-secondary text-primary"><item.icon className="size-3" /></span>
              <span className="min-w-0 flex-1 text-[11px] font-semibold leading-snug">{item.question}</span>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3.5">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-secondary text-primary"><Lightbulb className="size-4" /></span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">Masz własny pomysł?</span>
        </div>
        <h3 className="mt-2 text-sm font-extrabold leading-snug">Potrzebujesz czegoś niestandardowego?</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Figurka dla całej rodziny? Samego pupila? Kilka osób? Nietypowa podstawa?</p>
        <Button type="button" variant="outline" className="mt-2.5 h-8 w-full text-xs shadow-none">Opisz swój pomysł! <ArrowRight /></Button>
      </div>

      <div className="rounded-lg border border-border bg-card p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-secondary text-primary"><UploadCloud className="size-4" /></span>
          <span className="flex-1 text-[10px] font-extrabold uppercase tracking-wider text-primary">Jakie zdjęcia wysłać?</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </div>
        <h3 className="mt-2 text-sm font-extrabold leading-snug">Jakie zdjęcia będą najlepsze?</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Wybierz zdjęcia, na których dobrze widać twarz, sylwetkę i charakterystyczne szczegóły.</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <span className={linkClass}>Zobacz przykłady <ArrowRight className="size-3" /></span>
          <span className="flex shrink-0 -space-x-2.5" aria-hidden="true">
            <span className="image-placeholder size-9 rounded-md border-2 border-card" />
            <span className="image-placeholder size-9 rounded-md border-2 border-card" />
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3.5">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-secondary text-primary"><Gift className="size-4" /></span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">To prezent?</span>
        </div>
        <h3 className="mt-2 text-sm font-extrabold leading-snug">Szukasz pomysłu na prezent?</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Sprawdź nasze propozycje na różne okazje.</p>
        <span className={`${linkClass} mt-2`}>Zobacz inspiracje <ArrowRight className="size-3" /></span>
      </div>

      <div className="rounded-lg border border-border bg-card p-3.5">
        <span className="grid size-7 place-items-center rounded-md bg-secondary text-primary"><Clock3 className="size-4" /></span>
        <h3 className="mt-2 text-sm font-extrabold leading-snug">Jak długo trwa realizacja?</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Od zatwierdzenia projektu figurki przechodzimy przez kilka etapów.</p>
        <span className={`${linkClass} mt-2`}>Zobacz, jak to działa <ArrowRight className="size-3" /></span>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfferPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<string[]>(["person"]);
  const [personCount, setPersonCount] = useState(1);
  const [animalCount, setAnimalCount] = useState(0);
  const [customText, setCustomText] = useState("");
  const [customCommitted, setCustomCommitted] = useState(false);
  const [graverText, setGraverText] = useState("");
  const graverInputRef = useRef<HTMLInputElement>(null);
  const [graverCommitted, setGraverCommitted] = useState(false);
  const [graverError, setGraverError] = useState(false);
  const [customError, setCustomError] = useState(false);
  const [size, setSize] = useState<string | null>(null);
  const [finish, setFinish] = useState<string | null>(null);
  const [base, setBase] = useState<string | null>(null);
  const [pack, setPack] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosReady, setPhotosReady] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const photoCount = photos.length;
  const [color, setColor] = useState<"white" | "beige" | "other">("white");
  const [colorText, setColorText] = useState("");
  const [colorCommitted, setColorCommitted] = useState(false);
  const restoredConfig = useRef(false);
  // Delay the "no color chosen" reset so clicking another color swatch cancels it
  // instead of flashing back to white before the swatch's own click handler runs.
  const colorResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelColorReset = () => { if (colorResetTimer.current) { clearTimeout(colorResetTimer.current); colorResetTimer.current = null; } };
  const scheduleColorReset = () => { cancelColorReset(); colorResetTimer.current = setTimeout(() => { colorResetTimer.current = null; setColorText(""); setColorCommitted(false); setColor("white"); }, 120); };
  // Same delayed timer for the engraving text: blur with nothing committed keeps
  // Personalizowana selected and only flags the missing text after a short grace
  // period, so clicking Zatwierdź or another base card cancels it first.
  const graverResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelGraverReset = () => { if (graverResetTimer.current) { clearTimeout(graverResetTimer.current); graverResetTimer.current = null; } };
  const scheduleGraverReset = () => { cancelGraverReset(); graverResetTimer.current = setTimeout(() => { graverResetTimer.current = null; setGraverError(true); }, 120); };
  const colorLabel = color === "white" ? "Biały" : color === "beige" ? "Beżowy" : colorCommitted && colorText.trim() ? `Inny: ${colorText.trim()}` : "Inny";
  const finishLabel = finish === "single" ? `Figurka jednokolorowa (${colorLabel})` : undefined;

  const selected = useMemo(() => ({
    size: sizes.find((item) => item.id === size),
    finish: finishes.find((item) => item.id === finish),
    base: bases.find((item) => item.id === base),
    pack: packages.find((item) => item.id === pack),
  }), [size, finish, base, pack]);

  const activeSteps: [boolean, boolean, boolean, boolean, boolean, boolean] = [subjects.length > 0, Boolean(size), Boolean(finish), Boolean(base), Boolean(pack), photoCount > 0];
  // A step lights up only once the previous one has been answered; until then it stays dimmed and unclickable.
  const readySteps: [boolean, boolean, boolean, boolean, boolean, boolean] = [true, subjects.length > 0, Boolean(size), Boolean(finish), Boolean(base), Boolean(pack)];

  const extraSubjectPrice = EXTRA_SUBJECT_PRICE;
  const peoplePrice = BASE_PERSON_PRICE + extraSubjectPrice * (personCount - 1);
  const animalPrice = extraSubjectPrice * animalCount;
  const subjectPrice =
    (subjects.includes("person") ? peoplePrice : 0)
    + (subjects.includes("animal") ? animalPrice : 0)
    + (subjects.includes("custom") ? 40 : 0);
  // Liczba postaci/zwierząt na figurce — mnożnik dopłaty za rozmiar.
  const subjectCount = (subjects.includes("person") ? personCount : 0) + (subjects.includes("animal") ? animalCount : 0) || 1;
  const sizeUnitPrice = selected.size?.price ?? 0;
  const sizePrice = sizeUnitPrice * subjectCount;
  const total = subjectPrice
    + sizePrice
    + (selected.finish?.price ?? 0)
    + (selected.base?.price ?? 0)
    + (selected.pack?.price ?? 0);

  const subjectItems: { key: string; label: string; onRemove?: () => void }[] = [
    subjects.includes("person") ? { key: "person", label: `${personCount} ${personCount === 1 ? "osoba" : personCount < 5 ? "osoby" : "osób"}` } : null,
    subjects.includes("animal") && animalCount > 0
      ? { key: "animal", label: `${animalCount} ${animalCount === 1 ? "zwierzę" : "zwierzęta"}`, onRemove: () => { setAnimalCount(0); setSubjects((current) => current.filter((id) => id !== "animal")); } }
      : null,
    subjects.includes("custom") ? { key: "custom", label: customCommitted && customText.trim() ? customText.trim() : "Własny element", onRemove: () => { setCustomText(""); setCustomCommitted(false); setCustomError(false); setSubjects((current) => current.filter((id) => id !== "custom")); } } : null,
  ].filter(Boolean) as { key: string; label: string; onRemove?: () => void }[];

  // Only the deepest completed step can be cleared, so the step sequence stays intact.
  const lastFilledStep = pack ? 4 : base ? 3 : finish ? 2 : size ? 1 : 0;

  // Hover stays available on the current choice and the next unlocked step, but not on earlier steps.
  const isHoverStep = (index: number) => readySteps[index] === true;

  // Clearing a step also resets all later choices so the configuration stays consistent.
  const clearSize = () => { setSize(null); setFinish(null); setBase(null); setPack(null); };
  const clearFinish = () => { setFinish(null); setBase(null); setPack(null); };
  // Removing the base choice leaves the step empty (no fallback to Standardowa) and
  // deletes the engraving text, so re-selecting Personalizowana starts from a clean field.
  const clearBase = () => { cancelGraverReset(); setGraverError(false); setBase(null); setPack(null); };
  const clearPack = () => { setPack(null); };

  const hasSelection = Boolean(size || finish || base || pack) || personCount > 1 || animalCount > 0 || subjects.includes("custom") || photoCount > 0;
  const clearAll = () => {
    setSubjects(["person"]);
    setPersonCount(1);
    setAnimalCount(0);
    setCustomText("");
    setCustomCommitted(false);
    setCustomError(false);
    setSize(null);
    setFinish(null);
    setBase(null);
    setPack(null);
    setGraverText("");
    setGraverCommitted(false);
    cancelGraverReset();
    void updatePhotos([]);
    window.sessionStorage.removeItem(CONFIG_STORAGE_KEY);
    setColor("white");
    setColorText("");
    setColorCommitted(false);
  };

  async function updatePhotos(next: File[], warning = "") {
    setPhotoBusy(true);
    try {
      await saveOrderPhotos(next);
      setPhotos(next);
      setPhotoError(warning);
    } catch {
      setPhotoError("Nie udało się zapisać zdjęć w przeglądarce. Spróbuj ponownie.");
    } finally { setPhotoBusy(false); }
  }

  function addPhotos(selected: File[]) {
    if (!photosReady || photoBusy || selected.length === 0) return;
    const valid = selected.filter((file) => ["image/jpeg", "image/png"].includes(file.type) && file.size <= 10 * 1024 * 1024);
    const warning = valid.length !== selected.length ? "Możesz dodać tylko zdjęcia JPG lub PNG o wielkości do 10 MB każde." : "";
    if (valid.length) void updatePhotos([...photos, ...valid], warning);
    else if (warning) setPhotoError(warning);
  }




  useEffect(() => {
    if (!restoredConfig.current) {
      restoredConfig.current = true;
      const stored = readFigurineConfig();
      if (stored) {
        setSubjects(stored.subjects); setPersonCount(Math.min(MAX_SUBJECTS, stored.personCount)); setAnimalCount(Math.min(MAX_SUBJECTS, stored.animalCount));
        setCustomText(stored.customText); setCustomCommitted(stored.customCommitted); setSize(stored.size);
        setFinish(stored.finish); setBase(stored.base); setPack(stored.pack);
        setColor(stored.color); setColorText(stored.colorText); setColorCommitted(stored.colorCommitted);
        setGraverText(stored.graverText); setGraverCommitted(stored.graverCommitted);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    readOrderPhotos().then((files) => { if (mounted) setPhotos(files); }).catch(() => { if (mounted) setPhotoError("Nie udało się odczytać zdjęć. Dodaj je ponownie."); }).finally(() => { if (mounted) setPhotosReady(true); });
    return () => { mounted = false; };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader active="offer" />
      <section id="konfigurator" className="section-shell-xwide py-7 lg:py-9">
        <p className="text-xs font-extrabold uppercase tracking-wide text-primary">Konfigurator</p>
        <h1 className="mt-2 text-[2rem] font-extrabold leading-tight lg:text-[2.7rem]">Stwórz swoją figurkę 3D</h1>
        <p className="mt-3 text-sm text-muted-foreground">Wybierz parametry swojej personalizowanej figurki. Każdy detal ma znaczenie.</p>

        <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(380px,1fr)] 2xl:grid-cols-[300px_minmax(0,1.55fr)_minmax(380px,1fr)]">
          <div className="hidden 2xl:block 2xl:self-stretch">
            <div className="sticky top-[113px] flex max-h-[calc(100vh-160px)] flex-col overflow-y-auto justify-start">
              <HelpRail />
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <section className="p-5">
              <StepHeading number={1} title="Kogo ma przedstawiać figurka?" subtitle="Wybierz, kto znajdzie się na figurce." active={activeSteps[0]} />
              <div className="grid gap-3.5 md:grid-cols-3">
                {subjectOptions.map((item) => (
                  <ChoiceCard
                    key={item.id}
                    {...item}
                    priceLabel={
                      item.id === "person"
                        ? `${BASE_PERSON_PRICE} zł za 1. osobę\nkażda kolejna + ${extraSubjectPrice} zł`
                        : item.id === "animal"
                          ? `+${extraSubjectPrice} zł za zwierzę`
                          : item.priceLabel
                    }
                    priceViolet={item.id === "person" || item.id === "animal" || item.id === "custom"}
                    stepActive={activeSteps[0]}
                    hoverable={item.id !== "person" && !subjects.includes(item.id) && isHoverStep(0)}
                    selected={item.id === "animal" ? subjects.includes("animal") && animalCount > 0 : subjects.includes(item.id)}
                    locked={item.id === "person"}
                    imageFull={item.id === "person" || item.id === "animal" || item.id === "custom"}
                    imageContain={item.id === "custom"}
                    titleNowrap={item.id === "custom"}
                    matchBadgePadding={item.id === "animal" || item.id === "custom"}
                    counter={item.id === "person" ? personCount : item.id === "animal" ? animalCount : undefined}
                    textInput={item.id === "custom" ? {
                      value: customText,
                      placeholder: "Wpisz element",
                      onChange: (value) => { setCustomText(value); if (customError) setCustomError(false); },
                      committed: customCommitted,
                      error: customError,
                      onEmpty: () => setCustomError(true),
                      onCommit: () => { if (customText.trim()) { setCustomCommitted(true); setSubjects((current) => current.includes("custom") ? current : [...current, "custom"]); } },
                      onEdit: () => setCustomCommitted(false),
                      onCancel: () => { setCustomText(""); setCustomCommitted(false); setSubjects((current) => current.filter((id) => id !== "custom")); },
                      onClear: () => { setCustomText(""); setCustomCommitted(false); },
                      buttonLabel: "Dodaj własny element",
                    } : undefined}
                    minCount={item.id === "animal" ? 0 : undefined}
                    maxCount={item.id === "person" || item.id === "animal" ? MAX_SUBJECTS : undefined}
                    onIncrement={
                      item.id === "person"
                        ? () => { setPersonCount((current) => Math.min(MAX_SUBJECTS, current + 1)); setSubjects((current) => current.includes("person") ? current : [...current, "person"]); }
                        : item.id === "animal"
                          ? () => { setAnimalCount((current) => Math.min(MAX_SUBJECTS, current + 1)); setSubjects((current) => current.includes("animal") ? current : [...current, "animal"]); }
                          : undefined
                    }
                    onDecrement={
                      item.id === "person"
                        ? () => setPersonCount((current) => Math.max(1, current - 1))
                        : item.id === "animal"
                          ? () => {
                              if (animalCount <= 1) {
                                setAnimalCount(0);
                                setSubjects((current) => current.filter((id) => id !== "animal"));
                              } else {
                                setAnimalCount((current) => current - 1);
                              }
                            }
                          : undefined
                    }
                    onClick={() => setSubjects((current) => {
                      if (item.id === "person") return current.includes("person") ? current : [...current, "person"];
                      if (item.id === "animal") {
                        if (animalCount === 0) { setAnimalCount(1); return current.includes("animal") ? current : [...current, "animal"]; }
                        if (current.includes("animal")) { setAnimalCount(0); return current.filter((id) => id !== "animal"); }
                        return [...current, "animal"];
                      }
                      if (item.id === "custom") {
                        // Deselecting the card keeps the typed description, so re-adding
                        // it restores what the user already wrote; the X button clears it.
                        if (current.includes("custom")) { setCustomError(false); return current.filter((id) => id !== "custom"); }
                        if (customText.trim()) setCustomCommitted(true);
                        return [...current, "custom"];
                      }
                      return current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id];
                    })}
                  />
                ))}
              </div>
              {customError && subjects.includes("custom") && <p role="alert" className="mt-2 text-xs text-destructive">Uzupełnij opis własnego elementu.</p>}
            </section>

            <section className={`border-t border-border p-5 transition-all duration-300 ${readySteps[1] ? "bg-card" : "bg-muted/40 opacity-60 saturate-50 pointer-events-none select-none"}`}>
              <StepHeading number={2} title="Rozmiar figurki" subtitle="Wybierz wysokość całej figurki (z podstawką)." active={activeSteps[1] && readySteps[1]} />
              <div className="grid gap-3.5 sm:grid-cols-3">
                {(() => {
                  // Same mechanic as the recommended badges in steps 3–5: gray before
                  // the step is reachable, dark while filling it, violet once any
                  // option in the step is chosen (not only the recommended card).
                  const sizeRecommendedTone = lastFilledStep >= 1 ? "purple" : subjects.length === 0 ? "light-gray" : "dark-gray";
                  return sizes.map((item) => (
                  <ChoiceCard
                    key={item.id}
                    {...item}
                    tightGap
                    imageClassName="w-[30%]"
                    priceLabel={
                      item.price === 0
                        ? "Cena podstawowa"
                        : `+ ${item.price * subjectCount} zł\n(${item.price} zł za osobę/\u200bzwierzę)`
                    }
                    stepActive={activeSteps[1] && readySteps[1]}
                    priceViolet
                    hoverable={size !== item.id && isHoverStep(1)}
                    selected={size === item.id}
                    recommendedTone={item.id === "20" ? sizeRecommendedTone : undefined}
                    onClick={() => size === item.id ? (lastFilledStep === 1 ? clearSize() : undefined) : setSize(item.id)}
                  />
                ));
                })()}
              </div>
            </section>

            <section className={`border-t border-border p-5 transition-all duration-300 ${readySteps[2] ? "bg-card" : "bg-muted/40 opacity-60 saturate-50 pointer-events-none select-none"}`}>
              <StepHeading number={3} title="Wykończenie" subtitle="Wybierz sposób wykończenia swojej figurki." active={activeSteps[2] && readySteps[2]} />
              {(() => {
                const finishRecommendedTone = lastFilledStep === 0 ? "light-gray" : lastFilledStep === 1 ? "dark-gray" : "purple";
                return (
                <>
              <div className="grid gap-3.5 sm:grid-cols-2">
                {finishes.map((item) => {
                  return (
                    <ChoiceCard
                      key={item.id}
                      {...item}
                      stepActive={activeSteps[2] && readySteps[2]}
                      priceViolet
                      hoverable={finish !== item.id && isHoverStep(2)}
                      selected={finish === item.id}
                      recommendedTone={item.id === "painted" ? finishRecommendedTone : undefined}
                      priceCentered={item.id === "painted"}
                      onClick={() => finish === item.id ? (lastFilledStep === 2 ? clearFinish() : undefined) : setFinish(item.id)}
                    />
                  );
                })}
              </div>
              <div className={`grid transition-all duration-300 ease-out ${finish === "single" ? "mt-3.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="text-sm font-bold">Wybierz kolor figurki</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">Wybierz jeden z dostępnych kolorów.</p>
                    <div className="mt-3 grid grid-cols-3 gap-2.5">
                      {([
                        { id: "white", label: "Biały", swatch: "bg-card" },
                        { id: "beige", label: "Beżowy", swatch: "bg-[oklch(0.86_0.05_75)]" },
                        { id: "other", label: "Inny kolor", swatch: "bg-muted" },
                      ] as const).map((c) => {
                        const on = color === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            tabIndex={finish === "single" ? 0 : -1}
                            onClick={() => {
                              cancelColorReset();
                              if (c.id === "other") {
                                setColor("other");
                                setColorCommitted(false);
                              } else {
                                setColor(c.id);
                                setColorCommitted(false);
                                setColorText("");
                              }
                            }}
                            className={`relative flex min-h-[136px] flex-col items-center justify-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${on ? "border-primary bg-brand-soft" : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"}`}
                          >
                            {c.id === "white" && (
                              <RecommendedBadge className={
                                finishRecommendedTone === "light-gray" ? "bg-muted/60 text-muted-foreground/70" :
                                finishRecommendedTone === "dark-gray" ? "bg-muted-foreground/45 text-card" :
                                "bg-primary text-primary-foreground"
                              } />
                            )}
                            <span className={`flex size-9 items-center justify-center rounded-full border border-border ${c.swatch}`}>
                              {c.id === "other" && <Palette className="size-4 text-muted-foreground" />}
                            </span>
                            {c.label}
                            {on && <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-3" /></span>}
                          </button>
                        );
                      })}
                    </div>
                    {color === "other" && !colorCommitted && (
                      <div className="mt-3 flex gap-2">
                        <input
                          autoFocus
                          value={colorText}
                          onChange={(e) => { setColorText(e.target.value); setColorCommitted(false); }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && colorText.trim()) { cancelColorReset(); setColorCommitted(true); }
                            else if (e.key === "Escape") { cancelColorReset(); setColorText(""); setColor("white"); }
                          }}
                          onBlur={() => scheduleColorReset()}
                          placeholder="Wpisz kolor, np. granatowy"
                          className="h-9 min-w-0 flex-1 rounded-md border border-input bg-card px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <Button type="button" size="sm" disabled={!colorText.trim()} onMouseDown={(e) => e.preventDefault()} onClick={() => { if (colorText.trim()) setColorCommitted(true); }}>
                          Zatwierdź
                        </Button>
                      </div>
                    )}
                    {color === "other" && colorCommitted && (
                      <button
                        type="button"
                        onClick={() => setColorCommitted(false)}
                        aria-label="Edytuj kolor"
                        className="mt-3 flex h-9 w-full items-center justify-between gap-1.5 rounded-md border border-primary/40 bg-primary/5 px-3 text-xs font-semibold text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="truncate text-left">{colorText}</span>
                        <Check className="size-3.5 shrink-0 text-primary" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
                </>
                );
              })()}
            </section>

            <section className={`border-t border-border p-5 transition-all duration-300 ${readySteps[3] ? "bg-card" : "bg-muted/40 opacity-60 saturate-50 pointer-events-none select-none"}`}>
              <StepHeading number={4} title="Podstawka" subtitle="Wybierz rodzaj podstawki." active={activeSteps[3] && readySteps[3]} />
              <div className="grid gap-3.5 sm:grid-cols-3">
                {bases.map((item) => {
                  const baseRecommendedTone = lastFilledStep < 2 ? "light-gray" : lastFilledStep === 2 ? "dark-gray" : "purple";
                  return (
                    <CompactChoice
                      key={item.id}
                      {...item}
                      stepActive={activeSteps[3] && readySteps[3]}
                      hoverable={base !== item.id && isHoverStep(3)}
                      selected={base === item.id}
                      recommendedTone={item.id === "standard" ? baseRecommendedTone : undefined}
                      onClick={() => {
                        if (base !== item.id) { cancelGraverReset(); setGraverError(false); setBase(item.id); return; }
                        if (lastFilledStep !== 3) return;
                        clearBase();
                      }}
                    />
                  );
                })}
              </div>
              {base === "personalized" && (
                <div className="mt-3.5 rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-bold">Treść graweru</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Wpisz imię, datę lub napis, który umieścimy na podstawce.</p>
                  {!graverCommitted ? (
                    <>
                    <div className="mt-3 flex gap-2">
                      <div className="relative min-w-0 flex-1">
                        <input
                          ref={graverInputRef}
                          autoFocus
                          value={graverText}
                          onChange={(e) => { setGraverText(e.target.value); setGraverCommitted(false); setGraverError(false); }}
                          onFocus={() => { cancelGraverReset(); setGraverError(false); }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && graverText.trim()) { cancelGraverReset(); setGraverError(false); setGraverCommitted(true); }
                            else if (e.key === "Escape") { cancelGraverReset(); setGraverError(false); setGraverText(""); setGraverCommitted(false); setBase("standard"); }
                          }}
                          onBlur={() => {
                            if (graverCommitted) return;
                            // Clicking away with a real engraving text keeps it; an empty field
                            // stays on Personalizowana and only reports the missing text.
                            if (graverText.trim()) { setGraverCommitted(true); return; }
                            scheduleGraverReset();
                          }}
                          placeholder="Wpisz grawer, np. Na urodziny"
                          className={`h-9 w-full rounded-md border pl-3 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${graverText.trim() ? "border-primary bg-primary/10 text-primary font-medium" : graverError ? "border-destructive bg-card" : "border-input bg-card"} ${graverText.length > 0 ? "pr-8" : "pr-3"}`}
                        />
                        {graverText.length > 0 && (
                          <button
                            type="button"
                            aria-label="Wyczyść grawer"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { cancelGraverReset(); setGraverText(""); setGraverCommitted(false); setGraverError(false); graverInputRef.current?.focus(); }}
                            className="absolute right-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>
                      <Button type="button" size="sm" disabled={!graverText.trim()} onMouseDown={(e) => e.preventDefault()} onClick={() => { if (graverText.trim()) { setGraverError(false); setGraverCommitted(true); } }}>
                        Zatwierdź
                      </Button>
                    </div>
                    {graverError && <p role="alert" className="mt-2 text-xs text-destructive">Uzupełnij treść graweru.</p>}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setGraverCommitted(false)}
                      aria-label="Edytuj grawer"
                      className="mt-3 flex h-9 w-full items-center justify-between gap-1.5 rounded-md border border-primary/40 bg-primary/5 px-3 text-xs font-semibold text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="truncate text-left">{graverText}</span>
                      <Check className="size-3.5 shrink-0 text-primary" />
                    </button>
                  )}
                </div>
              )}
            </section>

            <section className={`border-t border-border p-5 transition-all duration-300 ${readySteps[4] ? "bg-card" : "bg-muted/40 opacity-60 saturate-50 pointer-events-none select-none"}`}>
              <StepHeading number={5} title="Opakowanie" subtitle="Wybierz sposób zapakowania figurki." active={activeSteps[4] && readySteps[4]} />
              <div className="grid gap-3.5 sm:grid-cols-2">
                {packages.map((item) => {
                  const packRecommendedTone = lastFilledStep < 3 ? "light-gray" : lastFilledStep === 3 ? "dark-gray" : "purple";
                  return (
                    <CompactChoice
                      key={item.id}
                      {...item}
                      stepActive={activeSteps[4] && readySteps[4]}
                      hoverable={pack !== item.id && isHoverStep(4)}
                      selected={pack === item.id}
                      recommendedTone={item.id === "gift" ? packRecommendedTone : undefined}
                      onClick={() => pack === item.id ? (lastFilledStep === 4 ? clearPack() : undefined) : setPack(item.id)}
                    />
                  );
                })}
              </div>
            </section>

            <section id="zdjecia" className={`border-t border-border p-5 transition-all duration-300 ${readySteps[5] ? "bg-card" : "bg-muted/40 opacity-60 saturate-50 pointer-events-none select-none"}`}>
              <StepHeading number={6} title="Zdjęcia" subtitle="Prześlij zdjęcia, na podstawie których wykonamy model 3D." active={activeSteps[5] && readySteps[5]} />
              <div className="grid gap-3.5 md:grid-cols-[1.45fr_.8fr]">
                <label onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addPhotos(Array.from(event.dataTransfer.files)); }} className={`flex min-h-[126px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-center transition-colors ${activeSteps[5] && readySteps[5] ? "border-primary/50 bg-secondary/30" : "border-border bg-muted/50"}`}>
                  <input type="file" accept="image/jpeg,image/png" multiple disabled={!photosReady || photoBusy} className="sr-only" onChange={(event) => { addPhotos(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = ""; }} />
                  <UploadCloud className="size-7 text-primary" />
                  <span className="mt-2 text-xs font-semibold">Przeciągnij i upuść zdjęcia lub <span className="text-primary">wybierz pliki</span></span>
                  <span className="mt-1 text-[11px] text-muted-foreground">JPG, PNG (maks. 10 MB)</span>
                </label>
                <div className="rounded-md bg-muted/60 p-4">
                  <p className="flex items-center gap-2 text-xs font-bold"><Sparkles className="size-4 text-primary" /> Wskazówki:</p>
                  <ul className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
                    {["Zdjęcia z różnych stron", "Dobre oświetlenie", "Bez filtrów i efektów"].map((tip) => <li key={tip} className="flex items-center gap-2"><Check className="size-3 text-primary" />{tip}</li>)}
                  </ul>
                  <a href="#zdjecia" className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">Zobacz przykłady zdjęć <ArrowRight className="size-3" /></a>
                </div>
              </div>
              {photoError && <p role="alert" className="mt-2 text-xs text-destructive">{photoError}</p>}
              {photos.length > 0 && <div className="pointer-events-auto mt-3"><p className="mb-2 text-xs font-semibold">Dodane zdjęcia ({photoCount})</p><OrderPhotoGallery files={photos} onRemove={(index) => { if (!photoBusy) void updatePhotos(photos.filter((_, current) => current !== index)); }} /></div>}
            </section>
          </div>

          <aside className="rounded-md border border-border bg-card p-5 xl:sticky xl:top-[113px] xl:max-h-[calc(100vh-129px)] xl:overflow-y-auto">
            <div className="relative aspect-[1.1157] overflow-hidden rounded-t-md border border-border border-b-0 bg-muted" aria-label="Podgląd figurki">
              <img
                src={podgladFigurki.url}
                alt="Przykładowa figurka 3D"
                className="size-full object-cover"
              />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-muted/40 px-3 py-[3px] backdrop-blur-sm">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Wizualizacja przykładowa
                </span>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase text-primary">Poglądowy</span>
              </div>
            </div>
            <div className="group/info relative -mt-px flex items-center justify-center gap-2 rounded-b-md border border-border border-t-0 bg-muted/40 px-3 py-[5px] backdrop-blur-sm">
              <span
                className="relative -my-[1px] inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover/info:border-primary/40 group-hover/info:bg-primary/5 group-hover/info:text-primary"
              >
                <span className="pointer-events-none absolute inset-0 rounded-full border ripple-ring opacity-0 animate-[info-ping_6s_cubic-bezier(0.25,0.6,0.35,1)_infinite]" />
                <span className="pointer-events-none absolute inset-0 rounded-full border ripple-ring opacity-0 animate-[info-ping_6s_cubic-bezier(0.25,0.6,0.35,1)_infinite]" style={{ animationDelay: "2s" }} />
                <span className="pointer-events-none absolute inset-0 rounded-full border ripple-ring opacity-0 animate-[info-ping_6s_cubic-bezier(0.25,0.6,0.35,1)_infinite]" style={{ animationDelay: "4s" }} />
                <Info className="relative size-3.5" />
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-[260px] rounded-md border border-border bg-card px-3 py-2 text-xs leading-relaxed text-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover/info:opacity-100 group-focus-within/info:opacity-100"
                >
                  Twoja figurka zostanie zaprojektowana na podstawie przesłanych zdjęć. Jej wygląd, szczegóły i proporcje będą indywidualne.
                </span>
              </span>
              <p className="text-[11px] font-semibold uppercase leading-[16px] tracking-wider text-muted-foreground">To wizualizacja poglądowa</p>
            </div>


            <div id="podsumowanie" className="mt-4 overflow-hidden rounded-md border border-border">
              <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
                <h2 className="text-sm font-extrabold">Podsumowanie konfiguracji</h2>
                {hasSelection && (
                  <button
                    type="button"
                    onClick={clearAll}
                    aria-label="Wyczyść wszystkie wybrane opcje"
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-primary transition-colors hover:text-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Wyczyść wszystko
                    <X className="size-3" />
                  </button>
                )}
              </div>
              <SummaryRow icon={UsersRound} label="Liczba osób / zwierząt" items={subjectItems} removable={lastFilledStep === 0} price={subjectPrice > 0 ? subjectPrice : undefined} />
              <SummaryRow icon={Clock3} label="Rozmiar" value={selected.size?.title} price={selected.size ? sizePrice : undefined} removable={lastFilledStep === 1} onRemove={clearSize} />
              <SummaryRow icon={Palette} label="Wykończenie" value={finishLabel ?? selected.finish?.title} price={selected.finish?.price} removable={lastFilledStep === 2} onRemove={clearFinish} />
              <SummaryRow icon={CircleCheck} label="Podstawka" value={base === "personalized" && graverText.trim() ? `Personalizowana — ${graverText.trim()}` : selected.base?.title} price={selected.base?.price} removable={lastFilledStep === 3} onRemove={clearBase} />
              <SummaryRow icon={Gift} label="Dodatki" value={selected.pack?.title} price={selected.pack?.price} removable={lastFilledStep === 4} onRemove={clearPack} />
              <div className="mt-1 flex items-end justify-between bg-secondary/70 px-4 py-4">
                <div><strong className="text-sm">Łączna cena</strong><p className="mt-1 text-[10px] text-muted-foreground">Cena może ulec zmianie po weryfikacji zdjęć.</p></div>
                <strong className="text-[2rem] font-extrabold text-primary">{total} zł</strong>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary"><Package className="size-4" /> Darmowa wysyłka od 299 zł</p>
            <Button
              type="button"
              disabled={!photosReady || photoBusy || !activeSteps.every(Boolean) || (base === "personalized" && !graverText.trim()) || (subjects.includes("custom") && !customText.trim())}
              className="mt-3 h-12 w-full text-sm"
              onClick={() => {
                saveFigurineConfig({ subjects, personCount, animalCount, customText, customCommitted, size, finish, base, pack, photoCount, color, colorText, colorCommitted, graverText, graverCommitted: graverCommitted || !!graverText.trim() });
                void navigate({ to: "/zamowienie" });
              }}
            >Przejdź dalej <ArrowRight /></Button>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function SummaryRow({ icon: Icon, label, value, price, items, removable, onRemove }: {
  icon: IconType;
  label: string;
  value?: string | undefined;
  price?: number | undefined;
  items?: { key: string; label: string; onRemove?: (() => void) | undefined }[] | undefined;
  removable?: boolean;
  onRemove?: (() => void) | undefined;
}) {
  const chipClass = "inline-flex items-center gap-1 rounded-full border border-primary/40 bg-secondary/60 px-2 py-0.5 font-bold text-foreground transition-colors hover:border-primary hover:bg-secondary";
  return (
    <div className="flex min-h-11 items-center gap-2 border-t border-border/70 px-4 text-[11px]">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="w-32 shrink-0 whitespace-nowrap text-muted-foreground">{label}</span>
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-0.5 leading-snug">
        {items ? (
          <>
            {items.length === 0 && <strong className="text-muted-foreground">Nie wybrano</strong>}
            {items.map((item) => (
              removable && item.onRemove ? (
                <button key={item.key} type="button" onClick={item.onRemove} aria-label={`Usuń: ${item.label}`} className={`${chipClass} max-w-full min-w-0 cursor-pointer`}>
                  <span className="min-w-0 truncate">{item.label}</span><X className="size-3 shrink-0" />
                </button>
              ) : (
                <strong key={item.key} className="max-w-full min-w-0 truncate">{item.label}</strong>
              )
            ))}
          </>
        ) : removable && value && onRemove ? (
          <button type="button" onClick={onRemove} aria-label={`Usuń: ${value}`} className={`${chipClass} max-w-full min-w-0 cursor-pointer`}>
            <span className="min-w-0 truncate">{value}</span><X className="size-3 shrink-0" />
          </button>
        ) : (
          <strong className={`min-w-0 truncate ${value ? "" : "text-muted-foreground"}`}>{value ?? "Nie wybrano"}</strong>
        )}
      </span>
      <span className={`shrink-0 whitespace-nowrap ${price !== undefined && price > 0 ? "font-bold text-primary" : "text-muted-foreground"}`}>{price === undefined ? "—" : price > 0 ? `+ ${price} zł` : "Cena podstawowa"}</span>
    </div>
  );
}
