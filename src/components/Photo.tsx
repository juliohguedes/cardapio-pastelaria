// Foto do produto; sem foto, um espaço neutro no mesmo tamanho
export function Photo({ src, alt }: { src?: string; alt: string }) {
  if (src) return <img className="photo" src={src} alt={alt} loading="lazy" />;
  return (
    <span className="photo photo-empty" role="img" aria-label={alt ? `${alt}, sem foto` : "Sem foto"}>
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m4 17 5-4 3 2 4-4 4 4" />
      </svg>
    </span>
  );
}
