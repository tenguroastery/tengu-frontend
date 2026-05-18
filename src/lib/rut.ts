/** Validación de RUT chileno — mismo algoritmo que el backend
 * (`backend/app/schemas.py::_validate_chilean_rut`). Acepta variantes con
 * o sin puntos / guion. Si es válido devuelve la forma normalizada
 * "12345678-K". Si no, retorna null. */
export function validateRut(input: string): string | null {
  const clean = input.replace(/[.\s]/g, '').toUpperCase();
  const [body, dv] = clean.includes('-')
    ? (clean.split('-', 2) as [string, string])
    : [clean.slice(0, -1), clean.slice(-1)];

  if (!/^\d+$/.test(body) || body.length < 7 || body.length > 9 || dv.length !== 1) {
    return null;
  }

  let total = 0;
  let mult = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    total += Number(body[i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const rem = 11 - (total % 11);
  const expected = rem === 11 ? '0' : rem === 10 ? 'K' : String(rem);

  return dv === expected ? `${body}-${dv}` : null;
}

/** Formato bonito para mostrar al usuario: "12.345.678-K". */
export function prettyRut(rut: string): string {
  const normalized = validateRut(rut);
  if (!normalized) return rut;
  const [body, dv] = normalized.split('-');
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}
