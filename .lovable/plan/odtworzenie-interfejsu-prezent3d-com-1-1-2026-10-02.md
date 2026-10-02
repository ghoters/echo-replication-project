# Odtworzenie interfejsu prezent3d.com 1:1

## Zakres
- Przenieść wszystkie publiczne i użytkowe widoki projektu źródłowego: stronę główną, ofertę/konfigurator, sklep, FAQ, kontakt, logowanie, konto, zamówienie, płatność, potwierdzenie oraz widoki administracyjne i szczegółów zamówień.
- Zachować dokładne treści, strukturę sekcji, kolejność elementów, nawigację, stopkę, formularze i komplet stanów interaktywnych.
- Skopiować oryginalne obrazy i pozostałe zasoby z projektu źródłowego zamiast tworzyć zamienniki.

## Wykonanie
1. Przenieść źródłowe zasoby graficzne do bieżącego projektu tak, aby zachowały oryginalne wymiary i jakość.
2. Odtworzyć źródłowy system wizualny: Manrope, kolory, obramowania, cienie, promienie, szerokości kontenerów, breakpointy, animacje oraz stany hover/focus/active/disabled.
3. Przenieść współdzielone elementy interfejsu i wszystkie strony wraz z ich dokładnym układem.
4. Zachować działające zachowanie przeglądarkowe konfiguratora oraz przepływu oferta → zamówienie → płatność → potwierdzenie.
5. Podłączyć widoki zależne od konta i danych do Lovable Cloud, zachowując ich wygląd i zasady dostępu z projektu źródłowego.
6. Uzupełnić metadane każdej strony zgodnie ze źródłem i zachować polski język dokumentu.

## Weryfikacja
- Porównać każdą stronę źródłową i odtworzoną na desktopie, tablecie i telefonie.
- Sprawdzić menu, formularze, wybory konfiguratora, walidację, przejścia między etapami oraz stany elementów.
- Poprawić wykryte różnice w wymiarach, odstępach, typografii, kolorach, pozycjonowaniu obrazów i zachowaniu responsywnym.
- Potwierdzić brak błędów kompilacji i błędów działania w przeglądarce.

## Szczegóły techniczne
- Zachowuję obecną architekturę TanStack Start i odwzorowuję pliki tras źródłowych bez zmiany publicznych adresów.
- Zależności i komponenty UI zostaną wyrównane ze źródłem zamiast zastępowania ich innymi bibliotekami.
- Dane kont, zamówień, plików i ról wymagają włączenia Lovable Cloud; migracje i zasady dostępu zostaną przeniesione ze źródła.
