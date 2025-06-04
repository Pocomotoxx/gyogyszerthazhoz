# Gyógyszerész a háznál – Telemedicina App

Ez a repository egy egyszerű telemedicina alkalmazás prototípusa. A projekt két részből áll:

- **server** – Node.js/Express szerver SQLite adatbázissal
- **client** – React + TypeScript frontend (Vite)

Az alkalmazás felhasználói felülete teljes egészében magyar nyelvű.

## Fejlesztői környezet

1. Telepítsd a függőségeket mindkét könyvtárban:

```bash
cd server && npm install
cd ../client && npm install
```

2. Indítsd el a backendet és a frontendet külön terminálban:

```bash
# backend
cd server && npm start

# frontend
cd client && npm run dev
```

A Vite fejlesztői szerver automatikusan proxyzza a `/api` végpontokat a Node szerver felé.

## Alap funkciók

- Szerepkör alapú bejelentkezés (gondozó, gyógyszerész, admin, superadmin). A felhasználó adatainak mintái a szerver indulásakor automatikusan létrejönnek, köztük egy super admin felhasználó is.
- A szuperadmin felületen új adminok hozhatók létre, módosítható a felhasználók szerepköre és törölhetők a fiókok.
- Terápiás napló bejegyzések listázása és hozzáadása.
- Értesítési központ egyéni értesítések megtekintéséhez és olvasottnak jelöléséhez.
- Gyógyszerigénylések beküldése a gondozói felületről és státuszkezelés a gyógyszerész oldalán.
- Gyógyszerek online fizetése egyszerű kártyás fizetési űrlappal.
- Útvonaltervező a gyógyszerészek számára, nyílt térképszolgáltatások felhasználásával.

Az alkalmazás továbbra is prototípus jellegű, a jogosultságkezelés és a validációk minimálisak.
