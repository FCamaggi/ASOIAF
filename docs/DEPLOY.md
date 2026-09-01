# Deploy en Fly.io

Tu red (`lahuen-dev`) **bloquea `api.fly.io`** (probado). Por eso:

- **Setup inicial (1 sola vez):** desde otra red — tu casa, hotspot del celular,
  un Codespace, cualquier lugar con salida libre.
- **Después:** cada `git push` a `main` redespliega solo vía **GitHub Actions**
  (los runners de GitHub sí llegan a Fly). Nunca más necesitás flyctl local.

Es **un solo servicio**: Fastify sirve la API y la SPA compilada. Persistencia en
un volumen montado en `/data` (`db.json` + `uploads/` sobreviven redeploys).

---

## Paso 1 — Repo en GitHub ✅ hecho

Ya está en `git@github.com:FCamaggi/ASOIAF.git` (remoto SSH, key
`~/.ssh/id_ed25519_github`). Para futuros cambios: `git add -A && git commit && git push`.

> `data/db.json` y `uploads/` están gitignoreados. Solo viven en el volumen de Fly.
> El hook de ECC corre `lint/typecheck/test/build` en cada push si esos scripts
> existen — por eso el build de Vite se llama `build:web` (no `build`).

## Paso 2 — Setup en Fly (UNA vez, desde otra red)

```bash
curl -L https://fly.io/install.sh | sh
export FLYCTL_INSTALL="$HOME/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

fly auth login

cd ASOIAF                      # clon del repo, o la carpeta con fly.toml/Dockerfile
fly apps create asoiaf-trend                 # nombre único; si está tomado, cambialo también en fly.toml
fly volumes create asoiaf_data --region scl --size 1
fly deploy                                   # primer build + arranque

# token para que GitHub Actions pueda deployar después:
fly tokens create deploy -x 8760h            # 1 año; copialo entero (empieza con "FlyV1 ...")
```

La app queda en `https://asoiaf-trend.fly.dev`.

## Paso 3 — Conectar GitHub Actions (desde tu red)

En GitHub: repo **ASOIAF → Settings → Secrets and variables → Actions → New repository secret**

- Name: `FLY_API_TOKEN`
- Value: el token del paso anterior

Listo. Desde ahora:

```bash
git add -A && git commit -m "cambios" && git push
```

y `.github/workflows/fly-deploy.yml` redespliega. También podés dispararlo a mano
en la pestaña **Actions**.

---

## Ampliar el catálogo con las APIs externas

`api.fly.io` está bloqueado en tu red, así que no podés hacer `fly ssh` local.
Usá el workflow: **Actions → "Fly Import (catálogo externo)" → Run workflow**.
Corre `npm run import` dentro de la máquina en Fly (AIOIAF + AWOIAF). Idempotente.

## Operación

| Acción | Cómo |
| --- | --- |
| Redeploy | `git push` a main, o Actions → Fly Deploy → Run |
| Importar canon | Actions → Fly Import → Run |
| Logs | `fly logs` (desde una red con acceso) o el dashboard de Fly |
| Backup del db.json | `fly ssh console -C "cat /data/db.json"` (otra red) |
| 1 sola máquina | `fly scale count 1` — el volumen pertenece a una máquina |

## Notas

- `auto_stop_machines`: la máquina se apaga sin tráfico y arranca sola en la
  próxima request (cold start de segundos). Si molesta, poné
  `min_machines_running = 1` en `fly.toml`.
- Sin auth: cualquiera con la URL vota como Jugador A o B. App privada para dos.
- Costo: 1× `shared-cpu-1x/512MB` que escala a 0 + 1 GB de volumen → tramo
  gratuito / centavos de Fly para este uso.
- El `Dockerfile` usa `npm install` (no `npm ci`) a propósito: no hace falta
  commitear un lockfile (que no podés generar sin red).
