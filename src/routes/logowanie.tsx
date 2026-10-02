import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useEffect, useState } from "react";
import {
  ArrowRight, Box, ChevronDown, Download, Eye, EyeOff, Headphones, Image as ImageIcon,
  Lock, Mail, ShieldCheck, User,
} from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import figurka from "@/assets/login-figurka.png";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/logowanie")({
  head: () => ({
    meta: [
      { title: "Logowanie do konta — prezent3d.com" },
      { name: "description", content: "Zaloguj się lub załóż konto, aby śledzić zamówienia, akceptować projekty i pobierać faktury." },
      { property: "og:title", content: "Logowanie do konta — prezent3d.com" },
      { property: "og:description", content: "Twoje zamówienia figurek 3D zawsze pod ręką." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const features = [
  { icon: Box, title: "Śledź swoje zamówienia", text: <>Wiesz dokładnie, na jakim etapie<br />jest Twoja figurka lub model 3D.</> },
  { icon: ImageIcon, title: "Akceptuj i zgłaszaj zmiany", text: <>Oglądaj wizualizacje i podejmuj decyzje<br />bezpośrednio w panelu klienta.</> },
  { icon: Download, title: "Pobieraj pliki i faktury", text: <>Masz dostęp do plików 3D,<br />faktur i historii płatności.</> },
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

const inputWrap = "flex h-12 items-center gap-3 rounded-lg border border-border bg-background px-4 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15";

function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("prezent3d:remembered-email");
      if (saved) { setEmail(saved); setRemember(true); }
    } catch { /* brak dostępu do localStorage */ }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!email.trim() || password.length < 6) { setMsg({ ok: false, text: "Podaj e-mail i hasło (min. 6 znaków)." }); return; }
    setBusy(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setBusy(false);
      if (error) { setMsg({ ok: false, text: "Nieprawidłowy e-mail lub hasło." }); return; }
      try {
        if (remember) window.localStorage.setItem("prezent3d:remembered-email", email.trim());
        else window.localStorage.removeItem("prezent3d:remembered-email");
      } catch { /* brak dostępu do localStorage */ }
      navigate({ to: "/konto" });
    } else {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin + "/logowanie", data: { display_name: name.trim().slice(0, 100) } } });
      setBusy(false);
      if (error) { setMsg({ ok: false, text: error.message }); return; }
      setMsg({ ok: true, text: "Konto utworzone. Sprawdź skrzynkę e-mail, aby potwierdzić adres." });
    }
  }
  async function resetPassword() {
    if (!email.trim()) { setMsg({ ok: false, text: "Wpisz najpierw swój e-mail." }); return; }
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + "/logowanie" });
    setMsg({ ok: true, text: "Wysłaliśmy link do zmiany hasła." });
  }
  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/konto" });
    if (r?.error) setMsg({ ok: false, text: "Logowanie przez Google nie powiodło się." });
    else if (!r?.redirected) navigate({ to: "/konto" });
  }
  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 bg-background px-4 py-8 sm:px-8 lg:py-14">
      <div className="mx-auto grid max-w-[1410px] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_60px_-30px_color-mix(in_oklab,var(--primary)_25%,transparent)] lg:grid-cols-[1fr_1fr]">
        {/* Left */}
        <section className="relative flex flex-col overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 sm:p-10">
          <Link to="/" aria-label="prezent3d.com — strona główna"><img src={logoAsset.url} alt="prezent3d.com" className="h-11 w-auto" /></Link>

          <img src={figurka} alt="Figurka 3D pary z psem" width={832} height={1216}
            className="pointer-events-none absolute bottom-[120px] -right-4 hidden w-[50%] max-w-[380px] mix-blend-multiply drop-shadow-2xl md:block" />

          <div className="relative mt-16 max-w-[340px] md:max-w-[52%]">
            <h1 className="text-[30px] font-bold leading-[1.25] text-foreground lg:text-[32px]">
              Twoje zamówienia,<br /><span className="text-primary">zawsze pod ręką</span>
            </h1>
            <p className="mt-6 text-[14px] leading-6 text-muted-foreground">
              Sprawdzaj status, akceptuj projekty, pobieraj pliki i zarządzaj swoim kontem w jednym miejscu.
            </p>
            <ul className="mt-10 space-y-8">
              {features.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-card shadow-sm"><Icon className="size-5 text-primary" /></span>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">{title}</p>
                    <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-16 flex gap-6 lg:mt-auto lg:pt-16">
            <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-card shadow-sm"><Headphones className="size-6 text-primary" /></span>
            <div>
              <p className="text-[14px] font-semibold text-foreground">Potrzebujesz pomocy?</p>
              <p className="mt-1.5 text-[12px] text-muted-foreground">Skontaktuj się z nami – chętnie pomożemy.</p>
              <Link to="/kontakt" className="mt-1.5 inline-flex items-center gap-2 text-[12px] font-semibold text-primary hover:underline">Napisz do nas <ArrowRight className="size-3.5" /></Link>
            </div>
          </div>
        </section>

        {/* Right */}
        <section className="relative flex flex-col items-center px-6 pb-10 pt-20 sm:px-10">
          <button type="button" className="absolute right-8 top-8 flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground">
            Polski <ChevronDown className="size-4" />
          </button>

          <div className="w-full max-w-[460px]">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-border bg-primary/5"><User className="size-6 text-primary" /></span>
            <h2 className="mt-6 text-center text-[26px] font-bold text-foreground">
              {isLogin ? "Zaloguj się do swojego konta" : "Załóż nowe konto"}
            </h2>
            <p className="mt-3 text-center text-[15px] text-muted-foreground">
              {isLogin ? "Witaj ponownie! Cieszymy się, że wracasz." : "Dołącz do nas i zarządzaj zamówieniami w jednym miejscu."}
            </p>

            <form className="mt-9" onSubmit={submit}>
              {!isLogin && (
                <>
                  <label htmlFor="name" className="mb-3 block text-[13px] font-semibold text-foreground">Imię i nazwisko</label>
                  <div className={`${inputWrap} mb-6`}>
                    <User className="size-4 text-muted-foreground" />
                    <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="wprowadź imię i nazwisko" className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground" />
                  </div>
                </>
              )}
              <label htmlFor="email" className="mb-3 block text-[13px] font-semibold text-foreground">Adres e-mail</label>
              <div className={inputWrap}>
                <Mail className="size-4 text-muted-foreground" />
                <input id="email" required value={email} onChange={(e) => setEmail(e.target.value)} type="email" maxLength={255} placeholder="wprowadź swój e-mail" className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground" />
              </div>

              <label htmlFor="password" className="mb-3 mt-6 block text-[13px] font-semibold text-foreground">Hasło</label>
              <div className={inputWrap}>
                <Lock className="size-4 text-muted-foreground" />
                <input id="password" required value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} placeholder={isLogin ? "wprowadź swoje hasło" : "utwórz hasło"} className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground" />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Ukryj hasło" : "Pokaż hasło"} className="text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {isLogin && (
                <div className="mt-4 flex items-center justify-between gap-4">
                  <label className="flex cursor-pointer select-none items-center gap-2 text-[13px] text-muted-foreground">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-primary" />
                    Zapamiętaj mnie
                  </label>
                  <button type="button" onClick={resetPassword} className="text-[12px] font-semibold text-primary hover:underline">Nie pamiętasz hasła?</button>
                </div>
              )}

              {msg && <p role="status" className={`mt-4 text-[13px] ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>}
              <button type="submit" disabled={busy} className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-primary text-[14px] font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition hover:bg-primary-dark">
                {isLogin ? "Zaloguj się" : "Załóż konto"} <ArrowRight className="size-4" />
              </button>
            </form>

            <div className="my-7 flex items-center gap-4 text-[13px] text-muted-foreground">
              <span className="h-px flex-1 bg-border" />lub<span className="h-px flex-1 bg-border" />
            </div>

            <button type="button" onClick={google} className="flex h-12 w-full items-center justify-center gap-4 rounded-lg border border-border bg-background text-[14px] font-semibold text-foreground transition hover:bg-muted">
              <GoogleIcon /> {isLogin ? "Zaloguj się przez Google" : "Zarejestruj się przez Google"}
            </button>

            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-lg bg-muted/60 px-6 py-5 text-[13px]">
              <span className="text-foreground">{isLogin ? "Nie masz jeszcze konta?" : "Masz już konto?"}</span>
              <button type="button" onClick={() => setMode(isLogin ? "register" : "login")} className="inline-flex items-center gap-2 font-semibold text-primary hover:underline">
                {isLogin ? "Załóż konto" : "Zaloguj się"} <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 text-center">
        <p className="flex items-center justify-center gap-2 text-[14px] text-foreground"><ShieldCheck className="size-5 text-muted-foreground" /> Bezpieczne logowanie</p>
        <p className="mt-2 text-[12px] text-muted-foreground">Twoje dane są szyfrowane i chronione zgodnie z najwyższymi standardami.</p>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
