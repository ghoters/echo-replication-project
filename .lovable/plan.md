# Przeniesienie komunikatu błędu „Uzupełnij opis własnego elementu" do wnętrza boksu „Dodaj własny element"

## Cel
Komunikat o braku opisu ma się pokazywać **wewnątrz karty „Dodaj własny element"**, w dolnej części boksu — pomiędzy polem tekstowym „Wpisz element" a dolną ramką karty (tak jak na załączonym zrzucie). Pozycja wszystkich innych elementów oraz mechanika (pokaż przy pustym blurze, czyść przy pisaniu/odznaczeniu, blokada „Przejdź dalej") pozostają bez zmian.

## Stan obecny
- Komunikat jest renderowany **poza kartą**, jako osobny wiersz pod siatką kart (`src/routes/oferta.tsx`, ok. linie 741–746), wyrównany do trzeciej kolumny.
- Pole tekstowe „Wpisz element" w aktywnej karcie rysowane jest jako nakładka absolutna wewnątrz karty (blok `absEditor`, `src/routes/oferta.tsx` ok. linie 335–338), zakotwiczona przy dolnej krawędzi karty.

## Zmiany (tylko `src/routes/oferta.tsx`)
1. **Usunąć** zewnętrzny blok komunikatu pod siatką kart (linie ok. 741–746).
2. **Dodać** komunikat do wnętrza nakładki edytora w `ChoiceCard`: w kontenerze `absEditor` (`absolute inset-x-3.5 bottom-[18px] z-10 flex flex-col`), bezpośrednio **pod** wierszem pola tekstowego, wyrenderować `<p role="alert" className="text-xs text-destructive">Uzupełnij opis własnego elementu.</p>` — widoczny tylko gdy `textInput.error` jest prawdziwe. Dzięki zakotwiczeniu od dołu komunikat wypełni przestrzeń między polem a dolną ramką karty, bez przesuwania treści nad polem (zarezerwowane `pb-[44px]` pokrywa wysokość pola + komunikatu).
3. Komunikat pojawia się wyłącznie dla karty „Dodaj własny element" (jedyna z `textInput.error`), tylko gdy karta jest wybrana i opis niezatwierdzony — czyli dokładnie w tych samych momentach co obecnie.

## Mechanika bez zmian
- Pusty blur → błąd zamiast przeskoku na „Standardową"; pisanie lub odznaczenie karty czyści błąd; „Przejdź dalej" zablokowane do wpisania opisu — żadna logika stanu nie jest modyfikowana.

## Weryfikacja
- Playwright: klik „Dodaj własny element", klik poza kartę przy pustym polu → zrzut ekranu potwierdzający komunikat wewnątrz ramki karty, między polem a dolną krawędzią; wpisanie tekstu czyści komunikat; układ pozostałych kart bez zmian.
