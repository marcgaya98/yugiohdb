import Card from '../models/Card.js';

export async function getAllCards(req, res) {
  const cards = await Card.findAll();
  res.json(cards);
}
