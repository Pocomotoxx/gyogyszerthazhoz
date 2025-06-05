# Gyógyszerész a háznál – Telemedicina App

Ez a repository egy egyszerű telemedicina alkalmazás prototípusa, amely PHP alapon valósítja meg mind a backend API-t, mind az egyszerű felhasználói felületet.

- **server** – PHP backend SQLite adatbázissal
- **public** – PHP oldalakat tartalmazó frontend

Az alkalmazás felülete teljes egészében magyar nyelvű.

## Futás fejlesztői környezetben

1. Telepítsd a PHP-t (>=8.0) és győződj meg róla, hogy az `sqlite3` kiterjesztés engedélyezve van.
2. Indítsd el a beépített webszervert a repository gyökeréből:

```bash
php -S localhost:8000 router.php
```

A `router.php` gondoskodik róla, hogy a `/api` útvonalak a backendhez kerüljenek, minden más pedig a `public/` könyvtárból legyen kiszolgálva.

## Alap funkciók

- Szerepkör alapú bejelentkezés (gondozó, gyógyszerész, admin, superadmin). A minta felhasználók a szerver indulásakor automatikusan létrejönnek.
- A szuperadmin felületen új adminok hozhatók létre, módosítható a felhasználók szerepköre és törölhetők a fiókok.
- Terápiás napló bejegyzések listázása és hozzáadása fényképpel.
- Értesítési központ az egyéni értesítések megtekintéséhez és olvasottnak jelöléséhez.
- Gyógyszerigénylések beküldése a gondozói felületről és státuszkezelés a gyógyszerész oldalán.
- Gyógyszerek online fizetése egyszerű kártyás fizetési űrlappal.
- Útvonaltervező a gyógyszerészek számára nyílt térképszolgáltatással.
- Belső chatfelület a gondozók, gyógyszerészek és adminok között, üzenetenként opcionális képcsatolással.
- Gyógyszerfelismerő modul, amely a kamera képét az AI-gatewayen keresztül dolgozza fel és a csomagoláshoz tartozó információkat jeleníti meg.

### Környezeti változók

A gyógyszerfelismeréshez az `AI_GATEWAY_URL` környezeti változóval állítható be az AI-gateway alap URL-je. Alapértelmezésben `/ai` értéket használ.

Az alkalmazás továbbra is prototípus jellegű, a jogosultságkezelés és a validációk minimálisak.
