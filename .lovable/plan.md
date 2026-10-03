# Komunikat błędu wewnątrz karty „Dodaj własny element"

## Cel
Komunikat „Uzupełnij opis własnego elementu." ma wyświetlać się w boksie bezpośrednio pod polem „Wpisz element" — wewnątrz ramki karty „Dodaj własny element", a nie pod kartami. Wszystko poza tym pozostaje bez zmian (zachowanie karty, blokada „Przejdź dalej", czerwoną ramka pola, komunikat znika przy pisaniu).

## Zmiany w `src/routes/oferta.tsx`

1. Usunięcie zewnętrznego bloku błędu (siatka 3-kolumnowa po `subjectOptions.map`, ok. linie 741–747) — to on renderował komunikat pod kartami.

2. Przekazanie komunikatu do karty: `textInput` dostaje nowe pole `errorMessage?: string`. Dla karty „custom" ustawiane `customError ? "Uzupełnij opis własnego elementu." : undefined`.

3. Render komunikatu wewnątrz `ChoiceCard` (karta „custom" ma pełne tło, więc edytor jest w absolutnym kontenerze `absolute inset-x-3.5 bottom-[18px]`):
   - Pod wierszem input + „Zatwierdź" w tym samym absolutnym kontenerze pojawia się boks `rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive` (identyczny styl jak obecnie, w tym `role="alert"`).
   - Boks jest wewnątrz ramki karty (`overflow-hidden`), pod polem tekstowym.
   - Pojawia się tylko gdy karta jest zaznaczona, edytor widoczny i `errorMessage` ustawione; przy obecnym `pb-[44px]` w kolumnie treści input lekko się przesunie w górę, żeby zrobić miejsce — tylko w stanie błędu nic więcej się nie zmienia.

4. Bez zmian: logika `onEmpty`/`onCommit`/`onCancel`, czyszczenie błędu przy pisaniu, walidacja „Przejdź dalej", komunikat graweru na podstawce (krok 4) — zostaje jak jest.

## Weryfikacja
- Playwright na `/oferta` (desktop 1280×1800, mobile 390×844): klik „Dodaj własny element" → klik poza kartę → karta zostaje zaznaczona, komunikat w czerwonym boksie pod polem **wewnątrz ramki karty**, „Przejdź dalej" nieaktywne; pisanie gasi komunikat; zatwierdzenie pustego pola pokazuje komunikat; odznaczenie karty czyści błąd.
- Check build-errors.log: build OK.
