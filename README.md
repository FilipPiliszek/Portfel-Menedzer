**Aplikacja do zarządzania budżetem domowym**  
Projekt realizowany w ramach przedmiotu: _Podstawy Zarządzania Projektami_

## Zespół Projektowy (020310_03_PZP_2025)

- **Filip Piliszek** – Team Leader
- **Michał Wiśniewski** –
- **Filip Mateusiak** –
- **Mateusz Oczkiewicz** –

---

## O projekcie

Portfel Menedżer to intuicyjne narzędzie webowe pozwalające na pełną kontrolę nad finansami osobistymi. Aplikacja umożliwia śledzenie wydatków i przychodów, kategoryzację transakcji oraz wizualizację statystyk w czasie rzeczywistym.

### Kluczowe funkcjonalności

- **Autoryzacja:** Bezpieczne logowanie i rejestracja użytkowników (szyfrowanie haseł `bcrypt`).
- **Zarządzanie transakcjami:** Dodawanie, edytowanie i usuwanie wydatków oraz przychodów.
- **Limity budżetowe:** System ostrzeżeń po przekroczeniu zdefiniowanego limitu na daną kategorię.
- **Analityka:** Dynamiczne wykresy (kołowe i słupkowe) obrazujące strukturę wydatków.
- **Responsywny Design:** Nowoczesny interfejs wykonany w Dark Mode (Tailwind CSS).

## Technologie

**Backend:**

- Node.js + Express
- PostgreSQL (Baza danych)
- pg (node-postgres)
- Bcrypt (bezpieczeństwo)

**Frontend:**

- React 19 (Vite)
- Tailwind CSS 4
- Lucide React (ikony)
- Recharts (wizualizacja danych)

---

## Instalacja i konfiguracja

### Wymagania wstępne:

- Zainstalowany [Node.js](https://nodejs.org/)
- Zainstalowany [PostgreSQL](https://www.postgresql.org/)

### Kroki instalacji:

1. **Sklonuj repozytorium:**

```bash
git clone https://github.com/FilipPiliszek/Portfel-Menedzer.git
cd Portfel-Menedzer
```

2. **Zainstaluj zależności dla całego projektu**

```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

3. **Konfiguracja bazy danych**

- Stwórz bazę danych o nazwie portfel_db w PostgreSQL.
- Uruchom skrypt SQL znajdujący się w server/schemat_bazy.sql, aby stworzyć tabele.

4. **Zmienne środowiskowe**
   W folderze server stwórz plik .env na podstawie .env_example:

```bash
DB_USER=postgres
DB_PASSWORD=twoje_haslo
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=portfel_db
PORT=5000
```

## Uruchamianie projektu

Aplikacja korzysta z biblioteki concurrently, co pozwala na uruchomienie obu serwerów jedną komendą z głównego folderu:

```bash
npm run dev
```

- Frontend będzie dostępny pod adresem: http://localhost:5173
