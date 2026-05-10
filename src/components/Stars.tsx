type Props = {
  rating: number;  // 0-5 (puede ser decimal)
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZE = { sm: 14, md: 18, lg: 24 } as const;

export default function Stars({ rating, size = 'md', className = '' }: Props) {
  const px = SIZE[size];
  const rounded = Math.max(0, Math.min(5, Math.round(rating * 2) / 2)); // medio en medio

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${rating.toFixed(1)} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = rounded >= i;
        const half = !filled && rounded >= i - 0.5;
        return (
          <svg
            key={i}
            width={px}
            height={px}
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="flex-shrink-0"
          >
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="#C8842A" />
                <stop offset="50%" stopColor="rgba(15,15,15,0.15)" />
              </linearGradient>
            </defs>
            <path
              d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.6l-5.9 3.08 1.13-6.58L2.45 9.44l6.6-.96L12 2.5z"
              fill={filled ? '#C8842A' : half ? `url(#half-${i})` : 'rgba(15,15,15,0.15)'}
            />
          </svg>
        );
      })}
    </span>
  );
}
