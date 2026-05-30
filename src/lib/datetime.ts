/** Helpers para <input type="datetime-local"> ↔ ISO UTC (lo que guarda el backend).
 *
 * Clave: la conversión debe ser SIMÉTRICA. El input muestra/edita en hora LOCAL
 * del navegador; el backend guarda ISO UTC. Sin esto (ej. cortar el ISO crudo),
 * la hora se corre por el offset de zona en cada reedición. */

/** ISO UTC → valor 'YYYY-MM-DDTHH:mm' en hora local para el input. */
export function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Valor del input (hora local) → ISO UTC para el backend. */
export function localInputToIso(value: string): string | null {
  if (!value) return null;
  const d = new Date(value); // sin tz → se interpreta como hora local
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
