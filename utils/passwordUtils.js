/**
 * Utilidades para manejo de passwords de cartas Yu-Gi-Oh!
 */

/**
 * Normalizar password de carta para uso en URLs
 * Elimina ceros a la izquierda para compatibilidad con APIs externas
 * @param {string} password - Password de la carta (ej: "06368038")
 * @returns {string} Password normalizado (ej: "6368038")
 */
export function normalizePasswordForUrl(password) {
    if (!password) return '';

    // Convertir a string si no lo es
    const passwordStr = String(password);

    // Eliminar ceros a la izquierda
    const normalized = passwordStr.replace(/^0+/, '');

    // Si el password era solo ceros, devolver "0"
    return normalized || '0';
}

/**
 * Formatear password para almacenamiento en base de datos
 * Asegura que tenga 8 dígitos con ceros a la izquierda si es necesario
 * @param {string|number} password - Password de la carta
 * @returns {string} Password formateado con 8 dígitos
 */
export function formatPasswordForDatabase(password) {
    if (!password) return '';

    // Convertir a string y eliminar caracteres no numéricos
    const passwordStr = String(password).replace(/\D/g, '');

    // Rellenar con ceros a la izquierda hasta 8 dígitos
    return passwordStr.padStart(8, '0');
}

/**
 * Validar formato de password de carta
 * @param {string} password - Password a validar
 * @returns {boolean} true si el password es válido
 */
export function isValidPassword(password) {
    if (!password) return false;

    const passwordStr = String(password);

    // Debe ser exactamente 8 dígitos
    return /^\d{8}$/.test(passwordStr);
}

/**
 * Generar URLs de imagen para una carta considerando el password normalizado
 * @param {string} password - Password de la carta
 * @param {string} baseUrl - URL base (opcional)
 * @returns {Object} Objeto con URLs de diferentes tipos de imagen
 */
export function generateImageUrls(password, baseUrl = '') {
    if (!password) return null;

    const normalizedPassword = normalizePasswordForUrl(password);

    return {
        external: {
            normal: `https://images.ygoprodeck.com/images/cards/${normalizedPassword}.jpg`,
            small: `https://images.ygoprodeck.com/images/cards_small/${normalizedPassword}.jpg`,
            cropped: `https://images.ygoprodeck.com/images/cards_cropped/${normalizedPassword}.jpg`
        },
        local: {
            normal: `${baseUrl}/images/cards/normal/${normalizedPassword}.jpg`,
            small: `${baseUrl}/images/cards/small/${normalizedPassword}.jpg`,
            cropped: `${baseUrl}/images/cards/cropped/${normalizedPassword}.jpg`
        }
    };
}

export default {
    normalizePasswordForUrl,
    formatPasswordForDatabase,
    isValidPassword,
    generateImageUrls
};
