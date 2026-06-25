"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenCombinationHelp?: (
    categoryId: string
  ) => void;
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
  onOpenCombinationHelp,
}: Props) {
  if (!open) return null;

  const openCombinationHelp = (
    categoryId: string
  ) => {
    if (!onOpenCombinationHelp) {
      return;
    }

    onClose();
    onOpenCombinationHelp(
      categoryId
    );
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/90 p-4">
      <div className="mx-auto my-10 w-full max-w-3xl rounded-3xl border border-yellow-500/20 bg-zinc-900 p-6 text-white shadow-2xl md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-4xl font-black text-yellow-400 tracking-[0.14em]">
            PRŮVODCE HERO DICE
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-700 px-4 py-2 font-bold transition hover:bg-zinc-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <Section title="Co je Hero Dice">
            Hero Dice je kostková hra pro více hráčů inspirovaná hrou Generál.
            <br />
            <br />
            Cílem je získat co nejvyšší celkové skóre v sedmi bodovaných kombinacích.
            <br />
            <br />
            Vyhrává hráč s nejvyšším celkovým skóre.
            <br />
            <br />
            Hero Dice je jedna hra, kterou lze hrát několika způsoby.
          </Section>

          <Section title="Jak se Hero Dice hraje">
            Každý hráč hraje svůj tah samostatně.
            <br />
            <br />
            Na začátku tahu hází všemi kostkami.
            <br />
            Po každém hodu si může ponechat libovolný počet kostek.
            <br />
            Ponechané kostky se v dalších hodech již nehází.
            <br />
            Hráč pokračuje pouze se zbývajícími kostkami.
            <br />
            Jakmile provede další hod, předchozí výběr kostek již nelze změnit.
            <br />
            <br />
            Cílem tahu je vytvořit některou ze sedmi bodovaných kombinací.
            <br />
            Tah končí zapsáním skóre nebo vyčerpáním všech hodů.
            <br />
            <br />
            Hod kostkami
            <br />
            ↓
            <br />
            Výběr ponechaných kostek
            <br />
            ↓
            <br />
            Další hod
            <br />
            ↓
            <br />
            Vznik kombinace
            <br />
            ↓
            <br />
            Zápis skóre
            <br />
            ↓
            <br />
            Další hráč
          </Section>

          <Section title="Nastavení hry">
            Před začátkem hry se hráči společně domluví na pravidlech.
            <br />
            <br />
            Lze nastavit:
            <br />
            • počet hodů
            <br />
            • přepisování skóre
            <br />
            • bonusový režim
            <br />
            • počet bonusových hodů
            <br />
            <br />
            Ligová hra používá oficiální nastavení.
            <br />
            Jakákoliv změna vytváří Fun hru.
          </Section>

          <Section title="Zápis skóre">
            Hero Dice má dva způsoby zápisu skóre.
            <br />
            <br />
            Ruční zapisování:
            <br />
            • hráči hází skutečnými kostkami
            <br />
            • skóre zapisují ručně
            <br />
            <br />
            Play Mode:
            <br />
            • kostkami hází aplikace
            <br />
            • kombinace rozpoznává aplikace
            <br />
            • skóre zapisuje aplikace
            <br />
            <br />
            Pravidla hry zůstávají stejná. Mění se pouze způsob hraní.
            <br />
            <br />
            V ligové hře bez přepisování se každá kombinace zapisuje pouze jednou.
            <br />
            V režimech s povoleným přepisem může být skóre nahrazeno podle nastavení hry.
          </Section>

          <Section title="Způsoby hraní">
            Offline hra:
            <br />
            • lze hrát pouze ručně
            <br />
            • lze hrát pouze v Play Mode
            <br />
            • nebo oba způsoby během jedné hry kombinovat
            <br />
            <br />
            Play Mode:
            <br />
            • aplikace hází
            <br />
            • aplikace vyhodnocuje kombinace
            <br />
            • aplikace zapisuje skóre
            <br />
            <br />
            Online hra:
            <br />
            • hráči hrají na různých zařízeních
            <br />
            • používá Play Mode
            <br />
            • ruční zapisování není dostupné
            <br />
            <br />
            Hra proti počítači:
            <br />
            • počítač je plnohodnotný soupeř
            <br />
            • jeho tahy řídí aplikace
            <br />
            • hra proti počítači je vždy Fun hra
          </Section>

          <Section title="Kombinace">
            Hero Dice obsahuje sedm bodovaných kombinací:
            <br />
            <br />
            <div>
              <button
                onClick={() => openCombinationHelp("general")}
                className="font-bold text-yellow-300 transition hover:text-yellow-200"
              >
                Generál
              </button>
              <span className="text-zinc-400">
                {" "}— 6 až 36 bodů
              </span>
            </div>
            <br />
            <div>
              <button
                onClick={() => openCombinationHelp("pyramida")}
                className="font-bold text-yellow-300 transition hover:text-yellow-200"
              >
                Pyramida
              </button>
              <span className="text-zinc-400">
                {" "}— 14 až 32 bodů
              </span>
            </div>
            <br />
            <div>
              <button
                onClick={() => openCombinationHelp("hrozen")}
                className="font-bold text-yellow-300 transition hover:text-yellow-200"
              >
                Hrozen
              </button>
              <span className="text-zinc-400">
                {" "}— 10 až 28 bodů
              </span>
            </div>
            <br />
            <div>
              <button
                onClick={() => openCombinationHelp("postupka")}
                className="font-bold text-yellow-300 transition hover:text-yellow-200"
              >
                Postupka
              </button>
              <span className="text-zinc-400">
                {" "}— 21 bodů
              </span>
            </div>
            <br />
            <div>
              <button
                onClick={() => openCombinationHelp("ctyri_dva")}
                className="font-bold text-yellow-300 transition hover:text-yellow-200"
              >
                Čtyři-dvě
              </button>
              <span className="text-zinc-400">
                {" "}— 8 až 34 bodů
              </span>
            </div>
            <br />
            <div>
              <button
                onClick={() => openCombinationHelp("dvojce")}
                className="font-bold text-yellow-300 transition hover:text-yellow-200"
              >
                Dvojce
              </button>
              <span className="text-zinc-400">
                {" "}— 12 až 30 bodů
              </span>
            </div>
            <br />
            <div>
              <button
                onClick={() => openCombinationHelp("trojce")}
                className="font-bold text-yellow-300 transition hover:text-yellow-200"
              >
                Trojce
              </button>
              <span className="text-zinc-400">
                {" "}— 9 až 33 bodů
              </span>
            </div>
          </Section>

          <Section title="Ligová hra">
            Ligová hra používá pevné oficiální nastavení:
            <br />
            • 4 hody
            <br />
            • bez přepisování
            <br />
            • bonus pouze pro Generála
            <br />
            • 2 bonusové hody
            <br />
            • bez počítačového hráče
            <br />
            <br />
            Ligové hry ovlivňují ligové statistiky.
          </Section>

          <Section title="Fun hra">
            Fun hra vznikne, když se změní libovolné ligové pravidlo.
            <br />
            <br />
            Příklady:
            <br />
            • jiný počet hodů
            <br />
            • povolené přepisování
            <br />
            • jiný bonusový režim
            <br />
            • jiný počet bonusových hodů
            <br />
            • hra proti počítači
            <br />
            <br />
            Online hra může být také Fun podle nastavení.
          </Section>

          <Section title="Statistiky">
            Ligové hry:
            <br />
            ↓
            <br />
            Ligové statistiky
            <br />
            <br />
            Fun hry:
            <br />
            ↓
            <br />
            Fun statistiky
            <br />
            <br />
            Online hry:
            <br />
            ↓
            <br />
            podle nastavení Ligová / Fun
            <br />
            <br />
            Hry proti počítači:
            <br />
            ↓
            <br />
            vždy Fun statistiky
          </Section>

          <Section title="Uložení hry">
            Offline rozehranou hru lze uložit a později načíst.
            <br />
            <br />
            Online uložená hra vyžaduje dostupnou online místnost.
            <br />
            Pokud už není dostupná, hra nemusí jít obnovit.
          </Section>

          <Section title="Nejčastější otázky">
            Jaký je rozdíl mezi ruční hrou a Play Mode?
            <br />
            Ruční hra používá skutečné kostky a ruční zápis. Play Mode hází, rozpoznává kombinace a zapisuje skóre v aplikaci.
            <br />
            <br />
            Mohu během jedné hry přepínat mezi ručním zapisováním a Play Mode?
            <br />
            Ano. V offline hře bez počítače lze oba způsoby kombinovat.
            <br />
            <br />
            Je online hra jiná pravidly?
            <br />
            Ne. Pravidla hry jsou stejná, online mění jen způsob hraní.
            <br />
            <br />
            Je hra proti počítači ligová?
            <br />
            Ne. Hra proti počítači je vždy Fun hra.
            <br />
            <br />
            Kam se zapisují Fun hry?
            <br />
            Do samostatných Fun statistik, neovlivňují ligové rekordy.
            <br />
            <br />
            Kdy končí hra?
            <br />
            Jakmile některý hráč vyplní všech sedm kombinací. Vyhrává hráč s nejvyšším celkovým skóre.
            <br />
            <br />
            Mohu pokračovat v uložené hře?
            <br />
            Ano. Offline uloženou hru lze načíst. Online uložená hra vyžaduje dostupnou online místnost.
          </Section>
        </div>
      </div>
    </div>
  );
}