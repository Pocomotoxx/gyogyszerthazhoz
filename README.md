# Gyógyszerész a háznál – Telemedicina App

Ez a repository egy egyszerű telemedicina alkalmazás prototípusa. A projekt két részből áll:

 - **server** – PHP alapú backend SQLite adatbázissal
- **client** – React + TypeScript frontend (Vite)

Az alkalmazás felhasználói felülete teljes egészében magyar nyelvű.

## Fejlesztői környezet

1. Telepítsd a frontend függőségeit:

```bash
cd client && npm install
```

2. Indítsd el a backendet és a frontendet külön terminálban:

```bash
# backend
php -S localhost:3001 -t server

# frontend
cd client && npm run dev
```

A Vite fejlesztői szerver automatikusan proxyzza a `/api` végpontokat a PHP szerver felé.

## Alap funkciók

- Szerepkör alapú bejelentkezés (gondozó, gyógyszerész, admin, superadmin). A felhasználó adatainak mintái a szerver indulásakor automatikusan létrejönnek, köztük egy super admin felhasználó is.
- A szuperadmin felületen új adminok hozhatók létre, módosítható a felhasználók szerepköre és törölhetők a fiókok.
- Terápiás napló bejegyzések listázása és hozzáadása.
- Bejegyzésekhez fénykép csatolása és feltöltése.
- Értesítési központ egyéni értesítések megtekintéséhez és olvasottnak jelöléséhez.
- Gyógyszerigénylések beküldése a gondozói felületről és státuszkezelés a gyógyszerész oldalán.
- Gyógyszerek online fizetése egyszerű kártyás fizetési űrlappal.
- Útvonaltervező a gyógyszerészek számára, nyílt térképszolgáltatások felhasználásával.
- Belső chatfelület a gondozók, a gyógyszerészek és az adminok közötti kommunikációhoz.
- Chatüzenetekhez kép csatolható.
- Gyógyszerfelismerő modul, amely a kamera képét az AI-gatewayen keresztül dolgozza fel és megjeleníti a gyógyszer legfontosabb adatait.

### Környezeti változók

A gyógyszerfelismeréshez az `VITE_AI_GATEWAY_URL` változóval állítható be az AI-gateway alap URL-je (frontend oldalon). Alapértelmezésben `/ai` értéket használ.

Az alkalmazás továbbra is prototípus jellegű, a jogosultságkezelés és a validációk minimálisak.

## Tesztkörnyezet

A frontendhez Vitest tesztek tartoznak. Futtatásuk:

```bash
cd client && npm test
```
