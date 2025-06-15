import Icon from '../models/Icon.js';

class IconController {
    /**
     * Obtener todos los iconos 
     */
    async getAllIcons(req, res) {
        try {
            const { category } = req.query;
            const where = {};

            if (category) {
                where.category = category;
            }

            const icons = await Icon.findAll({
                where,
                order: [
                    ['category', 'ASC'],
                    ['key', 'ASC']
                ]
            });

            return res.json(icons);
        } catch (error) {
            return res.status(500).json({
                message: 'Error obteniendo iconos',
                error: error.message
            });
        }
    }

    /**
     * Obtener iconos por categoría
     */
    async getIconsByCategory(req, res) {
        try {
            const { category } = req.params;

            const icons = await Icon.findAll({
                where: { category },
                order: [['key', 'ASC']]
            });

            return res.json(icons);
        } catch (error) {
            return res.status(500).json({
                message: 'Error obteniendo iconos por categoría',
                error: error.message
            });
        }
    }

    /**
     * Obtener un icono específico por categoría y clave
     */
    async getIconByKey(req, res) {
        try {
            const { category, key } = req.params;

            const icon = await Icon.findOne({
                where: { category, key }
            });

            if (!icon) {
                return res.status(404).json({ message: 'Icono no encontrado' });
            }

            return res.json(icon);
        } catch (error) {
            return res.status(500).json({
                message: 'Error obteniendo icono',
                error: error.message
            });
        }
    }
}

export default new IconController();