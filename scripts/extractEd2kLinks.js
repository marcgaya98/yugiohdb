/**
 * Script para extraer enlaces ed2k de un archivo HTML
 * Este script analiza un archivo HTML y extrae todos los enlaces ed2k que encuentra
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Para ES modules, obtenemos el __filename y __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Lee el contenido de un archivo HTML
 * @param {string} filePath Ruta al archivo HTML
 * @returns {string} Contenido del archivo HTML
 */
const readHTMLFile = (filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`Error leyendo el archivo ${filePath}:`, error);
        process.exit(1);
    }
};

/**
 * Extraer enlaces ed2k de un contenido HTML
 * @param {string} htmlContent Contenido HTML
 * @returns {string[]} Array con los enlaces ed2k encontrados
 */
const extractEd2kLinks = (htmlContent) => {
    // Expresión regular para encontrar enlaces ed2k
    const regex = /href="(ed2k:\/\/\|file\|[^"]+)"/g;

    const links = [];
    let match;

    // Buscar todos los enlaces que coincidan con el patrón
    while ((match = regex.exec(htmlContent)) !== null) {
        links.push(match[1]);
    }

    return links;
};

/**
 * Función principal
 * @param {string} inputPath Ruta al archivo HTML de entrada
 * @param {string} outputPath Ruta al archivo de texto de salida
 */
const processFile = (inputPath, outputPath) => {
    // Leer el archivo HTML
    const htmlContent = readHTMLFile(inputPath);

    // Extraer los enlaces
    const ed2kLinks = extractEd2kLinks(htmlContent);

    // Mostrar los enlaces encontrados
    console.log(`Se encontraron ${ed2kLinks.length} enlaces ed2k:`);
    if (ed2kLinks.length > 0) {
        console.log(`Primeros 5 enlaces (de ${ed2kLinks.length}):`);
        ed2kLinks.slice(0, 5).forEach((link, index) => {
            console.log(`${index + 1}. ${link}`);
        });

        if (ed2kLinks.length > 5) {
            console.log(`... y ${ed2kLinks.length - 5} más`);
        }

        // Guardar los enlaces en un archivo de texto
        fs.writeFileSync(outputPath, ed2kLinks.join('\n'), 'utf8');
        console.log(`\nLos enlaces fueron guardados en: ${outputPath}`);
    }
};

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Uso: node extractEd2kLinks.js <archivo_html> [archivo_salida]');
    console.log('Ejemplo: node extractEd2kLinks.js ./data/pepe.html ./data/enlaces.txt');
    process.exit(1);
}

const inputPath = args[0];
// Si no se especifica archivo de salida, crear uno basado en el nombre del archivo de entrada
const outputPath = args[1] || path.join(
    path.dirname(inputPath),
    `${path.basename(inputPath, path.extname(inputPath))}_ed2k_links.txt`
);

processFile(inputPath, outputPath);

export {
    extractEd2kLinks,
    readHTMLFile,
    processFile
};
