Kalliom Content Engine — MVP automatizado y de bajo consumo

1. Objetivo

Construir una aplicación interna que genere carruseles para LinkedIn de forma automática a partir de:

Tema

Título opcional

Cantidad de páginas

Categoría

Idioma

Tono

Llamado a la acción opcional

La aplicación debe:

Generar el contenido completo del carrusel con una sola llamada de IA de texto.

Seleccionar assets existentes sin usar IA.

Elegir una plantilla mediante reglas locales.

Componer todas las diapositivas con HTML y CSS.

Validar que no haya desbordamientos.

Exportar cada página como PNG.

Crear un PDF con todas las páginas.

Entregar también el texto para LinkedIn.

2. Regla principal

Todas las diapositivas deben medir exactamente:

1080 × 1350 px
Relación 4:5
Formato PNG

El lienzo nunca cambia de tamaño. El texto, las imágenes y los componentes deben adaptarse al lienzo.

Después de renderizar, Sharp debe comprobar las dimensiones de cada PNG. Si una sola página no mide exactamente 1080 × 1350, se cancela la creación del PDF.

3. Estrategia para consumir pocos tokens

Se usa IA únicamente para texto

La IA se utiliza una sola vez por carrusel para producir:

Título

Subtítulo

Contenido de todas las páginas

Cierre

Copy para LinkedIn

Etiquetas visuales para cada página

La respuesta debe ser un único JSON.

No se usa IA para estas tareas

Seleccionar assets

Elegir colores

Elegir plantillas

Posicionar elementos

Ajustar imágenes

Renderizar PNG

Crear el PDF

Numerar páginas

Añadir el logo

Añadir fondos o degradados

Estas tareas se resuelven mediante reglas locales, React, HTML, CSS, Playwright, Sharp y PDF-lib.

Reutilización

Antes de generar un carrusel, la aplicación debe revisar si ya existe contenido almacenado para el mismo tema o uno muy parecido.

Se debe guardar en caché:

Solicitud enviada al modelo

JSON generado

Carrusel final

Assets utilizados

Copy de LinkedIn

No repetir una llamada a IA cuando el usuario vuelve a exportar o editar un carrusel.

4. Flujo general

flowchart TD
    A[Usuario crea un proyecto] --> B[Ingresa tema, páginas, tono y categoría]
    B --> C{¿Existe contenido en caché?}

    C -- Sí --> E[Cargar JSON guardado]
    C -- No --> D[Una llamada de IA de texto]
    D --> F[Validar JSON]
    F --> G[Guardar JSON en caché]
    G --> E

    E --> H[Asignar tipo de página]
    H --> I[Seleccionar plantilla con reglas locales]
    I --> J[Buscar assets por etiquetas]
    J --> K[Componer slides en canvas fijo 1080x1350]
    K --> L[Validar textos, imágenes y overflow]

    L --> M{¿Todo cabe correctamente?}
    M -- No --> N[Ajustar tipografía o resumir localmente]
    N --> L
    M -- Sí --> O[Mostrar vista previa]

    O --> P{¿Usuario aprueba?}
    P -- No --> Q[Editar texto, plantilla o asset]
    Q --> L
    P -- Sí --> R[Renderizar PNG con Playwright]

    R --> S[Validar dimensiones con Sharp]
    S --> T{¿Todos son 1080x1350?}
    T -- No --> U[Cancelar exportación y mostrar error]
    T -- Sí --> V[Crear PDF con PDF-lib]

    V --> W[Generar ZIP]
    W --> X[Entregar PNG, PDF, JSON y copy]

5. Flujo de una publicación

sequenceDiagram
    participant U as Usuario
    participant A as Aplicación
    participant C as Caché
    participant AI as IA de texto
    participant AS as Biblioteca de assets
    participant R as Renderizador
    participant V as Validador
    participant P as Generador PDF

    U->>A: Tema + cantidad de páginas + categoría
    A->>C: Buscar contenido equivalente

    alt Existe en caché
        C-->>A: JSON guardado
    else No existe
        A->>AI: Una solicitud estructurada
        AI-->>A: JSON completo del carrusel
        A->>C: Guardar JSON
    end

    A->>AS: Buscar assets mediante etiquetas
    AS-->>A: Assets compatibles
    A->>A: Elegir plantillas con reglas
    A->>A: Construir slides 1080x1350
    A-->>U: Vista previa

    U->>A: Aprobar exportación
    A->>R: Renderizar cada slide
    R-->>V: PNG generados
    V->>V: Verificar 1080x1350

    alt Dimensiones válidas
        V->>P: Crear PDF
        P-->>U: PDF + PNG + copy + JSON
    else Dimensiones inválidas
        V-->>U: Error y exportación cancelada
    end

6. Entradas del usuario

type CreateCarouselInput = {
  topic: string;
  customTitle?: string;
  slideCount: number;
  category:
    | "automation"
    | "web"
    | "artificial-intelligence"
    | "analytics"
    | "business";
  language: "es" | "en";
  tone: "educational" | "direct" | "professional";
  callToAction?: string;
};

Reglas iniciales:

Mínimo: 3 páginas

Máximo: 10 páginas

Primera página: portada

Última página: cierre

Páginas intermedias: contenido

7. Salida única de la IA

La IA debe responder solamente con JSON válido.

{
  "title": "5 procesos que una pyme debería automatizar",
  "subtitle": "Menos tareas repetitivas, más tiempo para crecer",
  "category": "automation",
  "slides": [
    {
      "type": "cover",
      "title": "5 procesos que una pyme debería automatizar",
      "subtitle": "Menos tareas repetitivas, más tiempo para crecer",
      "visualTags": ["automation", "business", "workflow"]
    },
    {
      "type": "content",
      "number": 1,
      "title": "Responder preguntas frecuentes",
      "body": "Automatizar respuestas básicas reduce tiempos de espera y libera al equipo.",
      "highlight": "La atención rápida mejora la experiencia.",
      "visualTags": ["chatbot", "customer-service", "automation"]
    },
    {
      "type": "closing",
      "title": "Automatizar no significa perder el trato humano",
      "body": "Significa dedicar a las personas a las conversaciones que realmente lo necesitan.",
      "cta": "¿Qué proceso automatizarías primero?",
      "visualTags": ["business", "connection", "automation"]
    }
  ],
  "linkedin": {
    "hook": "Muchas empresas siguen usando tiempo valioso en tareas repetitivas.",
    "body": "Estos son cinco procesos que pueden simplificarse sin perder el control.",
    "question": "¿Qué proceso automatizarías primero?",
    "hashtags": ["#Automatización", "#Pymes", "#TransformaciónDigital"]
  }
}

No solicitar a la IA:

Código HTML

CSS

Imágenes

Coordenadas

Tamaños

Plantillas completas

8. Límites de texto

Portada

Título: 70 caracteres
Subtítulo: 110 caracteres

Contenido

Título: 55 caracteres
Cuerpo: 180 caracteres
Destacado: 90 caracteres

Cierre

Título: 75 caracteres
Cuerpo: 150 caracteres
CTA: 100 caracteres

El backend debe validar los límites aunque la IA haya recibido estas restricciones.

9. Biblioteca de assets

Para el MVP se puede comenzar con entre 40 y 60 assets. Posteriormente se amplía a 200.

public/assets/
├── automation/
├── robots/
├── laptops/
├── phones/
├── dashboards/
├── web/
├── ai/
├── analytics/
├── people/
├── backgrounds/
└── decorations/

Cada asset debe tener metadata:

type Asset = {
  id: string;
  path: string;
  category: string;
  tags: string[];
  orientation: "vertical" | "horizontal" | "square";
  transparent: boolean;
  compatibleLayouts: string[];
  active: boolean;
};

Ejemplo:

{
  "id": "automation-001",
  "path": "/assets/automation/automation-001.webp",
  "category": "automation",
  "tags": ["automation", "workflow", "business", "integration"],
  "orientation": "vertical",
  "transparent": true,
  "compatibleLayouts": ["asset-right", "asset-bottom"],
  "active": true
}

10. Selección de assets sin IA

La aplicación debe comparar las etiquetas de la página con las etiquetas de cada asset.

+5 por etiqueta exacta
+3 por categoría coincidente
+2 por plantilla compatible
+1 por orientación adecuada
-5 si el asset ya fue usado en el mismo carrusel
-3 si fue usado recientemente

Seleccionar el asset con mayor puntuación.

El usuario puede cambiarlo manualmente desde la vista previa.

11. Plantillas iniciales

El MVP necesita solamente tres plantillas:

cover

Logo arriba a la izquierda

Contador arriba a la derecha

Título y subtítulo

Asset principal

Fondo oscuro con elementos decorativos

content

Número de la sección

Título

Cuerpo

Caja de destacado

Asset lateral

closing

Mensaje final

CTA

Logo

Sitio web

Todas deben usar el mismo componente SlideCanvas.

12. Canvas obligatorio

export const SLIDE_WIDTH = 1080;
export const SLIDE_HEIGHT = 1350;

export function SlideCanvas({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      id="slide-canvas"
      style={{
        position: "relative",
        width: `${SLIDE_WIDTH}px`,
        height: `${SLIDE_HEIGHT}px`,
        minWidth: `${SLIDE_WIDTH}px`,
        maxWidth: `${SLIDE_WIDTH}px`,
        minHeight: `${SLIDE_HEIGHT}px`,
        maxHeight: `${SLIDE_HEIGHT}px`,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

No usar vw o vh en el render final.

La vista previa puede usar transform: scale(...), pero el canvas interno debe conservar 1080 × 1350.

13. Área segura

Superior: 70 px
Inferior: 70 px
Izquierda: 80 px
Derecha: 80 px

El texto importante debe permanecer dentro del área segura.

Los fondos y decoraciones pueden extenderse hasta los bordes del canvas.

14. Ajuste automático del texto

Orden de ajuste:

Tamaño ideal

Reducir fuente dentro de límites

Reducir interlineado

Cambiar a una variante con más espacio

Mostrar error de validación

No realizar una segunda llamada a IA automáticamente para resumir. Esto evita tokens adicionales.

El usuario puede pulsar un botón opcional de “Resumir con IA” si lo necesita.

const TITLE_FONT_SIZES = [74, 68, 62, 56];
const BODY_FONT_SIZES = [34, 32, 30, 28];

15. Validaciones

Antes de exportar:

[ ] Cantidad correcta de páginas
[ ] Portada presente
[ ] Cierre presente
[ ] Todos los textos dentro de límites
[ ] Ningún elemento sale del canvas
[ ] Ningún texto tiene overflow
[ ] Todos los assets cargaron
[ ] Todas las fuentes cargaron
[ ] Contadores correctos
[ ] Canvas fijo 1080x1350

Después de exportar cada PNG:

const metadata = await sharp(filePath).metadata();

if (metadata.width !== 1080 || metadata.height !== 1350) {
  throw new Error("INVALID_SLIDE_DIMENSIONS");
}

No crear el PDF hasta que todas las imágenes sean válidas.

16. Exportación

Generar:

exports/
└── nombre-del-proyecto/
    ├── carousel.pdf
    ├── linkedin-copy.txt
    ├── carousel-data.json
    └── slides/
        ├── slide-01.png
        ├── slide-02.png
        ├── slide-03.png
        └── ...

Opcionalmente generar un ZIP con todo el contenido.

17. Tecnologías

Next.js
TypeScript
React
Tailwind CSS
Zod
Playwright
Sharp
PDF-lib
Prisma
SQLite para desarrollo
PostgreSQL para producción

Para el MVP no se necesitan agentes, LangGraph, embeddings ni base vectorial.

18. Modelo de datos simplificado

type Project = {
  id: string;
  topic: string;
  title: string;
  slideCount: number;
  category: string;
  language: string;
  tone: string;
  status: "draft" | "generated" | "approved" | "exported";
  aiCacheKey?: string;
  linkedInCopy?: string;
  createdAt: Date;
  updatedAt: Date;
};

type Slide = {
  id: string;
  projectId: string;
  order: number;
  type: "cover" | "content" | "closing";
  title: string;
  subtitle?: string;
  body?: string;
  highlight?: string;
  cta?: string;
  visualTags: string[];
  templateId: string;
  assetId?: string;
};

19. Endpoints

POST /api/projects
POST /api/projects/:id/generate
GET  /api/projects/:id
PUT  /api/projects/:id
POST /api/projects/:id/validate
POST /api/projects/:id/render
POST /api/projects/:id/export
GET  /api/assets

La generación debe ser idempotente:

Crear un hash con los datos normalizados de entrada.

Buscar el hash en caché.

Reutilizar el JSON si ya existe.

Solo llamar a la IA cuando no exista.

20. Seguridad y controles

Validar todas las entradas con Zod.

No exponer claves de IA en el navegador.

Ejecutar llamadas al modelo únicamente en el servidor.

Limitar la cantidad de páginas.

Limitar longitud del tema y demás campos.

Escapar contenido antes de renderizar.

No permitir HTML generado por la IA.

Validar MIME y extensión de assets.

Evitar rutas arbitrarias de archivos.

Limitar tamaño máximo de uploads.

Usar nombres internos generados para archivos.

Aplicar rate limiting al endpoint de generación.

Registrar consumo estimado por proyecto.

No guardar claves ni prompts sensibles en los logs.

Cancelar el PDF cuando falle una validación.

No permitir que el usuario cambie las dimensiones del canvas.

21. Estructura de carpetas

src/
├── app/
│   ├── dashboard/
│   ├── projects/
│   │   └── [projectId]/
│   ├── api/
│   │   ├── projects/
│   │   ├── generate/
│   │   ├── validate/
│   │   ├── render/
│   │   └── export/
│   └── render/
│       └── [projectId]/
├── components/
│   ├── editor/
│   ├── slides/
│   │   ├── SlideCanvas.tsx
│   │   ├── SlideHeader.tsx
│   │   └── SlideCounter.tsx
│   └── templates/
│       ├── CoverTemplate.tsx
│       ├── ContentTemplate.tsx
│       └── ClosingTemplate.tsx
├── lib/
│   ├── ai/
│   │   ├── generateCarousel.ts
│   │   ├── prompt.ts
│   │   └── schema.ts
│   ├── assets/
│   │   ├── selectAsset.ts
│   │   └── scoreAsset.ts
│   ├── cache/
│   │   └── generationCache.ts
│   ├── rendering/
│   │   ├── renderSlides.ts
│   │   ├── validateDimensions.ts
│   │   └── createPdf.ts
│   └── validation/
├── prisma/
├── public/
│   ├── assets/
│   └── brand/
└── exports/

22. Fases de desarrollo

Fase 1 — Motor visual

Proyecto Next.js

Canvas fijo

Tema Kalliom

Tres plantillas

Datos simulados

Vista previa

Render PNG

Validación exacta

PDF

Fase 2 — Biblioteca de assets

Metadata local

Buscador

Selector por etiquetas

Penalización por repetición

Cambio manual de asset

Fase 3 — Automatización con IA

Una llamada por carrusel

JSON con Zod

Caché por hash

Generación de todas las páginas

Copy para LinkedIn

Fase 4 — Editor y producción

Edición manual

Reordenamiento

Regeneración opcional

Exportación ZIP

Historial de proyectos

23. Criterios de aceptación del MVP

El MVP está terminado cuando:

El usuario escribe un tema y escoge el número de páginas.

La aplicación realiza como máximo una llamada de IA.

El modelo devuelve todo el contenido en un único JSON.

Los assets se seleccionan mediante reglas locales.

Las plantillas se asignan mediante reglas locales.

El usuario ve una vista previa.

Puede cambiar textos o assets.

Cada PNG mide exactamente 1080 × 1350.

El PDF conserva la misma proporción en todas las páginas.

Volver a exportar no consume tokens.

Volver a abrir el proyecto no consume tokens.

Un tema ya almacenado puede reutilizar el contenido en caché.

---

## Estado de implementación

### Fase 1 — completada

Motor visual Next.js, canvas fijo 1080 × 1350, tres plantillas, preview, Playwright, Sharp y PDF-lib.

### Fase 2 — completada

- Biblioteca de 116 recursos únicos: 100 SVG locales y 16 imágenes WebP originales en estilos 3D, fotográfico, clay, industrial, isométrico, risográfico, vidrio, neón, papercut, low-poly y cinematográfico.
- Nuevas escenas con robots, asistentes, colaboración humano-IA, equipos, automatización industrial, analítica y comercio digital.
- 20 conceptos por categoría, con posiciones, escalas y orientaciones equilibradas.
- Metadata tipada en `src/lib/assets/catalog.ts`.
- Búsqueda por texto, categoría y etiquetas.
- Scoring local: etiquetas, categoría, plantilla, orientación, repetición y uso reciente.
- Desempate determinista basado en proyecto, página y asset.
- Asignación automática sin repetir assets ni posiciones mientras existan candidatos disponibles.
- Selector manual curado en cada página: primero muestra los visuales de mayor calidad y conserva la biblioteca completa para compatibilidad.
- La selección manual se envía al endpoint y queda reflejada en PNG, PDF y `carousel-data.json`.
- La búsqueda, selección, puntuación y reutilización de assets funcionan localmente y no llaman a la IA durante la creación o exportación de carruseles.

Para reconstruir la biblioteca vectorial determinista:

```bash
npm run assets:seed
```

### Fase 3 — completada

- Formulario con tema, título opcional, 3–10 páginas, categoría, idioma, tono y CTA.
- Responses API con Structured Outputs y schema Zod.
- Una solicitud que genera todo el carrusel y el copy de LinkedIn.
- `gpt-5.6-terra` como modelo equilibrado entre calidad y consumo, configurable mediante `OPENAI_MODEL`.
- Máximo de un reintento, exclusivamente para reparar JSON sintácticamente inválido.
- Hash SHA-256 sobre la entrada normalizada.
- Caché idempotente en Prisma/SQLite.
- Persistencia de proyectos, páginas, assets, copy y consumo estimado.
- Cache hit con cero llamadas nuevas al modelo.
- Preview, render y reexportación sin llamadas de IA.
- Rate limit del endpoint de generación.
- Clave de OpenAI disponible únicamente en el servidor.

Configuración inicial:

```bash
cp .env.example .env.local
npm run db:generate
npm run db:push
npm run db:seed-demo
npm run dev
```

Agrega `OPENAI_API_KEY` en `.env.local` para generar solicitudes nuevas. El seed permite probar el formulario predeterminado desde caché sin consumir tokens.

Endpoints incorporados:

```text
POST /api/projects/generate
GET  /api/projects
GET  /api/projects/:projectId
PATCH /api/projects/:projectId
PATCH /api/projects/:projectId/state
POST /api/projects/:projectId/validate
POST /api/projects/:projectId/export
GET  /api/projects/:projectId/export?format=pdf
GET  /render/:projectId/:slideId
```

### Fase 4 — completada

- Editor manual para títulos, subtítulos, cuerpos, destacados, CTA y descripción de LinkedIn.
- Contadores y límites de caracteres visibles en cada campo.
- Reordenamiento seguro de páginas de contenido, conservando portada y cierre.
- Quince plantillas: cinco portadas, cinco composiciones de contenido y cinco cierres con jerarquías y uso del espacio diferentes.
- Asignación local variada en proyectos nuevos y acción `Variar diseño` para remezclar proyectos existentes sin consumir tokens.
- Dirección editorial creativa por tema para alternar contraste, tensión, errores, escenas, causa-efecto y principios contraintuitivos sin relajar la veracidad.
- Cambio manual de asset persistido junto al proyecto.
- Regeneración opcional y explícita, con advertencia de que consume una nueva llamada y reemplaza la caché.
- Guardado transaccional en Prisma/SQLite sin llamadas adicionales de IA.
- Historial ordenado por última modificación y reapertura con cero consumo.
- Validación visual con Playwright: canvas, assets, safe area, dimensiones y overflow.

### Fase 5 — completada

- Producción por lotes de hasta 20 temas, cada uno con su propia fecha opcional.
- Configuración independiente por publicación del lote: páginas, categoría, idioma, tono, perfil, estilo visual y fecha.
- Calendario editorial con estados de idea, revisión, aprobado, programado y publicado.
- Memoria editorial que incluye publicaciones recientes en el prompt y alerta por similitud.
- Cinco direcciones visuales: equilibrada, minimalista, impactante, assets protagonistas y texto protagonista.
- Revisión local de calidad para repetición, clichés, CTA, variedad visual, assets e historial.
- Regeneración parcial de título, página, CTA o descripción mediante una sola llamada estructurada.
- Cinco perfiles editoriales reutilizables.
- Espacio de trabajo compacto con vistas separadas para editar, crear y consultar el calendario.
- Editor maestro-detalle: navegador de páginas, una sola vista previa activa y controles de edición en el mismo nivel, sin recorrer todas las diapositivas.
- Historial lateral persistente, acciones de producción fijas y formularios de creación simple/lote conmutables.
- Catálogo visible de sesenta y tres plantillas: veintiuna portadas, veintiuna páginas de contenido y veintiún cierres.
- Dieciocho familias nuevas rompen la retícula convencional con ondas, arcos, radares, collages, escaleras, circuitos, tickets y tipografía monumental, conservando únicamente la paleta Kalliom.
- Cuarenta y una construcciones de fondo diferenciadas con retículas, terminales, mosaicos, portales, planos técnicos, dashboards, focos, franjas, horizontes y ondas; todas conservan la paleta Kalliom.
- Selección automática distribuida por proyecto y tema para evitar que publicaciones con el mismo estilo visual reciban siempre la misma portada.
- Ajuste tipográfico por densidad y detección geométrica de colisiones entre título, cuerpo, destacado y CTA.
- Fallback visual seguro durante la exportación: si una composición elegida no admite un texto excepcionalmente largo, el PDF usa automáticamente una plantilla compatible sin bloquear la descarga.
- Límites editoriales ampliados con reducción tipográfica progresiva para textos largos.
- Exportación simplificada: el botón genera y descarga directamente un PDF con el título del proyecto como nombre.
- Biblioteca visual de publicaciones con arrastre entre `Nuevas`, `Ya usadas` y `No me interesan`; el estado queda persistido y cada bandeja tiene desplazamiento propio.
- La integración externa de LinkedIn fue retirada; el calendario se conserva como planificación interna y la publicación se realiza manualmente con el PDF descargado.
- Estados de producción `draft`, `generated` y `exported`.

La edición, validación, apertura del historial y exportación no importan ni invocan el motor de IA.

La base `prisma/dev.db`, las claves y los archivos exportados están excluidos de Git.
