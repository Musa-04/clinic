/**
 * PRODUCT DATA — Malik's Polyclinic
 * ─────────────────────────────────────────────────────────────────
 * These are DEMO products for the frontend UI.
 * Replace this array with actual clinic medicines when ready.
 * Each object follows the same structure so ProductCard renders
 * any entry without changes.
 * ─────────────────────────────────────────────────────────────────
 */
import herbalDigestivePoster from '../assets/Herbal Digestive Support Poster.png';
import jointWellnessPoster from '../assets/Joint Wellness Herbal Formula.png';
import womensWellnessPoster from '../assets/Women’s Wellness Herbal Formula.png';
import respiratoryPoster from '../assets/Respiratory Care Drops Wellness Poster.png';
import skinWellnessPoster from '../assets/Malik’s Polyclinic Skin Wellness Drops.png';
import stressReliefPoster from '../assets/Stress Relief Support Wellness Poster.png';

export const products = [
  {
    id: 1,
    name: 'Herbal Digestive Support',
    category: 'Ayurvedic',
    description: 'Herbal formulation designed to support healthy digestion and gut comfort naturally.',
    price: 299,
    image: herbalDigestivePoster,
  },
  {
    id: 2,
    name: 'Joint Wellness Formula',
    category: 'Ayurvedic',
    description: 'Traditional herbal support for joint and muscle wellness and everyday mobility.',
    price: 349,
    image: jointWellnessPoster,
  },
  {
    id: 3,
    name: 'Respiratory Care Drops',
    category: 'Homeopathic',
    description: 'Homeopathic formulation for respiratory wellness and clear breathing support.',
    price: 199,
    image: respiratoryPoster,
  },
  {
    id: 4,
    name: 'Skin Wellness Drops',
    category: 'Homeopathic',
    description: 'Homeopathic support for healthy skin clarity and overall skin wellness.',
    price: 249,
    image: skinWellnessPoster,
  },
  {
    id: 5,
    name: 'Stress Relief Support',
    category: 'Homeopathic',
    description: 'Homeopathic formulation intended to support relaxation and general wellness.',
    price: 229,
    image: stressReliefPoster,
  },
  {
    id: 6,
    name: "Women's Wellness Formula",
    category: 'Ayurvedic',
    description: "Herbal wellness support formulated for women's health and hormonal balance.",
    price: 399,
    image: womensWellnessPoster,
  },
];
