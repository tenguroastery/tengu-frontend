/**
 * Catálogo de moliendas. Slug interno (persistido en DB) → label visible.
 * Backend valida contra `GRIND_VALUES` en schemas.py: mantener sincronizado.
 */
export type GrindValue =
  | 'grano-entero'
  | 'molido'
  | 'espresso'
  | 'v60'
  | 'aeropress'
  | 'prensa-francesa'
  | 'moka';

export const GRIND_LABELS: Record<GrindValue, string> = {
  'grano-entero': 'Grano entero',
  molido: 'Molido (medio)',
  espresso: 'Espresso',
  v60: 'V60 / filtrado',
  aeropress: 'AeroPress',
  'prensa-francesa': 'Prensa francesa',
  moka: 'Moka',
};

/** Métodos "específicos" — los que aparecen en el paso 2 si el cliente eligió "Molido". */
export const SPECIFIC_GRINDS: GrindValue[] = [
  'espresso',
  'v60',
  'aeropress',
  'prensa-francesa',
  'moka',
];

export function grindLabel(slug: string): string {
  return GRIND_LABELS[slug as GrindValue] ?? slug;
}
