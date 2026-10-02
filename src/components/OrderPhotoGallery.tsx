import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const MAX_GRID_TILES = 4;

export function OrderPhotoGallery({ files, onRemove, compact = false }: { files: File[]; onRemove?: (index: number) => void; compact?: boolean }) {
  const [urls, setUrls] = useState<string[]>([]);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const next = files.map((file) => URL.createObjectURL(file));
    setUrls(next);
    return () => next.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  if (!files.length) return null;
  const overflow = files.length > MAX_GRID_TILES;
  const overflowCount = files.length - (MAX_GRID_TILES - 1);
  const gridFiles = overflow ? files.slice(0, MAX_GRID_TILES - 1) : files;
  const removeActive = (index: number) => {
    if (!onRemove) return;
    const remaining = files.length - 1;
    if (remaining === 0) setActive(null);
    else if (active !== null && active >= remaining) setActive(remaining - 1);
    onRemove(index);
  };
  return <>
    {compact ? <Button type="button" variant="ghost" onClick={() => setActive(0)} aria-label={`Obejrzyj dodane zdjęcia (${files.length})`} className="h-7 gap-1.5 px-1 text-xs text-primary">
      {urls[0] && <img src={urls[0]} alt="" className="size-6 rounded-sm object-cover" />}
      <span>{files.length} {files.length === 1 ? "zdjęcie" : "zdjęcia"} · Podgląd</span>
    </Button> : <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label="Dodane zdjęcia">
      {gridFiles.map((file, index) => <div key={`${file.name}-${index}`} className="relative min-w-0 overflow-hidden rounded-md border border-border bg-muted aspect-square">
        <Button type="button" variant="ghost" onClick={() => setActive(index)} title={`Powiększ ${file.name}`} aria-label={`Powiększ zdjęcie ${file.name}`} className="group relative size-full rounded-none p-0">
          {urls[index] && <img src={urls[index]} alt={file.name} className="size-full object-cover" />}
          <Eye aria-hidden="true" className="absolute bottom-1 right-1 size-4 rounded-sm bg-card/80 p-0.5 text-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
        </Button>
        {onRemove && <Button type="button" size="icon" variant="secondary" title={`Usuń ${file.name}`} aria-label={`Usuń zdjęcie ${file.name}`} onClick={() => { if (active === index) setActive(null); onRemove(index); }} className="absolute right-1 top-1 size-6 rounded-sm"><X className="size-3.5" /></Button>}
      </div>)}
      {overflow && <button type="button" onClick={() => setActive(MAX_GRID_TILES - 1)} title={`Pokaż wszystkie zdjęcia (${files.length})`} aria-label={`Pokaż pozostałe zdjęcia (${overflowCount})`} className="group relative min-w-0 overflow-hidden rounded-md border border-border bg-muted aspect-square">
        {urls[MAX_GRID_TILES - 1] && <img src={urls[MAX_GRID_TILES - 1]} alt="" className="size-full object-cover brightness-[0.35] transition-[filter] group-hover:brightness-[0.25]" />}
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-card">
          <span className="text-lg font-extrabold leading-none">+{overflowCount}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide opacity-90">Zobacz wszystkie</span>
        </span>
      </button>}
    </div>}
    <Dialog open={active !== null && !!urls[active ?? -1]} onOpenChange={(open) => { if (!open) setActive(null); }}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-4xl gap-2 rounded-md p-3 sm:p-4">
        <DialogTitle className="min-w-0 truncate pr-7 text-sm">{files[active ?? -1]?.name ?? "Podgląd zdjęcia"}</DialogTitle>
        {onRemove && <Button type="button" size="icon" variant="secondary" title={`Usuń ${files[active ?? -1]?.name ?? ""}`} aria-label={`Usuń zdjęcie ${files[active ?? -1]?.name ?? ""}`} onClick={() => removeActive(active ?? 0)} className="absolute right-8 top-3 size-7 rounded-sm"><X className="size-4" /></Button>}
        {active !== null && urls[active] && <div className="relative">
          <img src={urls[active]} alt={files[active]?.name ?? "Dodane zdjęcie"} className="mx-auto max-h-[75vh] max-w-full object-contain" />
          {files.length > 1 && <>
            <Button type="button" size="icon" variant="secondary" title="Poprzednie zdjęcie" aria-label="Poprzednie zdjęcie" onClick={() => setActive((current) => ((current ?? 0) - 1 + files.length) % files.length)} className="absolute left-2 top-1/2 size-9 -translate-y-1/2 rounded-full"><ChevronLeft className="size-5" /></Button>
            <Button type="button" size="icon" variant="secondary" title="Następne zdjęcie" aria-label="Następne zdjęcie" onClick={() => setActive((current) => ((current ?? 0) + 1) % files.length)} className="absolute right-2 top-1/2 size-9 -translate-y-1/2 rounded-full"><ChevronRight className="size-5" /></Button>
            <span className="absolute right-3 top-3 rounded-sm bg-card/80 px-1.5 py-0.5 text-[11px] font-semibold text-foreground" aria-label={`Zdjęcie ${(active ?? 0) + 1} z ${files.length}`}>{(active ?? 0) + 1} / {files.length}</span>
          </>}
        </div>}
        {files.length > 1 && <div className="flex max-w-full gap-2 overflow-x-auto py-1" aria-label="Wybierz zdjęcie">{files.map((file, index) => <Button key={`${file.name}-${index}`} type="button" variant={index === active ? "secondary" : "ghost"} size="icon" className="size-12 shrink-0 p-0" aria-label={`Pokaż ${file.name}`} onClick={() => setActive(index)}>{urls[index] && <img src={urls[index]} alt="" className="size-full rounded-sm object-cover" />}</Button>)}</div>}
      </DialogContent>
    </Dialog>
  </>;
}
