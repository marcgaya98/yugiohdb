import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import TestUuid from '../models/TestUuid.js';
import sequelize from '../config/database.js';

describe('TestUuid Model', () => {
    beforeAll(async () => {
        await sequelize.sync();
    });

    afterAll(async () => {
        await TestUuid.destroy({ where: {} });
        await sequelize.close();
    });

    it('debe crear un registro con UUID v4 como id', async () => {
        const test = await TestUuid.create({ name: 'Prueba UUID' });
        expect(test.id).toMatch(/[0-9a-fA-F-]{36}/);
        expect(test.name).toBe('Prueba UUID');
    });

    it('debe permitir encontrar un registro por UUID', async () => {
        const test = await TestUuid.create({ name: 'Buscar UUID' });
        const found = await TestUuid.findByPk(test.id);
        expect(found).not.toBeNull();
        expect(found.id).toBe(test.id);
        expect(found.name).toBe('Buscar UUID');
    });
});
