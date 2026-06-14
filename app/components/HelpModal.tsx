"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({
  title,
  children,
}: SectionProps) {
  const [open, setOpen] =
    useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-700">
      <button
        onClick={() =>
          setOpen(!open)
        }
        className="flex w-full items-center justify-between bg-zinc-900 px-5 py-4 text-left font-black transition hover:bg-zinc-800"
      >
        <span>{title}</span>

        <span>
          {open ? "▼" : "▶"}
        </span>
      </button>

      {open && (
        <div className="bg-black/40 px-5 py-4 text-zinc-300">
          {children}
        </div>
      )}
    </div>
  );
}

export default function HelpModal({
  open,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/90 p-4">
      <div className="mx-auto my-10 w-full max-w-3xl rounded-3xl border border-yellow-500/20 bg-zinc-900 p-6 text-white shadow-2xl md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-4xl font-black text-yellow-400 tracking-[0.14em]">
            PRAVIDLA HERO DICE
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-700 px-4 py-2 font-bold transition hover:bg-zinc-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <Section title="O hře">
            Hero Dice je rodinná hra inspirovaná hrou Generál.
            <br />
            <br />
            Cílem je získat co nejvyšší skóre v sedmi kombinacích a porazit ostatní hráče.
          </Section>

          <Section title="Jak hrát">
            1. Vyber počet hráčů.
            <br />
            2. Zvol hráče do hry.
            <br />
            3. Klikni na Začít hru.
            <br />
            4. U každé kombinace zapisuj dosažené skóre.
            <br />
            5. Každou kombinaci lze zapsat pouze jednou.
            <br />
            6. Hráči se střídají po jednotlivých tazích.
            <br />
            7. Po vyplnění všech kombinací se sečtou body.
          </Section>

          <Section title="Tah hráče">
            Hod kostkami.
            <br />
            Vyhodnocení kombinace.
            <br />
            Zápis skóre.
            <br />
            Předání tahu dalšímu hráči.
          </Section>

          <Section title="Pořadí hráčů">
            Hru začíná hráč uvedený v prvním sloupci tabulky.
            <br />
            Poté pokračují ostatní hráči zleva doprava.
          </Section>

          <Section title="Konec hry">
            Hra končí ve chvíli, kdy některý z hráčů získá skóre ve všech sedmi kombinacích.
            <br />
            <br />
            Vyhrává hráč s nejvyšším celkovým skóre.
          </Section>

          <Section title="Kombinace">
            Generál
            <br />
            Pyramida
            <br />
            Hrozen
            <br />
            Postupka
            <br />
            Čtyři-dvě
            <br />
            Dvojce
            <br />
            Trojce
          </Section>

          <Section title="Play Mode">
            Play Mode není druhá hra.
            <br />
            <br />
            Je to jiný způsob zapisování skóre.
            <br />
            Kostkami hází přímo aplikace a kombinace se vyhodnocuje automaticky.
          </Section>
          <Section title="Nastavení hry">
  Před spuštěním Play Mode si hráči mohou nastavit pravidla hry.

  <br />
  <br />

  Lze změnit:

  <br />
  • počet hodů

  <br />
  • přepisování skóre

  <br />
  • typ bonusu

  <br />
  • počet bonusových hodů

  <br />
  <br />

  Na zvoleném nastavení se hráči domluví před začátkem hry.
</Section>
          <Section title="Dva způsoby hraní">
            Hero Dice můžeš hrát ručním zapisováním, pomocí Play Mode nebo oba způsoby během jedné hry kombinovat.
          </Section>

          <Section title="Ligová hra">
            Ligová hra používá:
            <br />
            • 4 hody
            <br />
            • bez přepisování skóre
            <br />
            • bonus pouze pro Generála
            <br />
            • 6 bonusových hodů
          </Section>

          <Section title="Fun hra">
            Pokud se nastavení hry liší od ligových pravidel, vzniká Fun hra.
            <br />
            <br />
            Fun hry mají vlastní statistiky a neovlivňují ligové rekordy.
          </Section>

          <Section title="Statistiky">
            Statistiky sledují:
            <br />
            • výhry
            <br />
            • nejlepší skóre
            <br />
            • počet her
            <br />
            • průměrné skóre
            <br />
            • perfektní kategorie
          </Section>

          <Section title="Uložení hry">
            Rozehranou hru můžeš kdykoliv uložit a později pokračovat přes Načíst hru.
          </Section>

          <Section title="Nejčastější otázky">
            Mohu kombinovat Play Mode a ruční zapisování?
            <br />
            Ano.
            <br />
            <br />
            Ukládají se Fun hry do statistik?
            <br />
            Ano, do samostatných statistik Fun her.
            <br />
            <br />
            Mohu pokračovat v rozehrané hře?
            <br />
            Ano.
          </Section>
        </div>
      </div>
    </div>
  );
}