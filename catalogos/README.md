# Catálogos y flyers — Pekín Global Parts

Generadores para producir **catálogos de precios** (PDF) y **flyers de oferta** (PNG)
con la marca de Pekín, listos para enviar por WhatsApp. Son scripts independientes:
**no forman parte de la app Next.js**, viven aquí para no perderse entre sesiones.

## Estructura
```
catalogos/
  generar-catalogo.mjs   → catálogo de varias piezas (PDF). Portada + secciones por categoría.
  flyer.mjs              → flyer de 1 pieza en oferta (PNG).
  data/                  → los datos (edítalos aquí: precios, códigos, etc.)
    tair-renting.json      lista de precios exclusiva (con precios)
    flyer-copa.json        ejemplo de flyer
  assets/
    logo-pekin.jpg       → el logo (fondo rojo)
    fotos/<codigo>.png   → la foto de cada pieza, nombrada por su CÓDIGO
    logos/<MARCA>.png    → logo de cada marca (BOTELLI, 555, KOYO, DEPO, SKF...)
  salida/                → aquí caen los HTML/PDF/PNG generados (no se versiona)
```

## Cómo usarlo
```bash
# Catálogo de precios (genera salida/tair-renting.pdf)
node catalogos/generar-catalogo.mjs catalogos/data/tair-renting.json

# Flyer de oferta (genera salida/flyer-<codigo>.png)
node catalogos/flyer.mjs catalogos/data/flyer-copa.json
```
Si hay Chromium en la máquina, el PDF/PNG se crea solo. En las sesiones de Claude
Code en la web ya está disponible.

## Cómo agregar una pieza
1. Pon su **foto** en `assets/fotos/` con el nombre = su **código** (ej. `SB-3882.png`).
   Fondo blanco se ve mejor. Si falta la foto, sale un recuadro "FOTO PRÓXIMAMENTE".
2. Pon el **logo** de la marca en `assets/logos/` (ej. `KOYO.png`). Si no hay, va el
   nombre en texto.
3. Agrega la fila en el JSON de `data/`:
   ```json
   {"categoria":"SUSPENSIÓN Y DIRECCIÓN","marca":"555","repuesto":"Rótula superior",
    "codigo":"SB-3882","modelo":"Hilux 1GD / 2GD","precio":"69"}
   ```
4. Corre el generador de nuevo.

- `mostrarPrecios: false` en el JSON → catálogo **público sin precios**.
- Reglas de precio: ver `PEKIN-PREFERENCIAS.md` (precios de proveedor **con IGV incluido**;
  no multiplicar por 1.18).

## Pendiente de reponer (se perdió en un reinicio)
Faltan en `assets/fotos/` y `assets/logos/` las imágenes del zip `brochure_hilux`
(rótulas, terminal, rack, bieleta, faros, espejo, rodaje, parachoques, y logos
555/KOYO/DEPO/SKF). Al volver a subirlas con el nombre correcto, el catálogo de Tair
queda otra vez al 100%.
