# „Dodaj własny element” bez znikania karty

## Cel

Karta **Dodaj własny element** (krok 1 konfiguratora) dziś zachowuje się jak dawna podstawa Personalizowana: klikasz ją, rozwija się pole „Wpisz element”, a jeśli nic nie wpiszesz i klikniesz gdzieś obok — karta sama wraca do zamkniętego stanu i wpis znika.

Po zmianie: karta zostaje zaznaczona, a pod kartami kroku 1 pojawia się czerwony komunikat, że trzeba uzupełnić opis elementu. Dokładnie tak, jak zrobiło to z grawerem na podstawce.

## Jak to działa dziś

- Pole w karcie ma własny handler wyjścia z fokusu (`oferta.tsx`, ok. 214–219):
  - jest tekst → zatwierdza,
  - brak tekstu → `onCancel()`, a ta funkcja (ok. 686) usuwa „własny element” z listy i czyści pole — stąd „przeskoczenie”.
- Ten sam schemat dla grawera został już wcześniej przerobiony na „zostaw wybór + pokaż błąd” (`graverError`, komunikat z `role="alert"` przy ok. 938).

## Zmiana

1. **Stan błędu** — obok `graverError` dochodzi `customError`, resetowany przy: pisaniu w polu, kliknięciu X w podsumowaniu, odznaczeniu karty i „Wyczyść wszystko”.
2. **Brak powrotu do zamkniętej karty** — wyjście z pola przy pustym wpisie nie usuwa już elementu z konfiguracji, tylko ustawia `customError`.
3. **Komunikat** — pod siatką kart kroku 1, tym samym stylem co przy grawerze (mały czerwony tekst, `role="alert"`):
   `Uzupełnij opis własnego elementu.`
4. **Podświetlenie pola** — puste pole dostaje czerwoną ramkę, znikającą w momencie pisania.
5. **Blokada „Przejdź dalej”** — dopóki karta jest wybrana i opis jest pusty, przycisk pozostaje nieaktywny (spójnie z grawerem). Kartę można w każdej chwili odznaczyć kliknięciem, co zdejmuje blokadę.

## Techniczne szczegóły

Pliki: `src/routes/oferta.tsx` (jedyny zmieniany plik).

- `ChoiceCard`: rozszerzenie typu `textInput` o `error?: boolean` i `onEmpty?: () => void`; w gałęzi `onBlur` przy pustej wartości — `onEmpty` jeśli podane, w przeciwnym razie dotychczasowe `onCancel` (zachowuje bezpieczną domyślną ścieżkę); `className` inputa reaguje na `error` (`border-destructive` zamiast `border-border`).
- `OfferPage`: `const [customError, setCustomError] = useState(false);`, `onChange` pola czyści błąd, `onEmpty: () => setCustomError(true)`, `error: customError` przekazywane do karty `custom`.
- Odznaczenie karty (gałąź `custom` w `onClick`, ok. 720–726) i `clearAll` (ok. 578) ustawiają `customError` na `false`.
- Komunikat: `{customError && subjects.includes("custom") && <p role="alert" className="mt-2 text-xs text-destructive">…</p>}` tuż po zamykającym `</div>` siatki kart kroku 1 (ok. 731).
- `disabled` przycisku „Przejdź dalej” (ok. 1059): do istniejącego warunku dokłada się `(subjects.includes("custom") && !customText.trim())`.
- Bez timerów: `onBlur` już dziś pomija kliknięcia w przyciski karty (`preventDefault` na `mousedown`, sprawdzenie `relatedTarget`), więc błąd nie miga przy klikaniu „Zatwierdź”.

## Weryfikacja

Playwrightem na `/oferta`: klik „Dodaj własny element”, klik poza kartę — karta zostaje zaznaczona, widoczny komunikat i czerwona ramka, „Przejdź dalej” nieaktywne; wpisanie tekstu gasi komunikat, „Zatwierdź” przechodzi w znacznik z treścią; odznaczenie karty przywraca przycisk.
