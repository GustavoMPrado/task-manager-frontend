// src/components/Pagination.jsx
export default function Pagination({ page, totalPages, onPrev, onNext }) {
  if (!Number.isFinite(totalPages) || totalPages <= 1) return null;

  const isFirst = page <= 0;
  const isLast = page >= totalPages - 1;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <button onClick={onPrev} disabled={isFirst} style={{ padding: "6px 10px" }}>
        Anterior
      </button>

      <span>
        Página {page + 1} de {totalPages}
      </span>

      <button onClick={onNext} disabled={isLast} style={{ padding: "6px 10px" }}>
        Próxima
      </button>
    </div>
  );
}
