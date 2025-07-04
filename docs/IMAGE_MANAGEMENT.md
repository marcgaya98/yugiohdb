# Gestión de Imágenes de Cartas Yu-Gi-Oh!

Este documento explica cómo funciona el sistema de gestión de imágenes de cartas en YuGiOh DB.

## 📋 Descripción General

El sistema de gestión de imágenes permite:
- Descargar y almacenar imágenes de cartas localmente
- Servir imágenes con caché optimizado
- Descarga automática bajo demanda
- Tres formatos de imagen: normal, small, cropped
- API REST para gestión de imágenes

## 🏗️ Arquitectura

### Estructura de Directorios
```
public/images/cards/
├── normal/     # Imágenes en tamaño normal
├── small/      # Imágenes pequeñas para listas
└── cropped/    # Imágenes recortadas para vistas previas
```

### Componentes Principales

1. **`ImageDownloader`** (`scripts/downloadCardImages.js`)
   - Descarga masiva de imágenes desde YGOPRODeck
   - Procesamiento en lotes con control de concurrencia
   - Manejo de errores y reintentos

2. **`ImageCacheMiddleware`** (`middleware/imageCache.js`)
   - Servir imágenes con caché agresivo
   - Descarga automática si la imagen no existe
   - Manejo de ETags para 304 Not Modified

3. **Extensiones del Modelo Card** (`models/Card.js`)
   - Métodos para generar URLs de imágenes
   - Validación de disponibilidad de imágenes
   - Serialización con URLs incluidas

4. **API Routes** (`routes/imageRoutes.js`)
   - Estadísticas de imágenes
   - Gestión de descarga y limpieza
   - Listado de imágenes faltantes

## 🚀 Uso

### Descargar Todas las Imágenes

```bash
# Usando npm script
npm run download:images

# Directamente
node scripts/downloadCardImages.js
```

### Migrar URLs en Base de Datos

```bash
# Migrar a URLs locales
npm run migrate:image-urls

# Verificar estado
npm run check:image-urls

# Revertir a URLs externas
npm run revert:image-urls
```

### API Endpoints

#### Obtener Estadísticas
```http
GET /api/images/stats
```

Respuesta:
```json
{
  "baseDirectory": "/path/to/images",
  "imageTypes": ["normal", "small", "cropped"],
  "totalImages": 15000,
  "normalCount": 5000,
  "smallCount": 5000,
  "croppedCount": 5000,
  "totalSize": 2147483648,
  "totalSizeFormatted": "2.0 GB"
}
```

#### Iniciar Descarga Masiva
```http
POST /api/images/download
```

#### Listar Imágenes Faltantes
```http
GET /api/images/missing?type=normal&limit=50&offset=0
```

#### Limpiar Imágenes Huérfanas
```http
DELETE /api/images/cleanup
```

#### Eliminar Imagen Específica
```http
DELETE /api/images/:type/:password
```

### URLs de Imágenes de Cartas

Con el modelo Card actualizado:

```javascript
// Obtener carta con URLs de imágenes
const card = await Card.findOneWithImages({ 
  where: { id: 1 } 
}, 'http://localhost:3000');

console.log(card.images);
// {
//   normal: "http://localhost:3000/images/cards/normal/89631139.jpg",
//   small: "http://localhost:3000/images/cards/small/89631139.jpg",
//   cropped: "http://localhost:3000/images/cards/cropped/89631139.jpg"
// }

// Métodos de instancia
card.getImageUrls('http://localhost:3000');
card.getImageUrl('small', 'http://localhost:3000');
card.hasImages(); // true si tiene password
```

## ⚙️ Configuración

### Variables de Entorno

No se requieren variables adicionales. El sistema usa la configuración existente de la base de datos.

### Docker

Las imágenes se persisten automáticamente en un volumen Docker:

```yaml
volumes:
  - yugioh-images:/usr/src/app/public/images/cards
```

### Caché y Rendimiento

El middleware de caché está configurado para:
- **Cache-Control**: `public, max-age=31536000, immutable` (1 año)
- **ETags**: Basados en fecha de modificación y tamaño
- **304 Not Modified**: Para reducir transferencia de datos

## 🔧 Configuración Avanzada

### Limitar Concurrencia de Descarga

Editar `scripts/downloadCardImages.js`:

```javascript
this.maxConcurrent = 5; // Reducir para servidores con menos recursos
```

### Personalizar Timeout de Descarga

Editar `middleware/imageCache.js`:

```javascript
const response = await fetch(url, {
  timeout: 30000, // 30 segundos
  // ...
});
```

### Optimización de Almacenamiento

```bash
# Comprimir imágenes existentes (opcional)
find public/images/cards -name "*.jpg" -exec jpegoptim --max=85 {} \;

# Verificar uso de disco
du -sh public/images/cards/*
```

## 🖼️ Optimización de Imágenes

### Compresión Automática de Imágenes

Para reducir el espacio en disco y mejorar los tiempos de carga, se recomienda comprimir automáticamente todas las imágenes JPEG tras su descarga. Esto puede hacerse con herramientas como `jpegoptim`, `mozjpeg` o mediante procesamiento en Node.js con `sharp`.

**Ejemplo con jpegoptim (bash):**

```bash
find public/images/cards -name "*.jpg" -exec jpegoptim --max=85 --strip-all {} \;
```

**Ejemplo con sharp (Node.js):**

```js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = 'public/images/cards/normal';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.jpg')) {
    const filePath = path.join(dir, file);
    sharp(filePath)
      .jpeg({ quality: 85 })
      .toBuffer()
      .then(data => fs.writeFileSync(filePath, data));
  }
});
```

**Recomendaciones:**
- Integrar la compresión en el script de descarga (`downloadCardImages.js`) o como paso post-procesamiento.
- Comprimir también las variantes `small` y `cropped`.
- Validar la integridad de las imágenes tras la compresión.

### Formato WebP para Navegadores Modernos

El formato WebP ofrece mejor compresión y calidad que JPEG. Se recomienda generar variantes `.webp` de cada imagen y servirlas a navegadores compatibles.

**Generar WebP automáticamente (Node.js + sharp):**

```js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = 'public/images/cards/normal';
const outDir = 'public/images/cards/normal_webp';
fs.mkdirSync(outDir, { recursive: true });
fs.readdirSync(srcDir).forEach(file => {
  if (file.endsWith('.jpg')) {
    const srcPath = path.join(srcDir, file);
    const outPath = path.join(outDir, file.replace('.jpg', '.webp'));
    sharp(srcPath)
      .webp({ quality: 80 })
      .toFile(outPath);
  }
});
```

**Servir WebP en Express según el navegador:**

```js
// middleware/webpRedirect.js
module.exports = (req, res, next) => {
  if (req.accepts('image/webp')) {
    const webpPath = req.path.replace(/\.jpg$/, '.webp');
    if (fs.existsSync(path.join(__dirname, '../public', webpPath))) {
      req.url = webpPath;
    }
  }
  next();
};
```

Y en `app.js`:

```js
const webpRedirect = require('./middleware/webpRedirect');
app.use('/images/cards/normal', webpRedirect);
```

**Exponer URLs WebP en la API:**

El modelo `Card` puede incluir URLs WebP en el objeto `images`:

```js
images: {
  normal: '.../normal/12345678.jpg',
  normal_webp: '.../normal_webp/12345678.webp',
  // ...
}
```

**Best Practices:**
- Mantener las variantes JPEG y WebP para máxima compatibilidad.
- Usar `<picture>` en el frontend para cargar WebP si está disponible:

```html
<picture>
  <source srcset="/images/cards/normal_webp/12345678.webp" type="image/webp">
  <img src="/images/cards/normal/12345678.jpg" alt="...">
</picture>
```
- Considerar la negociación de contenido (Accept header) para servir WebP automáticamente.
- Automatizar la generación de WebP tras la descarga o actualización de imágenes.

---

## 🚀 Próximas Mejoras

- [ ] Compresión automática de imágenes (ver sección Optimización de Imágenes)
- [ ] Integración con CDN (CloudFlare, AWS CloudFront)
- [ ] Formato WebP para navegadores modernos (ver sección Optimización de Imágenes)
- [ ] Lazy loading y responsive images
- [ ] Watermarks automáticos

## 🔧 Mantenimiento

### Actualización Periódica

Configurar cron job para descargar nuevas cartas:

```bash
# Agregar al crontab
0 2 * * 0 cd /path/to/yugiohdb && npm run download:images
```

### Backup de Imágenes

```bash
# Crear backup
tar -czf images-backup-$(date +%Y%m%d).tar.gz public/images/cards/

# Restaurar backup
tar -xzf images-backup-20250704.tar.gz
```

## 📝 Notas Importantes

1. **Aspectos Legales**: Las imágenes se descargan de YGOPRODeck API. Asegúrate de cumplir con sus términos de uso.

2. **Espacio en Disco**: Las imágenes pueden ocupar varios GB. Monitorea el espacio disponible.

3. **Ancho de Banda**: La descarga inicial puede consumir ancho de banda significativo.

4. **Redundancia**: Considera usar un CDN para producción con alta disponibilidad.

5. **Eliminación de ceros a la izquierda**: Todas las rutas y nombres de archivo de imágenes usan el password sin ceros a la izquierda para evitar inconsistencias (por ejemplo, `00013039` → `13039.jpg`).

6. **Solo se almacena la ruta principal**: Las variantes se generan siempre en la API y no requieren migraciones adicionales en la base de datos.

## 🚨 Solución de Problemas

### Error: Timeout de Descarga

```bash
# Verificar conectividad
curl -I https://images.ygoprodeck.com/images/cards/89631139.jpg

# Aumentar timeout en el código
```

### Error: Espacio en Disco Insuficiente

```bash
# Verificar espacio disponible
df -h

# Limpiar imágenes huérfanas
npm run clean:images
```

### Error: Permisos de Escritura

```bash
# Verificar permisos
ls -la public/images/

# Corregir permisos
chmod -R 755 public/images/cards/
```

### Verificar Integridad de Imágenes

```bash
# Verificar archivos corruptos
find public/images/cards -name "*.jpg" -exec file {} \; | grep -v "JPEG image data"

# Eliminar archivos de 0 bytes
find public/images/cards -name "*.jpg" -size 0 -delete
```

## 📊 Monitoreo

### Logs de Descarga

Los logs incluyen:
- Progreso de descarga en tiempo real
- Errores de conectividad
- Estadísticas de rendimiento
- Archivos corruptos o faltantes

### Métricas de Rendimiento

```javascript
// En tu aplicación
const stats = await fetch('/api/images/stats').then(r => r.json());
console.log(`Imágenes disponibles: ${stats.totalImages}`);
console.log(`Espacio usado: ${stats.totalSizeFormatted}`);
```

## 🔄 Mantenimiento

### Actualización Periódica

Configurar cron job para descargar nuevas cartas:

```bash
# Agregar al crontab
0 2 * * 0 cd /path/to/yugiohdb && npm run download:images
```

### Backup de Imágenes

```bash
# Crear backup
tar -czf images-backup-$(date +%Y%m%d).tar.gz public/images/cards/

# Restaurar backup
tar -xzf images-backup-20250704.tar.gz
```

## 📝 Notas Importantes

1. **Aspectos Legales**: Las imágenes se descargan de YGOPRODeck API. Asegúrate de cumplir con sus términos de uso.

2. **Espacio en Disco**: Las imágenes pueden ocupar varios GB. Monitorea el espacio disponible.

3. **Ancho de Banda**: La descarga inicial puede consumir ancho de banda significativo.

4. **Redundancia**: Considera usar un CDN para producción con alta disponibilidad.

5. **Eliminación de ceros a la izquierda**: Todas las rutas y nombres de archivo de imágenes usan el password sin ceros a la izquierda para evitar inconsistencias (por ejemplo, `00013039` → `13039.jpg`).

6. **Solo se almacena la ruta principal**: Las variantes se generan siempre en la API y no requieren migraciones adicionales en la base de datos.
