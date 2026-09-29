import type { DistanceRoute } from '../../types/models';

export const DEFAULT_DISTANCE_ROUTES: DistanceRoute[] = [
  {
    id: 'seed-casa-piscina',
    userId: 'global',
    name: 'Casa -> Piscina',
    fromLabel: 'Casa',
    toLabel: 'Piscina',
    distanceMeters: 1000,
    category: 'personal',
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'seed-cruzar-estrecho',
    userId: 'global',
    name: 'Cruzar el Estrecho',
    fromLabel: 'Marruecos',
    toLabel: 'España',
    distanceMeters: 14400,
    category: 'challenge',
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'seed-vuelta-retiro',
    userId: 'global',
    name: 'Vuelta al Retiro',
    fromLabel: 'Puerta de Alcalá',
    toLabel: 'Retiro',
    distanceMeters: 4500,
    category: 'city',
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
