# Deploy en Fly.io

Tu red (`lahuen-dev`) **bloquea `api.fly.io` y `web.fly.io`** (probado). Solo
llegan `fly.io` y `api.machines.dev`. Por eso:

- **flyctl local y el dashboard de Fly NO te sirven desde esta red.**
- **Todo el deploy corre en GitHub Actions** (los runners de GitHub sí llegan a
  Fly). El workflow crea la app, el volumen y deploya.
- Lo único que necesitás desde una red que llegue a Fly (tu **celular con datos
  móviles** alcanza): **crear la cuenta y generar un Access Token.**

Es **un solo servicio**: Fastify sirve la API y la SPA. Persistencia en un
volumen montado en `/data` (`db.json` + `uploads/` sobreviven redeploys).

---

## Paso 1 — Repo en GitHub ✅ hecho

`git@github.com:FCamaggi/ASOIAF.git` (remoto SSH, key `~/.ssh/id_ed25519_github`).
Cambios futuros: `git add -A && git commit && git push`.

> El hook de ECC corre `lint/typecheck/test/build` en cada push si esos scripts
> existen — por eso el build de Vite se llama `build:web`, no `build`.

## Paso 2 — Cuenta Fly + token (desde el celular con datos móviles, o cualquier red libre)

1. Entrá a **fly.io** → Sign up (podés usar "Sign up with GitHub").
2. Dashboard → **Tokens** (o *Account → Access Tokens*) → **Create token**.
   Elegí un token de organización (amplio) — la Action necesita crear la app y el
   volumen, no solo deployar. Copialo entero (empieza con `FlyV1 ...`).
3. Fly puede pedir una tarjeta para habilitar la org aunque el uso quede en el
   tramo gratuito.

## Paso 3 — Cargar el token en GitHub (desde tu red)

Repo **ASOIAF → Settings → Secrets and variables → Actions → New repository secret**

- Name: `FLY_API_TOKEN`
- Value: el token

## Paso 4 — Deploy

Se dispara solo con el próximo `git push` a `main`, o a mano en
**Actions → "Fly Deploy" → Run workflow**.

El workflow:
1. crea la app `asoiaf-trend` si no existe,
2. destruye la máquina anterior y crea el volumen `asoiaf_data` (región `eze` =
   Buenos Aires, 1 GB) si no existe — recreación limpia para evitar hosts llenos,
3. `flyctl deploy --remote-only --ha=false`.

En el primer boot el contenedor corre `npm run seed` (crea `/data/db.json`).
URL: `https://asoiaf-trend.fly.dev`.

> Nombre `asoiaf-trend` tomado? Cambialo en `fly.toml` **y** en el `env:` de
> `.github/workflows/fly-deploy.yml`.

---

## Ampliar el catálogo con las APIs externas

**Actions → "Fly Import (catálogo externo)" → Run workflow.** Corre
`npm run import` dentro de la máquina en Fly (AIOIAF + AWOIAF). Idempotente.

## Operación

| Acción | Cómo |
| --- | --- |
| Redeploy | `git push` a main, o Actions → Fly Deploy → Run |
| Importar canon | Actions → Fly Import → Run |
| Logs / consola / backup | necesitan `api.fly.io` → desde el celular o el dashboard con datos móviles: `fly logs -a asoiaf-trend`, `fly ssh console -a asoiaf-trend -C "cat /data/db.json"` |

## Notas

- `auto_stop_machines` (fly.toml): la máquina se apaga sin tráfico y arranca sola
  en la próxima request (cold start de segundos). Si molesta:
  `min_machines_running = 1`.
- `--ha=false`: una sola máquina (el volumen pertenece a una máquina).
- Sin auth: cualquiera con la URL vota como Jugador A o B. App privada para dos.
- El `Dockerfile` usa `npm install` (no `npm ci`): no hace falta commitear
  lockfile.
