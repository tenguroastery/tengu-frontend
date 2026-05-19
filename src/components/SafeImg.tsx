import { useEffect, useState } from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  /** Texto sobreimpuesto sobre el fallback. Default: "Foto próximamente". */
  fallbackLabel?: string;
};

/**
 * `<img>` que detecta carga fallida (404 / red) y reemplaza por un placeholder
 * neutro con el logo de Tengu sobre fondo cream. Mantiene las clases y el
 * aspect-ratio del `<img>` original para que el layout no se rompa.
 *
 * Útil para `/uploads/*` cuando una foto se perdió o aún no fue subida desde
 * /admin (caso típico: producto custom recién creado).
 */
export default function SafeImg({
  src,
  alt,
  className,
  fallbackLabel = 'Foto próximamente',
  ...rest
}: Props) {
  const [errored, setErrored] = useState(false);

  // Si el src cambia (ej. tras un reload del catálogo), reintentamos.
  useEffect(() => setErrored(false), [src]);

  if (!src || errored) {
    return (
      <div
        className={`relative flex items-center justify-center bg-tengu-cream/60 ${className ?? ''}`}
        role="img"
        aria-label={alt ?? fallbackLabel}
      >
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="h-1/2 max-h-20 w-auto opacity-30"
        />
        <span className="absolute bottom-2 text-[10px] uppercase tracking-wider text-tengu-dark/40">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      key={src}  // remount al cambiar src evita que un onError tardío del src anterior pise el nuevo
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        // Defensa adicional: solo marcamos errored si el onError viene del src actual
        // (browser pudo haber comenzado la request del src anterior antes del cambio).
        if ((e.currentTarget as HTMLImageElement).src.includes(src)) {
          setErrored(true);
        }
      }}
      {...rest}
    />
  );
}
