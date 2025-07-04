import { existsSync } from 'fs';
import { join, dirname } from 'path';

export default (req, res, next) => {
  if (req.accepts('image/webp')) {
    // Detecta el tipo (normal, small, cropped)
    const match = req.path.match(/^\/images\/cards\/(normal|small|cropped)\/(.+)\.jpg$/);
    if (match) {
      const type = match[1];
      const filename = match[2];
      const webpPath = `/images/cards/${type}_webp/${filename}.webp`;
      if (existsSync(join(process.cwd(), 'public', 'images', 'cards', `${type}_webp`, `${filename}.webp`))) {
        req.url = webpPath;
      }
    }
  }
  next();
};
