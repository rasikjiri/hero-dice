const ERROR_MESSAGE_REPLACEMENTS: Record<string, string> = {
  "Hrac s timto ID jiz existuje.": "Hráč s tímto ID již existuje.",
  "Tento e-mail je jiz pouzity. Zadej prosim jiny e-mail pro registraci.":
    "Tento e-mail je již použitý. Zadej prosím jiný e-mail pro registraci.",
  "Pro tento e-mail uz existuje nevyrizena registracni zadost.":
    "Pro tento e-mail už existuje nevyřízená registrační žádost.",
  "ID hrace muze obsahovat pouze mala pismena.":
    "ID hráče může obsahovat pouze malá písmena.",
  "ID hrace musi mit 1 az 6 znaku.": "ID hráče musí mít 1 až 6 znaků.",
  "Zadej platny e-mail.": "Zadej platný e-mail.",
  "Heslo musi mit alespon 6 znaku.": "Heslo musí mít alespoň 6 znaků.",
  "Vypln jmeno hrace.": "Vyplň jméno hráče.",
  "Neplatna nebo neaktivni admin session.": "Neplatná nebo neaktivní admin session.",
  "Pouze admin muze zpracovat zadost.": "Pouze admin může zpracovat žádost.",
  "Zadost nebyla nalezena nebo jiz byla zpracovana.":
    "Žádost nebyla nalezena nebo již byla zpracována.",
  "Pouze admin muze mazat zadosti.": "Pouze admin může mazat žádosti.",
  "Zadost nebyla nalezena.": "Žádost nebyla nalezena.",
};

export const normalizeCzechErrorMessage = (input: string) => {
  const normalized = input.trim();
  return ERROR_MESSAGE_REPLACEMENTS[normalized] ?? normalized;
};
