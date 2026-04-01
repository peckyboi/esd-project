export default function OrdersPagination({ totalOrders, ordersPerPage, currentPage, onPageChange }) {
    const totalPages = Math.ceil(totalOrders / ordersPerPage);
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center gap-4 text-sm">
            {Array.from({ length: totalPages }, (_, i) => (
                <button
                    key={i}
                    onClick={() => onPageChange(i + 1)}
                    className={`px-3 py-1 rounded font-semibold ${currentPage === i + 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    );
  }