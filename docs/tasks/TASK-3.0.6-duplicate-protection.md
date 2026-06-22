# v3.0.6 – Ochrana proti duplicitnímu zápisu statistik

**Status**: ✅ Implementováno, Build ✅, Lint ✅

## Změny

### 1. Databáze - SQL migrace
**Soubor**: `supabase/migrations/20260622_add_game_id_to_stats.sql`

- Přidán sloupec `game_id` (UUID, nullable) do tabulky `games`
- Přidán sloupec `game_id` (UUID, nullable) do tabulky `fun_games`
- Zachovány stare záznamy bez `game_id`

### 2. Statistics - app/data/statistics.ts
**Změny**:
- Rozšířen typ `FinishedGame` o volitelné pole `gameId?: string`
- Upravena funkce `saveFinishedGame()`:
  - Kontrola duplikátu: před insertem zkontroluje, zda v `games` už existuje záznam se stejným `game_id`
  - Vrací `boolean`: `true` = úspěšný zápis, `false` = duplikát detekován
  - Přidá `game_id` do insert payloadu
  - Ošetřuje database chyby

### 3. UI - app/page.tsx
**Nový stav**:
- `showDuplicateGameMessage` – zobrazení hlášky o duplikátu

**Upravené funkce**:
- `saveFunGame()`:
  - Kontrola duplikátu: zkontroluje `fun_games` před insertem
  - Vrací `boolean` pro indikaci úspěchu
  - Přidá `game_id` do insert payloadu

**Upravené flow**:
- Play Mode konec hry – zpracovává výsledek `saveFinishedGame()` a `saveFunGame()`
- Modal `showFinishGameConfirm` – tlačítko "Ligová hra":
  - Kontrola duplikátu
  - Při duplikátu: zavření modálu, zobrazení hlášky, **BEZ ceremonie**
  - Při OK: běžný průběh s confetti a zvukem
- Modal `showFinishGameConfirm` – tlačítko "Fun hra":
  - Stejné chování jako ligová hra

**Nový modal**:
- `DUPLICATE GAME MESSAGE` – informuje uživatele: 
  - "Tato hra již byla dříve do statistik zapsána. Výsledek nebyl uložen znovu."
  - Tlačítko OK pro zavření

## Tok řešení duplikátu

```
Uživatel kliká na "Ligová/Fun hra"
  ↓
saveFunGame() / saveFinishedGame() voláno
  ↓
Kontrola: existuje záznam s tímto gameId?
  ├─ ANO: vrátit false, zobrazit hlášku, ZASTAVIT
  └─ NE: vložit záznam, vrátit true, pokračovat normálně
  ↓
Pokud false:
  - Zavřít modal
  - Setmout `showDuplicateGameMessage = true`
  - Vrátit se (bez ceremonie)
  ↓
Pokud true:
  - Pokračovat v normálním toku
  - Zobrazit výherní obrazovku
  - Spustit confetti a zvuk dle nastavení
```

## Ověření

### Test 1: Nová ligová hra
1. Spustit novou hru s Play Mode (Liga)
2. Hrát a dohrát
3. Zvolit "Ligová hra"
4. ✅ Hra se zapíše do `games` s `game_id`
5. ✅ Zobrazí se výherní obrazovka s ceremoniál

### Test 2: Duplikát ligové hry
1. Načíst TUTÉŽ uloženou hru
2. Hrát znovu a dohrát
3. Zvolit "Ligová hra"
4. ✅ Zobrazí se hláška: "Tato hra již byla dříve do statistik zapsána..."
5. ✅ Žádná ceremonie, žádný záznam do DB
6. ✅ Statistiky se neupdatují

### Test 3: Nová fun hra
1. Spustit novou hru s Play Mode (Fun)
2. Hrát a dohrát
3. Zvolit "🟣 Fun hra"
4. ✅ Hra se zapíše do `fun_games` s `game_id`
5. ✅ Zobrazí se výherní obrazovka s ceremoniál

### Test 4: Duplikát fun hry
1. Načíst TUTÉŽ uloženou fun hru
2. Hrát znovu a dohrát
3. Zvolit "🟣 Fun hra"
4. ✅ Zobrazí se hláška: "Tato hra již byla dříve do statistik zapsána..."
5. ✅ Žádná ceremonie, žádný záznam do DB
6. ✅ Statistiky se neupdatují

### Test 5: Staré statistiky bez game_id
1. Ověřit, že záznamy v `games` a `fun_games` bez `game_id` (z dřívějších verzí) se stále zobrazují
2. ✅ Starší záznamy nejsou ovlivněny

## Build & Lint

```
✅ npm run build - úspěšné, bez nových chyb
✅ npm run lint - 53 pre-existing issues (bez nových)
```

## Herní logika

- ❌ Pravidla hry: nezměněna
- ❌ Scoring: nezměněn
- ❌ Play Mode: nezměněn
- ❌ Online synchronizace: nezměněna
- ✅ UI hlášení o duplikátu: přidáno

## Kompatibilita

- ✅ Staré hry bez `game_id` se načítají normálně
- ✅ Nové hry vytváří stabilní `gameId` (UUID)
- ✅ `gameId` se zachovává při uložení/načtení
- ✅ Duplikát se detekuje jen pro nové záznamy s `game_id`
