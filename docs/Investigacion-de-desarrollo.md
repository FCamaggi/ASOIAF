# Investigación técnica para una app web de preferencias de A Song of Ice and Fire

## Conclusión ejecutiva

La idea es **muy viable** y, para una primera versión, no necesitas construir un CMS ni subir manualmente cientos de imágenes. La mejor solución no es depender de una única API, porque ninguna fuente pública que encontré cubre bien las 17 categorías. Lo más conveniente es construir una **capa híbrida de datos**:

**An API of Ice and Fire** como fuente estructurada para personajes y casas; **A Wiki of Ice and Fire (AWOIAF)** como fuente para dragones, batallas, lugares y contenido enciclopédico; **Wikimedia Commons** como fuente preferente para imágenes que tengan una licencia reutilizable clara; y una pequeña colección propia de datos curados para conceptos inherentemente subjetivos como escenas, dúos, parejas, muertes y “mejor momento”. An API of Ice and Fire expone oficialmente recursos de libros, personajes y casas, funciona sin autenticación y sólo acepta lecturas GET. Sus personajes incluyen género, títulos, parentescos, casas, libros, apariciones televisivas e intérpretes; las casas incluyen región, lema, asientos, señores, armas ancestrales y miembros juramentados. citeturn1view0turn3view0turn3view1turn4view1

AWOIAF encaja especialmente bien como segunda fuente: actualmente declara más de 9.400 artículos, está construido con MediaWiki y mantiene categorías específicas para elementos del universo, incluidas batallas, dragones y geografía. Por ejemplo, su categoría de batallas contiene entradas como Blackwater, Whispering Wood y múltiples conflictos históricos; también organiza la geografía y ciudades por categorías. citeturn18search0turn18search1turn5search1turn10search1turn10search2

Mi arquitectura recomendada sería:

```text
                  FUENTES EXTERNAS
       ┌─────────────────────────────────────┐
       │ An API of Ice and Fire             │
       │ A Wiki of Ice and Fire / MediaWiki │
       │ Wikimedia Commons                  │
       └──────────────────┬──────────────────┘
                          │
                  import / sync / cache
                          │
                          ▼
                ┌─────────────────┐
                │    PostgreSQL   │
                │ datos propios + │
                │ datos cacheados │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ API TypeScript  │
                │ Fastify/Express │
                │    Render       │
                └────────┬────────┘
                         │
                         ▼
               ┌───────────────────┐
               │ React + Vite SPA  │
               │ Cloudflare Pages │
               │ o Render Static  │
               └───────────────────┘
```

La parte importante es que **tu frontend no consulte las wikis y APIs directamente cada vez que alguien abre una categoría**. Conviene importar, normalizar y cachear las opciones en tu propia base. Esto te da búsquedas rápidas, un formato uniforme, control sobre qué opciones aparecen, almacenamiento de licencias de imágenes y protección ante caídas o cambios de las fuentes. Además, An API of Ice and Fire establece un límite de 20.000 peticiones por IP y día y recomienda explícitamente aplicar caching. citeturn17view1

Para este proyecto concreto, yo elegiría:

| Componente | Recomendación |
|---|---|
| Frontend | React + Vite + TypeScript |
| API | Node + TypeScript + Fastify |
| Base de datos | PostgreSQL |
| ORM | Drizzle o Prisma |
| Hosting API | Render |
| Base de datos | Supabase Postgres |
| Imágenes propias futuras | Supabase Storage |
| Frontend | Cloudflare Pages o Render Static Site |
| Datos personajes/casas | An API of Ice and Fire |
| Dragones/batallas/lugares | AWOIAF |
| Imágenes reutilizables | Wikimedia Commons |
| Escenas/muertes/dúos/parejas | seed propio curado |

El backend podría ser perfectamente FastAPI/Python si ese ecosistema te acomoda más: Render documenta oficialmente tanto aplicaciones Fastify/Node como FastAPI. Para este caso prefiero TypeScript simplemente porque compartir tipos entre API y React simplifica bastante el proyecto. Render admite despliegues desde repositorios Git y requiere que el servidor escuche en `0.0.0.0` usando normalmente la variable `PORT`. citeturn23search0turn23search2turn23search4

## Fuentes que realmente sirven para construir el catálogo

### An API of Ice and Fire

Esta debería ser tu **fuente estructurada primaria**, pero no tu única fuente.

Su API pública dispone oficialmente de tres familias de recursos de dominio: `books`, `characters` y `houses`. No requiere API key ni login. citeturn17view0turn4view1

Para personajes entrega, entre otros:

```text
name
gender
culture
born
died
titles[]
aliases[]
father
mother
spouse
allegiances[]
books[]
povBooks[]
tvSeries[]
playedBy[]
```

Ese modelo está documentado oficialmente y sirve muy bien para “personaje favorito hombre”, “personaje favorito mujer”, “personaje más odiado”, “villano favorito”, “mejor desarrollo” y “personaje top 1”. citeturn3view0

También permite filtrar personajes por `name`, `gender`, `culture`, `born`, `died` e `isAlive`, por lo que podrías importar solamente personajes masculinos o femeninos cuando corresponda. citeturn3view0

Para casas entrega:

```text
name
region
coatOfArms
words
titles[]
seats[]
currentLord
heir
overlord
founded
founder
diedOut
ancestralWeapons[]
cadetBranches[]
swornMembers[]
```

Por tanto, “casa favorita” está prácticamente resuelta directamente desde esta API. Hay que tener presente que `coatOfArms` es una **descripción textual del blasón**, no una URL de imagen. citeturn3view1

Otro punto positivo es que la API ya contempla paginación. Las páginas empiezan en 1, el tamaño por defecto es 10, permite hasta 50 elementos por página y devuelve enlaces de navegación en el header `Link`. Esto facilita hacer un script de importación completo. citeturn17view0

Ejemplo:

```http
GET https://www.anapioficeandfire.com/api/characters?page=1&pageSize=50
```

La principal limitación es igual de importante: la documentación sólo define libros, personajes y casas. **No existe allí un recurso oficial equivalente para dragones, batallas, lugares, escenas, frases, parejas o muertes**, así que intentar adaptar toda tu app a esta API terminaría complicando el proyecto. citeturn17view0turn3view0turn3view1

### A Wiki of Ice and Fire

AWOIAF es probablemente el recurso más valioso para completar el catálogo. Es una wiki de fans especializada en el universo creado por George R. R. Martin, cubre novelas y también material relacionado con adaptaciones y, a septiembre de 2026, su portada informa 9.429 artículos. El sitio declara estar construido sobre MediaWiki. citeturn18search0turn18search6

Eso es especialmente útil porque MediaWiki tiene una **Action API estándar**. El módulo `categorymembers`, por ejemplo, permite listar todas las páginas pertenecientes a una categoría; `search` permite buscar títulos o contenido; e `imageinfo` permite obtener información de archivos multimedia. citeturn21search2turn22search0turn21search3

La base de la API de AWOIAF es:

```text
https://awoiaf.westeros.org/api.php
```

Conceptualmente, podrías hacer consultas como:

```http
GET /api.php?action=query
    &format=json
    &list=categorymembers
    &cmtitle=Category:Dragons
    &cmlimit=100
```

o:

```http
GET /api.php?action=query
    &format=json
    &list=categorymembers
    &cmtitle=Category:Battles
    &cmlimit=500
```

El formato de esos parámetros corresponde al módulo oficial `categorymembers` de MediaWiki: `cmtitle` identifica la categoría y `cmlimit` controla cuántos miembros se devuelven; el módulo admite hasta 500 por solicitud y proporciona continuación cuando existen más resultados. citeturn21search2

Para buscar un artículo:

```http
GET /api.php?action=query
    &format=json
    &list=search
    &srsearch=Jon%20Snow
```

El módulo oficial `list=search` busca por título y texto completo. citeturn22search0turn22search3

Esto es mucho mejor que implementar web scraping HTML con selectores CSS. Tendrás una interfaz JSON relativamente estable y podrás encapsularla en un `AwoiafClient` dentro de tu backend.

Además, las categorías existentes de AWOIAF coinciden sorprendentemente bien con tu proyecto. La categoría `Battles`, por ejemplo, ya reúne batallas y enfrentamientos de todo el universo, y existen taxonomías relacionadas para guerras, asedios y conflictos de períodos concretos como la Dance of the Dragons. citeturn18search1turn18search7turn18search13turn18search5

### Wikimedia Commons

Para imágenes, Commons es una fuente mucho más segura que simplemente copiar imágenes encontradas en Google, una wiki o una API de fans. Commons permite reutilizar sus archivos cuando se cumplen las condiciones de licencia correspondientes, aunque la propia Wikimedia advierte que hay que revisar el estado y las condiciones de **cada archivo individualmente**. citeturn21search1

Esto te permite almacenar para cada imagen algo como:

```json
{
  "imageUrl": "...",
  "imageSourceUrl": "...",
  "imageAuthor": "...",
  "imageLicense": "CC BY-SA 4.0",
  "imageAttribution": "..."
}
```

y luego mostrar un pequeño enlace o modal de créditos.

No esperaría encontrar una ilustración libre perfecta para cada personaje ficticio; por ello, conviene diseñar la aplicación de modo que la imagen sea **opcional**, no una dependencia obligatoria de cada opción.

### ThronesAPI y APIs similares

También existen proyectos más simples orientados a Game of Thrones, como ThronesAPI, que exponen personajes con campos de imagen y una interfaz Swagger de personajes/continentes. Técnicamente son muy atractivos para prototipar porque una tarjeta puede obtener inmediatamente nombre, título e imagen. citeturn8search0turn8search5

Sin embargo, **no la usaría como fuente principal de producción**. Su cobertura es mucho más reducida y enfocada en la serie televisiva, mientras que tu proyecto habla del universo de *A Song of Ice and Fire*. Además, en la documentación pública que revisé no encontré una política de reutilización de las imágenes tan clara como la que sí proporciona Wikimedia Commons. Para un prototipo visual podría ser una fuente secundaria; para el catálogo canónico utilizaría AIOIAF + AWOIAF.

## Cómo resolver las diecisiete categorías

Aquí está la parte más importante del diseño: **no todas tus categorías son entidades enciclopédicas**.

“Casa”, “personaje”, “dragón” o “lugar” son entidades objetivas que una API puede devolver. En cambio, “escena”, “mejor momento”, “dúo”, “pareja” o “muerte satisfactoria” son conceptos editoriales. Ninguna API puede decidir de manera limpia y universal qué constituye una opción válida para ellos.

Por eso usaría este mapa:

| Categoría | Tipo interno | Fuente recomendada | Estrategia |
|---|---|---|---|
| Casa favorita | `house` | An API of Ice and Fire | Importación automática |
| Personaje favorito hombre | `character` | An API of Ice and Fire | `gender=Male` |
| Personaje favorito mujer | `character` | An API of Ice and Fire | `gender=Female` |
| Escena favorita | `scene` | Propia + referencias AWOIAF | Curada |
| Personaje más odiado | `character` | An API of Ice and Fire | Mismo catálogo de personajes |
| Batalla favorita | `battle` | AWOIAF | `Category:Battles` + filtro |
| Dúo favorito | `duo` | Propia | Composición de dos personajes |
| Muerte más satisfactoria | `death` | Propia + personaje | Eventos curados |
| Muerte más triste | `death` | Propia + personaje | Mismo catálogo de muertes |
| Pareja favorita | `couple` | Propia | Composición de dos personajes |
| Villano favorito | `character` | Personajes + tags propios | Lista curada |
| Mejor momento | `moment` | Propia + AWOIAF | Eventos curados |
| Mejor desarrollo | `character` | An API of Ice and Fire | Catálogo personajes |
| Personaje top 1 | `character` | An API of Ice and Fire | Catálogo personajes |
| Dragón favorito | `dragon` | AWOIAF | Categoría Dragons |
| Lugar favorito | `place` | AWOIAF | Categorías geográficas |
| Frase favorita | `quote` | Propia + referencia fuente | Curada |

Esto aprovecha que AWOIAF mantiene categorías suficientemente ricas para batallas, dragones y geografía, en vez de obligarte a inventar esos catálogos. citeturn18search1turn5search1turn10search1turn10search2

### Por qué no mostrar absolutamente todo

Para un trend de dos personas, **tener 2.000 personajes no mejora la aplicación**. De hecho, puede empeorar considerablemente la experiencia.

AIOIAF pagina sus colecciones precisamente porque hay muchos registros; la API permite hasta 50 por página. citeturn17view0

Yo importaría todo para tenerlo disponible, pero marcaría opciones con algo así:

```text
active
featured
searchable
```

Entonces una categoría podría mostrar inicialmente:

```text
Jon Snow
Arya Stark
Sansa Stark
Daenerys Targaryen
Tyrion Lannister
Jaime Lannister
Cersei Lannister
Ned Stark
...
```

y ofrecer un campo **“Buscar otro personaje”** para acceder al catálogo completo.

Para dragones o batallas aplicaría aún más curación. AWOIAF posee muchas entradas históricas y batallas menores además de las más conocidas; la categoría de batallas incluye desde Blackwater hasta conflictos mucho más obscuros. citeturn18search1

### Escenas, momentos y muertes deberían ser objetos, no texto libre

Por ejemplo:

```json
{
  "id": "red-wedding",
  "type": "scene",
  "name": "The Red Wedding",
  "medium": "both",
  "era": "war-of-five-kings",
  "characters": [
    "catelyn-stark",
    "robb-stark"
  ],
  "imageUrl": null,
  "sourceUrl": "...",
  "spoilerLevel": "major"
}
```

Mientras que una muerte sería:

```json
{
  "id": "death-joffrey",
  "type": "death",
  "name": "Muerte de Joffrey Baratheon",
  "subjectId": "joffrey-baratheon",
  "eventId": "purple-wedding",
  "medium": "both",
  "spoilerLevel": "major"
}
```

La ventaja es que **“muerte más triste” y “muerte más satisfactoria” pueden usar exactamente el mismo catálogo `death`**. Sólo cambia la categoría donde el usuario selecciona la opción.

Lo mismo ocurre con personajes: no necesitas duplicar `Jon Snow` cinco veces porque aparece en cinco preguntas.

### Separar libros y series desde el principio

AWOIAF declara que cubre tanto el universo de las novelas como material de Game of Thrones, mientras que An API of Ice and Fire incluso incluye los campos `tvSeries` y `playedBy` junto con la bibliografía del personaje. citeturn18search6turn3view0

Por eso agregaría desde el día uno:

```ts
type Medium =
  | "books"
  | "game-of-thrones"
  | "house-of-the-dragon"
  | "both"
  | "general";
```

Aunque inicialmente no lo uses en la UI.

Esto evita problemas posteriores como:

> ¿“escena favorita” significa una escena televisiva o un capítulo/momento del libro?

> ¿La muerte de cierto personaje existe solamente en una adaptación?

> ¿El “villano favorito” puede incluir personajes de *Fire & Blood*?

También puedes tener una configuración global:

```json
{
  "scope": ["books", "game-of-thrones", "house-of-the-dragon"]
}
```

y filtrar opciones según el trend que quieran completar.

## Modelo de datos y diseño de tu propia API

No replicaría los esquemas completos de las wikis. Para esta app necesitas una representación mucho más pequeña.

### Modelo recomendado

Una estructura suficientemente flexible sería:

```sql
users
-----
id
slug
display_name
avatar_url

categories
----------
id
slug
label
option_type
sort_order

options
-------
id
type
slug
name
subtitle
image_url
image_source_url
image_license
image_author
source_provider
source_external_id
source_url
medium
metadata JSONB
active
featured

category_options
----------------
category_id
option_id
sort_order

choices
-------
id
user_id
category_id
option_id
created_at
updated_at

UNIQUE(user_id, category_id)
```

Con sólo **dos usuarios**, esto ya resuelve prácticamente toda la aplicación.

Ejemplo de usuarios seed:

```json
[
  {
    "id": "user-a",
    "slug": "user-a",
    "displayName": "Usuario A"
  },
  {
    "id": "user-b",
    "slug": "user-b",
    "displayName": "Usuario B"
  }
]
```

El frontend empieza con:

```text
¿Quién eres?

┌────────────────┐   ┌────────────────┐
│   Usuario A    │   │   Usuario B    │
│    Entrar      │   │    Entrar      │
└────────────────┘   └────────────────┘
```

y guarda la selección en:

```js
localStorage.setItem("selectedUser", "user-a");
```

Eso **no constituye autenticación ni seguridad**. Cualquier persona que pueda llamar a tu API podría enviar una elección identificándose como cualquiera de los dos usuarios. En una app personal/familiar esto puede ser una decisión perfectamente razonable; simplemente hay que asumirlo deliberadamente.

CORS tampoco solucionaría ese problema: controla qué orígenes pueden hacer ciertas llamadas desde navegadores, no demuestra quién es el usuario. Si en el futuro la URL se vuelve pública y quisieras proteger los votos, un PIN sencillo por usuario sería la evolución natural, sin necesidad de incorporar un sistema completo de cuentas.

### Una API muy pequeña es suficiente

Yo implementaría:

```http
GET /api/users
```

Respuesta:

```json
[
  { "id": "user-a", "name": "Persona A" },
  { "id": "user-b", "name": "Persona B" }
]
```

Luego:

```http
GET /api/categories
```

```json
[
  {
    "slug": "casa-favorita",
    "label": "Casa favorita",
    "type": "house",
    "position": 1
  },
  {
    "slug": "personaje-favorito-hombre",
    "label": "Personaje favorito hombre",
    "type": "character",
    "position": 2
  }
]
```

Opciones:

```http
GET /api/categories/casa-favorita/options
GET /api/categories/casa-favorita/options?q=stark
```

Selección:

```http
PUT /api/users/user-a/choices/casa-favorita

Content-Type: application/json

{
  "optionId": "house-stark"
}
```

Progreso:

```http
GET /api/users/user-a/choices
```

Y la pantalla final:

```http
GET /api/comparison
```

podría responder:

```json
{
  "categories": [
    {
      "category": {
        "slug": "casa-favorita",
        "label": "Casa favorita"
      },
      "userA": {
        "name": "House Stark",
        "imageUrl": "..."
      },
      "userB": {
        "name": "House Targaryen",
        "imageUrl": "..."
      },
      "sameChoice": false
    }
  ]
}
```

### No convertiría las fuentes externas en endpoints de usuario

Internamente tendría clientes como:

```text
src/
  integrations/
    iceAndFire/
      client.ts
      mapper.ts

    awoiaf/
      client.ts
      mapper.ts

    commons/
      client.ts
      mapper.ts
```

Y scripts:

```text
scripts/
  sync-characters.ts
  sync-houses.ts
  sync-dragons.ts
  sync-battles.ts
  sync-places.ts
  seed-curated-options.ts
```

El flujo ideal sería:

```text
AIOIAF
   │
   ├── characters ──┐
   └── houses ──────┤
                    │
AWOIAF               ├── normalize ──> options ──> PostgreSQL
   ├── dragons ─────┤
   ├── battles ─────┤
   └── places ──────┘

seed JSON
   ├── scenes
   ├── deaths
   ├── duos
   ├── couples
   └── quotes ───────────────────────> PostgreSQL
```

Luego el usuario **sólo habla con tu PostgreSQL a través de tu API**.

Esta estrategia también respeta mejor la infraestructura de terceros. MediaWiki recomienda cachear respuestas reutilizables, utilizar un `User-Agent` descriptivo y usar `maxlag` para tareas no interactivas; An API of Ice and Fire, por su parte, tiene su límite de 20.000 solicitudes diarias por IP. citeturn22search2turn22search10turn17view1

### Ejemplo del importador

Podría funcionar conceptualmente así:

```ts
for (let page = 1; ; page++) {
  const characters = await iceAndFire.getCharacters({
    page,
    pageSize: 50,
  });

  if (characters.length === 0) break;

  for (const character of characters) {
    if (!character.name.trim()) continue;

    await options.upsert({
      type: "character",
      sourceProvider: "an-api-of-ice-and-fire",
      sourceExternalId: extractId(character.url),

      name: character.name,
      metadata: {
        gender: character.gender,
        culture: character.culture,
        aliases: character.aliases,
        titles: character.titles,
        allegiances: character.allegiances,
        books: character.books,
        tvSeries: character.tvSeries,
        playedBy: character.playedBy,
      },
    });
  }
}
```

El `pageSize: 50` coincide con el máximo oficialmente documentado por la API. citeturn17view0

Para AWOIAF harías primero:

```text
Category:Dragons
          │
          ▼
categorymembers
          │
          ▼
[Balerion, Caraxes, Drogon, Meleys, ...]
          │
          ▼
resolver cada página
          │
          ▼
guardar nombre + fuente + imagen disponible
```

La wiki contiene precisamente una categoría de dragones con personajes como Balerion, Caraxes, Drogon, Meleys, Meraxes, Rhaegal, Sunfyre, Syrax, Vhagar y Viserion, entre otros. citeturn5search1

## Imágenes, licencias y el problema más importante del proyecto

Aquí hay una distinción fundamental:

> **Que una imagen tenga una URL pública no significa que tengas automáticamente permiso para reutilizarla.**

En AWOIAF, las contribuciones de **texto** están generalmente bajo CC-BY-SA. Pero la propia página de copyright advierte explícitamente que las imágenes **no deben asumirse bajo la misma licencia que el texto**. La wiki prefiere material libre o de dominio público, pero también puede tener material utilizado con permisos específicos u otras condiciones. citeturn21search0

Por lo tanto, hacer esto:

```json
{
  "image": "primera-imagen-que-encontre-en-la-wiki.jpg"
}
```

sin guardar información de procedencia sería una mala base técnica y legal.

### Guardaría siempre la procedencia de la imagen

Mi modelo sería:

```ts
interface ImageMetadata {
  url: string;
  sourceUrl: string;

  author?: string;
  license?: string;
  licenseUrl?: string;
  attribution?: string;

  verifiedForReuse: boolean;
}
```

Por ejemplo:

```json
{
  "url": "https://...",
  "sourceUrl": "https://...",
  "author": "Nombre del autor",
  "license": "CC BY-SA 4.0",
  "attribution": "Autor, CC BY-SA 4.0",
  "verifiedForReuse": true
}
```

MediaWiki dispone de `prop=imageinfo` precisamente para consultar información asociada a archivos, incluidos URL, dimensiones, historial y metadatos disponibles según la configuración del wiki. citeturn21search3

Para Commons, la propia guía de reutilización dice que la página individual del archivo muestra información aportada sobre titular del copyright y condiciones de licencia, y recomienda verificar cada archivo antes de reutilizarlo. citeturn21search1

### Estrategia de imagen que recomiendo

Aplicaría este orden:

```text
¿Existe imagen con licencia claramente reutilizable?
             │
      ┌──────┴──────┐
      │ sí          │ no
      ▼             ▼
 Commons /       ¿AWOIAF tiene
 licencia        licencia/permiso
 verificada?     comprobable?
                    │
               ┌────┴────┐
               │ sí      │ no
               ▼         ▼
             usar     placeholder
```

Esto significa que una tarjeta perfectamente válida puede verse así:

```text
┌─────────────────────────────┐
│                             │
│          STARK              │
│                             │
│       House Stark           │
│       The North             │
│                             │
│          [Elegir]           │
└─────────────────────────────┘
```

sin necesidad de tener una imagen.

Para casas incluso podrías diseñar un componente de fallback utilizando iniciales, nombre, región y la descripción textual `coatOfArms` que An API of Ice and Fire ya entrega. citeturn3view1

### Hotlink versus guardar una copia

Técnicamente Commons permite distintos métodos de reutilización, incluido enlazar directamente al archivo, aunque su documentación técnica indica que en general se recomienda descargar los archivos para reutilizarlos. citeturn21search14

Para tu proyecto yo distinguiría dos fases.

**En el MVP**, usaría la URL remota únicamente cuando la licencia y la fuente estén verificadas. Eso significa cero gestión propia de archivos.

**En una versión más estable**, un script podría descargar automáticamente imágenes válidas y subirlas a tu Storage. Eso no implica que tú tengas que “subir imágenes” manualmente: sería un pipeline automatizado.

Por ejemplo:

```text
Commons
   │
   │ licencia OK
   ▼
sync-images.ts
   │
   ▼
Supabase Storage
   │
   ▼
https://.../asoiaf/jon-snow.webp
```

Con esto evitas que un cambio de URL en un tercero deje tarjetas rotas y puedes optimizar tamaños.

### Cuidado especial con screenshots y fan art

AWOIAF señala que sus imágenes pueden incluir obras utilizadas con permiso y otro tipo de material, mientras insiste en que no se debe asumir que llevan la misma licencia que el texto. citeturn21search0

Por eso **no copiaría automáticamente screenshots de HBO ni fan art alojado en una wiki**, aunque técnicamente puedas descubrir la URL mediante la API.

La lógica del importador debería ser conservadora:

```ts
if (licenseIsClearlyReusable(image)) {
  importImage(image);
} else {
  usePlaceholder();
}
```

En un proyecto fan pequeño puede resultar tentador “usar lo que haya”, pero estructurar bien los metadatos de licencias ahora evita tener que revisar cientos de registros después.

### Frases también requieren prudencia

La categoría “frase favorita” merece un tratamiento similar. AWOIAF tiene artículos de personajes que contienen secciones de citas; por ejemplo, sus páginas pueden organizar “Quotes by” y “Quotes about” un personaje. citeturn7search1

Sin embargo, el hecho de que la redacción enciclopédica general de AWOIAF tenga licencia CC-BY-SA no transforma automáticamente los pasajes originales de los libros en texto libre; por eso evitaría poblar tu base con páginas enteras de citas literarias. La solución prudente para la app es almacenar sólo el fragmento corto que realmente sirve como opción, quién lo dijo y su referencia, en vez de convertir la aplicación en una base de datos de citas extensas.

## Despliegue y costos para tu caso

Tu idea de poner la API en Render encaja perfectamente con este tamaño de aplicación.

Render permite desplegar servicios web desde Git o una imagen Docker, asigna un dominio `onrender.com` y espera que el servidor escuche en `0.0.0.0`; el puerto predeterminado es `10000`, aunque recomiendan consumir la variable de entorno `PORT`. citeturn23search0turn23search1

Con Fastify:

```ts
await app.listen({
  host: "0.0.0.0",
  port: Number(process.env.PORT ?? 3000),
});
```

Render incluso advierte específicamente que Fastify escucha por defecto en localhost y que en Render debe utilizarse `0.0.0.0`. citeturn23search2

### Lo que no haría: SQLite en Render Free

Este punto es importante.

Render Free utiliza un filesystem efímero: los cambios hechos en disco, incluidos archivos subidos e incluso una base SQLite local, se pierden cuando el servicio se redeploya, reinicia o entra en suspensión. citeturn20search0turn20search8

Por tanto:

```text
❌ Render
   └── app
       └── data.sqlite
```

y:

```text
❌ Render
   └── uploads/
       └── jon-snow.jpg
```

no son diseños adecuados para datos que deban persistir en el plan gratuito. citeturn20search0

Usaría:

```text
Render API
     │
     ├──────── PostgreSQL en Supabase
     │
     └──────── Storage en Supabase, si después hace falta
```

### Render Free sí sirve para este MVP, con una molestia

Actualmente Render suspende un servicio web gratuito tras **15 minutos sin tráfico**. Cuando llega una nueva petición vuelve a arrancar y el proceso puede tardar alrededor de un minuto. También asigna 750 horas gratuitas de instancia por workspace y mes. citeturn20search0turn20search4

En una app privada para dos personas eso probablemente sea aceptable. El comportamiento sería algo como:

```text
Usuario abre la app
       │
       ▼
Frontend carga
       │
       ▼
GET API Render
       │
       ├── API despierta → puede tardar
       │
       ▼
resto de navegación rápida
```

Yo pondría una pantalla amigable del estilo “Despertando a los cuervos…” mientras el primer request intenta responder.

No intentaría evitar artificialmente el sleep haciendo pings periódicos.

### No elegiría el Postgres gratuito de Render para datos que quieras conservar

La documentación actual de Render indica que sus bases PostgreSQL gratuitas **expiran 30 días después de su creación**. citeturn20search0turn20search12

Eso la hace poco conveniente incluso para una app personal si quieres dejar tus selecciones guardadas meses.

Para tu caso prefiero Supabase.

En el plan gratuito actual, Supabase tiene una cuota de base de datos de 500 MB por proyecto, con 1 GB de disco; además ofrece 1 GB de Storage en el plan Free. citeturn20search1turn20search5

Tu app de dos personas consumiría una fracción diminuta de una base de ese tamaño mientras no intentes guardar imágenes como blobs dentro de PostgreSQL.

Neon es otra alternativa válida: su Free plan actual ofrece 0,5 GB de almacenamiento por proyecto. citeturn20search2

Mi elección sería:

```text
Supabase
```

porque en un mismo proyecto tendrás:

```text
PostgreSQL
+
Storage opcional
```

sin que estés obligado a utilizar Supabase Auth.

### Frontend

Para un React + Vite puro no necesitas un servidor Node activo. El build final son archivos estáticos.

Cloudflare Pages tiene una ventaja interesante: las peticiones a archivos estáticos son gratuitas e ilimitadas tanto en planes Free como pagados; el límite actual del Free plan es de 20.000 archivos por sitio. citeturn20search3turn20search7

Así que la estructura que elegiría sería:

```text
            Cloudflare Pages
               React/Vite
                   │
                   │ HTTPS
                   ▼
             Render Web Service
              Fastify API
                   │
                   ▼
          Supabase PostgreSQL
                   │
          ┌────────┴────────┐
          │                 │
     choices/options   Storage futuro
```

Esto te deja con costo inicial potencialmente **$0** sujeto a las cuotas y limitaciones actuales de cada proveedor. Render deja claro que sus recursos gratuitos están orientados a hobby/testing y tienen las restricciones descritas; Supabase y Cloudflare también aplican sus respectivas cuotas gratuitas. citeturn20search0turn20search5turn20search3

## Flujo del MVP y alcance que implementaría

No comenzaría construyendo las 17 categorías simultáneamente. Primero construiría la infraestructura con tres tipos suficientemente diferentes:

```text
Casa favorita       → API estructurada
Dragón favorito     → MediaWiki
Dúo favorito        → datos propios compuestos
```

Si esas tres funcionan, prácticamente habrás demostrado los tres patrones de datos que necesita toda la app.

### Datos iniciales

La primera importación podría hacer:

```text
An API of Ice and Fire
├── characters
└── houses

AWOIAF
├── Category:Dragons
├── Category:Battles
└── categorías geográficas

seed/
├── scenes.json
├── deaths.json
├── duos.json
├── couples.json
├── villains.json
├── moments.json
└── quotes.json
```

La API de Ice and Fire ya permite descargar personajes y casas paginando hasta 50 registros por llamada, mientras que MediaWiki proporciona `categorymembers` para recuperar miembros de categorías y continuación para colecciones mayores. citeturn17view0turn21search2

### El seed manual no debería verse como una desventaja

Para categorías subjetivas es, en realidad, la solución correcta.

Un archivo:

```json
[
  {
    "slug": "arya-sandor",
    "name": "Arya Stark + Sandor Clegane",
    "type": "duo",
    "members": [
      "arya-stark",
      "sandor-clegane"
    ],
    "featured": true
  },
  {
    "slug": "jaime-brienne",
    "name": "Jaime Lannister + Brienne of Tarth",
    "type": "duo",
    "members": [
      "jaime-lannister",
      "brienne-of-tarth"
    ],
    "featured": true
  }
]
```

es extremadamente fácil de mantener y no requiere dashboard de administración.

Además, esos miembros pueden apuntar a personajes ya importados, así que sigues reutilizando nombres, imágenes y metadatos de las fuentes externas.

### UX que mejor encaja con el “trend”

Yo evitaría mostrar las 17 preguntas en un formulario gigante.

La experiencia podría ser:

```text
┌───────────────────────────────────┐
│         A SONG OF ICE & FIRE      │
│                                   │
│              04 / 17              │
│                                   │
│          ESCENA FAVORITA          │
│                                   │
│  🔎 Buscar...                     │
│                                   │
│ ┌─────────┐ ┌─────────┐           │
│ │ opción  │ │ opción  │           │
│ └─────────┘ └─────────┘           │
│                                   │
│       ← Anterior   Siguiente →    │
└───────────────────────────────────┘
```

Cada selección se guarda inmediatamente:

```text
click opción
    │
    ▼
PUT /choices/...
    │
    ▼
✓ guardado
```

No necesitas un botón final “Guardar todo”.

Después:

```text
17 / 17
  │
  ▼
Ver mis respuestas
  │
  ▼
Esperar/mostrar las del otro usuario
  │
  ▼
Comparación
```

La pantalla de comparación sería donde realmente aparece el efecto del trend:

```text
                 CASA FAVORITA

          USER A              USER B

       ┌───────────┐       ┌───────────┐
       │   STARK   │       │ TARGARYEN │
       │           │   VS  │           │
       └───────────┘       └───────────┘


            PERSONAJE FAVORITO

       ┌───────────┐       ┌───────────┐
       │ Jon Snow  │       │   Arya    │
       └───────────┘       └───────────┘
```

Y cuando coinciden:

```text
              ❤️ MATCH ❤️
         Jaime Lannister
```

Esto incluso permite después generar una página vertical larga, parecida al formato de TikTok/Reel, para sacar captura o compartir.

### Añadiría control de spoilers desde el modelo

Dado que las fuentes cubren distintos períodos y obras del universo —AWOIAF incluye, por ejemplo, material de Dance of the Dragons además del período principal— conviene etiquetar las opciones con procedencia y nivel de spoiler. citeturn18search5turn18search9

Algo simple:

```ts
type SpoilerLevel =
  | "none"
  | "minor"
  | "major";

interface Option {
  medium: string;
  spoilerLevel: SpoilerLevel;
}
```

Después podrías tener:

```text
Contenido habilitado

[x] A Song of Ice and Fire
[x] Game of Thrones
[ ] House of the Dragon / Fire & Blood
```

sin modificar tu esquema de datos.

### Estructura de repositorio que usaría

Un monorepo simple sería suficiente:

```text
asoiaf-trend/
│
├── apps/
│   ├── web/
│   │   ├── src/
│   │   └── package.json
│   │
│   └── api/
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── integrations/
│       │   │   ├── ice-and-fire/
│       │   │   ├── awoiaf/
│       │   │   └── commons/
│       │   └── db/
│       │
│       └── package.json
│
├── packages/
│   └── shared/
│       └── src/
│           └── types.ts
│
├── data/
│   ├── scenes.json
│   ├── deaths.json
│   ├── duos.json
│   ├── couples.json
│   ├── villains.json
│   ├── moments.json
│   └── quotes.json
│
└── scripts/
    ├── sync-characters.ts
    ├── sync-houses.ts
    ├── sync-dragons.ts
    ├── sync-battles.ts
    └── sync-places.ts
```

Para sólo dos usuarios, no introduciría microservicios, Redis, colas, Kubernetes, GraphQL ni un CMS. Serían complejidad sin beneficio claro.

## Recomendación final

La clave del proyecto es **no pensar en “qué API tiene las 17 respuestas”**, porque esa API no existe. Conviene pensar en un **catálogo propio pequeño que sabe importar desde varias fuentes**.

La combinación que considero más sólida es:

```text
PERSONAJES
    └── An API of Ice and Fire

CASAS
    └── An API of Ice and Fire

DRAGONES
    └── A Wiki of Ice and Fire

BATALLAS
    └── A Wiki of Ice and Fire

LUGARES
    └── A Wiki of Ice and Fire

IMÁGENES
    ├── Wikimedia Commons, si licencia OK
    ├── medio externo con licencia verificada
    └── fallback gráfico si no hay imagen segura

ESCENAS
DÚOS
MUERTES
PAREJAS
VILLANOS
MOMENTOS
FRASES
    └── JSON curado por ti + relaciones con entidades importadas
```

AIOIAF es una buena columna vertebral porque ofrece datos estructurados de personajes/casas, acceso abierto sin autenticación y una paginación documentada; AWOIAF complementa justo las entidades que faltan mediante la taxonomía de MediaWiki; Commons aporta una ruta razonablemente controlable para multimedia con licencias explícitas. citeturn3view0turn3view1turn4view1turn17view0turn18search0turn21search2turn21search1

En infraestructura, para este MVP escogería **React/Vite en Cloudflare Pages + Fastify/TypeScript en Render + PostgreSQL y eventualmente Storage en Supabase**. Render es adecuado para la API mientras aceptes el cold start del plan gratuito; no usaría su filesystem para persistencia ni su Postgres Free como almacenamiento a largo plazo porque los archivos locales son efímeros y la base gratuita expira a los 30 días. Supabase ofrece actualmente 500 MB de cuota de base en Free y 1 GB de Storage, más que suficiente para la escala de una aplicación de dos usuarios. citeturn20search0turn20search1turn20search5turn23search2

La decisión que más te ahorrará trabajo a futuro es guardar **las fuentes externas como datos importados, no como dependencias en tiempo real**:

```text
Fuentes externas
      ↓
 importar
      ↓
normalizar
      ↓
 PostgreSQL
      ↓
  tu API
      ↓
frontend
```

Eso evita transformar la aplicación en un conjunto frágil de llamadas a cuatro sitios distintos, reduce las solicitudes externas, permite curar los resultados y preserva la información de atribución/licencia. Es también coherente con las recomendaciones de caching tanto de An API of Ice and Fire como de la Action API de MediaWiki. citeturn17view1turn22search12

Con ese diseño, **el MVP no necesita ningún sistema de subida manual de imágenes, ningún panel de administración y ningún sistema de autenticación**. Necesita sólo dos usuarios predefinidos, alrededor de siete tablas muy pequeñas, unos cuantos scripts de importación y archivos JSON para las categorías editoriales. Las imágenes pueden ser opcionales desde el modelo y añadirse automáticamente cuando exista una fuente cuya reutilización hayas verificado. Esa separación permite construir primero la experiencia del trend y dejar la parte más compleja —curaduría extensa de imágenes y contenido— como una mejora, en lugar de convertirla en un bloqueo para comenzar.