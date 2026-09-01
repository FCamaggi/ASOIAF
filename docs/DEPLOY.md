# Deploy en Fly.io

El build (`npm install` + `vite build`) corre en el **remote builder de Fly**, no
en tu red — así te saltás el bloqueo de npm local. Es **un solo servicio**:
Fastify sirve la API y la SPA compilada.

## 0. Requisitos (una vez)

```bash
# instalar flyctl
curl -L https://fly.io/install.sh | sh      # macOS/Linux
# o: brew install flyctl

fly auth signup      # o: fly auth login
```

## 1. Subir el repo a GitHub

```bash
cd ~/personal/ASOIAF
git init
git add -A
git commit -m "ASOIAF Trend — app + deploy config"
git branch -M main
git remote add origin git@github.com:FCamaggi/ASOIAF.git
git push -u origin main
```

> `data/db.json` y `uploads/` están en `.gitignore` — nunca se suben. Viven en el
> volumen de Fly.

## 2. Crear la app y el volumen

`fly.toml` ya está en el repo. Elegí un nombre único (reemplazá `asoiaf-trend`
en `fly.toml` y en los comandos si está tomado):

```bash
fly apps create asoiaf-trend
fly volumes create asoiaf_data --region scl --size 1    # 1 GB, sobra
```

## 3. Deploy

```bash
fly deploy
```

Fly sube el contexto, construye la imagen (Dockerfile), y arranca. En el primer
boot el contenedor corre `npm run seed` (crea `/data/db.json` con las 17
categorías curadas) y levanta el server.

URL: `https://asoiaf-trend.fly.dev` — se la pasás a la otra persona.

## 4. Ampliar el catálogo con las APIs (opcional)

Los importadores necesitan salida a internet desde el contenedor (la tiene):

```bash
fly ssh console
npm run import        # AIOIAF personajes/casas + AWOIAF dragones/batallas/lugares
exit
```

Los datos importados quedan en el volumen. Es idempotente.

## 5. Actualizar

```bash
git add -A && git commit -m "cambios" && git push
fly deploy
```

Cada deploy vuelve a correr `npm run seed`: reconstruye el catálogo desde el
código y **conserva** votos y fotos (solo descarta elecciones que apunten a
opciones que ya no existen).

## Operación

| Acción | Comando |
| --- | --- |
| Logs en vivo | `fly logs` |
| Estado | `fly status` |
| Consola en el contenedor | `fly ssh console` |
| Ver/backup del db.json | `fly ssh console -C "cat /data/db.json"` |
| Reiniciar | `fly apps restart asoiaf-trend` |
| Mantener 1 sola máquina | `fly scale count 1` (el volumen es de una máquina) |

## Notas

- `auto_stop_machines`: la máquina se apaga sin tráfico y arranca sola en la
  siguiente request (cold start de segundos). La pantalla "Esperando a los
  cuervos" y la carga inicial lo disimulan. Si molesta: `min_machines_running = 1`
  en `fly.toml`.
- Sin auth: cualquiera con la URL puede votar como Jugador A o B. Es una app
  privada para dos; si la compartís más, agregá un PIN por jugador (ver
  `docs/BACKLOG.md`).
- Costo: 1 máquina `shared-cpu-1x/512MB` que escala a 0 + 1 GB de volumen entra
  en el tramo gratuito / muy bajo de Fly para este uso.
