# A Song of Ice & Fire — Trend

App privada para **dos personas** que responden 17 categorías sobre el universo de
_A Song of Ice and Fire_ y luego comparan sus lealtades. La salida son **imágenes
de tendencia**: una tarjeta 2×2 por categoría (jugador A / jugador B arriba,
elección de cada uno abajo) lista para descargar y compartir.

## Stack

Un repo, un servidor. Sin servicios externos.

| Capa      | Tecnología                          |
| --------- | ----------------------------------- |
| Frontend  | React + Vite + TypeScript + Tailwind |
| API       | Fastify + TypeScript (`tsx`)         |
| Datos     | Archivo JSON local (`data/db.json`), sin dependencias nativas. Catálogo curado a mano |
| Export    | `html-to-image` (PNG en el cliente)  |

No hay APIs de terceros: el catálogo (`server/seed-data.ts`) es una colección
curada. Las opciones no tienen imágenes; se dibuja un **monograma tintado por
casa** como fallback.

## Puesta en marcha

```bash
npm install       # requiere red; no hay dependencias nativas que compilar
npm run seed      # crea data/db.json con el catálogo curado (17 categorías)
npm run import    # opcional: agrega personajes/casas (AIOIAF) + dragones/batallas/lugares (AWOIAF)
npm run dev       # API :3001  +  Vite :5173  (proxy /api -> :3001)
```

Abrí http://localhost:5173

### `npm run import` (híbrido, según `docs/`)

Trae entidades enciclopédicas **una sola vez** desde fuentes externas y las
mezcla en `data/db.json`:

| Fuente | Qué trae | Categorías que amplía |
| --- | --- | --- |
| [An API of Ice and Fire](https://anapioficeandfire.com) | personajes (con género), casas | personaje favorito h/m, más odiado, villano, mejor desarrollo, top 1, casa favorita |
| [A Wiki of Ice and Fire](https://awoiaf.westeros.org) (MediaWiki API) | dragones, batallas/asedios, castillos/ciudades/regiones | dragón, batalla, lugar |

Las opciones curadas a mano quedan **destacadas** (visibles por defecto); las
importadas entran como `featured: false` y solo aparecen al buscar por nombre.
Las 7 categorías subjetivas (escenas, muertes, dúos, parejas, momentos, frases)
**no** se importan: son siempre curadas.

Corré `npm run import` cuando quieras; es idempotente y no pisa lo curado.

### Producción (opcional, un solo proceso)

```bash
npm run build     # genera dist/
npm start         # Fastify sirve dist/ + API en :3001 (PORT configurable)
```

## Flujo

1. **`/`** — Elegí Jugador A o B, subí una foto (se guarda en `uploads/`).
2. **`/vote`** — 17 categorías, grilla 2×2, buscador (destacadas + canon importado), autosave por elección.
3. **`/waiting`** — "Esperando a los cuervos": _gate en la UI_ (confianza) hasta que ambos completen.
4. **`/results`** — El Veredicto: tarjeta 2×2 por categoría, matches en crimson, **reemplazá la imagen de cualquier elección** (sube a `uploads/`), `Descargar` PNG (individual o las 17).

## Notas de diseño

- Sistema visual **Obsidian & Gold** tomado de `mockup/obsidian_gold/DESIGN.md`.
- **No es autenticación**: `localStorage` guarda qué jugador sos. Cualquiera que
  llame a la API puede votar como cualquiera de los dos. Es una decisión asumida
  para una app familiar.
- El "secreto hasta el final" se aplica solo en el frontend (`bothComplete`).
- Re-ejecutá `npm run seed` cuando cambies `server/seed-data.ts`; reconstruye el
  catálogo y descarta elecciones que apunten a opciones ya inexistentes. Fotos y
  elecciones válidas se conservan.

## Estructura

```
server/
  index.ts        Fastify + rutas REST
  db.ts           store JSON (load/save de data/db.json)
  uploads.ts      escritura de imágenes en uploads/ + limpieza por prefijo
  seed.ts         carga del catálogo curado
  seed-data.ts    las 17 categorías y sus opciones curadas (editá esto)
  import/
    run.ts        orquestador de `npm run import`
    aioiaf.ts     cliente An API of Ice and Fire
    awoiaf.ts     cliente MediaWiki de A Wiki of Ice and Fire
shared/types.ts   contrato API <-> cliente
src/
  pages/          Welcome · Vote · Waiting · Results
  components/     AppShell · OptionCard · OptionArt · FallbackArt · PlayerAvatar · TrendCard · Raven
  lib/            houses (tintes) · image (resize)
data/db.json      estado (catálogo + usuarios + elecciones) — gitignored
uploads/          imágenes subidas — gitignored
```
