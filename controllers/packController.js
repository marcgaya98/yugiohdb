import Pack from '../models/pack.js';

export async function getAllPacks(req, res) {
  try {
    const packs = await Pack.findAll();
    res.json(packs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getPackById(req, res) {
  try {
    const pack = await Pack.findByPk(req.params.id);
    if (!pack) return res.status(404).json({ error: 'Pack not found' });
    res.json(pack);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createPack(req, res) {
  try {
    const pack = await Pack.create(req.body);
    res.status(201).json(pack);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updatePack(req, res) {
  try {
    const [updated] = await Pack.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Pack not found' });
    const pack = await Pack.findByPk(req.params.id);
    res.json(pack);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deletePack(req, res) {
  try {
    const deleted = await Pack.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Pack not found' });
    res.json({ message: 'Pack deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}