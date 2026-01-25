# **Aplikacja do zarządzania budżetem domowym**

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
</p>

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

- **Pełna autoryzacja:** Bezpieczny system rejestracji i logowania z hashowaniem haseł po stronie serwera przy użyciu **bcrypt** oraz utrwalaniem sesji w przeglądarce.
- **Zarządzanie transakcjami:** Pełne operacje CRUD (tworzenie, odczyt, aktualizacja, usuwanie) z edycją "w miejscu" (inline editing) dla maksymalnej wygody.
- **Limity budżetowe:** System ostrzeżeń po przekroczeniu zdefiniowanego limitu na daną kategorię.
- **Wizualizacja danych:** Dynamiczne i interaktywne wykresy (kołowe, słupkowe i liniowe) obrazujące strukturę wydatków i trendy w czasie, zrealizowane przy użyciu biblioteki **Recharts**.
- **Responsywny Design:** Nowoczesny interfejs wykonany w Dark Mode (Tailwind CSS).

## Technologie

#### **Backend:**

- **Node.js + Express**
- **PostgreSQL (Baza danych)**
- **pg (node-postgres)**
- **Bcrypt (bezpieczeństwo)**

#### **Frontend:**

- **React 19 (Vite)**
- **Tailwind CSS 4**
- **Lucide React (ikony)**
- **Recharts (wizualizacja danych)**

---

## Instalacja i konfiguracja

### Wymagania wstępne:

- Zainstalowany [Node.js v20+](https://nodejs.org/)
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
