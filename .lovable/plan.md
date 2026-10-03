# Podstawka personalizowana: brak fallbacku do Standardowej, komunikat o pustym grawerze

## Zachowanie docelowe

Po wybraniu podstawki **Personalizowana** i kliknięciu gdzieś indziej przy pustym polu graweru:
- podstawka **Personalizowana pozostaje zaznaczona** (bez skoku na Standardową),
- pod polem pojawia się komunikat: **„Uzupełnij treść graweru.”**,
- pole zostaje podświetlone na czerwono,
- komunikat znika, gdy użytkownik zacznie pisać, wróci do pola lub wybierze inną podstawkę.

Bez zmian: Enter i kliknięcie „Zatwierdź” zatwierdzają treść, klawisz Escape dalej świadomie rezygnuje z personalizacji (wraca do Standardowej), a usunięcie podstawki z podsumowania kasuje wybór i treść graweru.

## Co się zmieni

1. **Zamiast resetu — błąd walidacji.** Kliknięcie poza pole przy pustej treści nie przywraca już podstawki Standardowa; ustawia jedynie stan błędu.
2. **Komunikat pod polem.** Ten sam styl, jaki mają obecne błedy w konfiguratorze (mały, czerwony tekst, dostępny dla czytników ekranu).
3. **Czerwona ramka pola** dopóki błąd jest aktywny.
4. **Blokada „Przejdź dalej”.** Dopóki podstawka to Personalizowana, a grawer jest pusty, przycisk prowadzący do zamówienia pozostaje nieaktywny — inaczej dałoby się złożyć zamówienie bez treści.
5. **Podsumowanie** pokazuje „Personalizowana” bez dopisanej treści, dopóki nie zostanie uzupełniona.

Pozostałe sekcje konfiguratora (Opakowanie, Zdjęcia) zostają odblokowane i dostępne do wypełnienia — błąd nie zamyka dalszych kroków.

## Szczegóły techniczne

Plik: `src/routes/oferta.tsx`

- Nowy stan `graverError: boolean`.
- `scheduleGraverReset` (linie 519–521): zachowany mechanizm timera 120 ms (kliknięcie w „Zatwierdź” lub inną kontrolkę anuluje go), ale zamiast `setBase("standard")` wywołuje `setGraverError(true)`.
- `onBlur` (linie 908–914): bez zmian logicznych — pełna treść zatwierdza się, pusta planuje błąd.
- Czyszczenie błędu: `onChange` inputu (903), `onFocus`, `onKeyDown` Escape (906), przycisk „Wyczyść grawer” (923), wybór innej podstawki (884), `clearBase` (572).
- Render komunikatu pod wierszem input + „Zatwierdź”: `<p role="alert" className="mt-2 text-xs text-destructive">Uzupełnij treść graweru.</p>` — wzorzec identyczny jak `photoError` (linia 986).
- Klasa inputu: `border-destructive` zamiast `border-input`, gdy `graverError` jest aktywne.
- Warunek `disabled` przycisku „Przejdź dalej” (1053): dodane `base === "personalized" && !graverText.trim()`.
- `readySteps[3]` / `activeSteps` bez zmian — sekcje dalszych kroków pozostają odblokowane.

Weryfikacja: przejście w podglądzie `/oferta` — krok 4, kliknięcie „Personalizowana”, kliknięcie poza pole; sprawdzenie komunikatu, braku skoku na Standardową, nieaktywnego „Przejdź dalej”, a po wpisaniu tekstu — zniknięcia komunikatu i aktywacji przycisku.
