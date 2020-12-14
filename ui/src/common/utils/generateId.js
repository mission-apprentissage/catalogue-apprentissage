/**
 * Generate mongoDB ID
 */

export const ObjectId = (rnd = (r16) => Math.floor(r16).toString(16)) =>
  rnd(Date.now() / 1000) + " ".repeat(16).replace(/./g, () => rnd(Math.random() * 16));
