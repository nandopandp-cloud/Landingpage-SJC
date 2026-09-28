import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { nav } from "../data/content";
import { PleiLogo } from "./art";
import { Icon } from "./ui";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  // como nos frames do hero: "O que aconteceu" já aparece marcado no topo da página
  const [active, setActive] = useState<string | null>(nav[0].id);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Seção ativa: a que cruza a faixa central da tela
  useEffect(() => {
    const els = nav.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,border-color] duration-500 ${
        scrolled || open ? "border-b border-white/[0.07] bg-space-900/70 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Principal" className="mx-auto flex h-[var(--nav-h)] max-w-[1320px] items-center justify-between gap-6 px-4 sm:px-8 lg:max-w-none lg:pl-[6vw] lg:pr-[5.5vw]">
        <a href="#inicio" className="shrink-0 rounded-lg" aria-label="PLEI Exploradores, voltar ao início">
          <PleiLogo large />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                aria-current={active === n.id ? "location" : undefined}
                className={`relative whitespace-nowrap rounded-full px-3 py-2 text-[clamp(0.84rem,1.02vw,1.3rem)] transition-colors xl:px-[1.35vw] ${
                  active === n.id ? "text-white" : "text-white/85 hover:text-white"
                }`}
              >
                {n.label}
                {active === n.id && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute inset-x-3 -bottom-1 h-[2px] rounded-full bg-gradient-to-r from-transparent via-cyan to-transparent xl:inset-x-[1.35vw]"
                  />
                )}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#metodologia"
          className="hidden items-center gap-2 whitespace-nowrap rounded-full border border-white/25 bg-white/[0.03] px-[1.4vw] py-[0.75vw] text-[clamp(0.8rem,1vw,1.25rem)] font-medium text-white transition hover:border-white/40 hover:bg-white/[0.08] xl:inline-flex"
        >
          Ver metodologia
          <Icon name="arrow-right" size={14} />
        </a>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? "close" : "menu"} size={18} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 pb-5 pt-1">
              {[...nav, { id: "metodologia", label: "Metodologia" }].map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-3.5 text-base text-ink hover:bg-white/5"
                  >
                    {n.label}
                    <Icon name="chevron-right" size={16} className="text-ink-3" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
