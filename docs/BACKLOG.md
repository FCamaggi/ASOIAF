# Backlog — ASOIAF Trend

## Decisiones tomadas (contexto)

- **App para 2 usuarios, no crece.** Un repo, un servidor. Sin auth (localStorage
  guarda qué jugador sos), sin Supabase, sin Render.
- **Persistencia:** archivo JSON (`data/db.json`) + imágenes en `uploads/`.
  SQLite se descartó porque `better-sqlite3` compila binario nativo y el entorno
  de desarrollo no tiene red. Volver a SQLite = reescribir solo `server/db.ts`.
- **Entregable central:** imagen de trend 2×2 por categoría (layout del mockup
  `veredicto`), descargable como PNG.
- **Datos:** híbrido — seed curado a mano (`server/seed-data.ts`) + importadores
  `npm run import` (AIOIAF personajes/casas, AWOIAF dragones/batallas/lugares).
  Las 7 categorías subjetivas nunca se importan.
- **Imágenes de opción:** fallback = monograma tintado por casa. En Resultados se
  puede subir una imagen propia por elección (se guarda en `uploads/`).
- Sistema visual: Obsidian & Gold (`mockup/obsidian_gold/DESIGN.md`).

## Pendiente / mejoras

- [ ] **Verificación real:** el código nunca se ejecutó acá (sin red para
      `npm install`). Correr `npm install && npm run seed && npm run dev` y
      arreglar lo que aparezca (typecheck, runtime, export PNG).
- [ ] `html-to-image` se rompe si una opción tiene `imageUrl` **externa**
      (ej. Wikimedia Commons) por taint de canvas. Hoy no pasa (todas las
      imágenes reales son de `uploads/`, mismo origen). Si se agregan URLs de
      Commons: proxearlas por el backend o descargarlas a `uploads/`.
- [ ] Importador AWOIAF: las categorías `Castles/Cities/Towns/Regions/Islands`
      pueden traer ruido. Revisar el resultado y ajustar el filtro `JUNK` o la
      lista de categorías.
- [ ] Importador AIOIAF: personajes sin `house` → arte neutro. Se podría derivar
      la casa desde `allegiances` para mejor tinte.
- [ ] `duo`/`couple` en el seed: el campo `meta.members` tiene ids placeholder en
      varios casos (no se renderiza, pero está sucio). Limpiar si se decide
      mostrar las dos caras del dúo/pareja en la tarjeta.
- [ ] Opción: que la tarjeta de dúo/pareja muestre las 2 caras de sus miembros
      en vez del monograma compuesto (pregunta abierta al usuario).
- [ ] Contenido: hoy ~8-15 opciones destacadas por categoría. Revisar calidad y
      cantidad tras ver la app corriendo.
- [ ] `npm run build` + `npm start` (Fastify sirve `dist/`) sin probar.
- [ ] Evolución opcional del doc: PIN por jugador si la URL se vuelve pública.
