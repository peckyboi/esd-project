import { Input } from "@/components/retroui/Input";

const filters = [
    { label: "All", value: "all" },
    { label: "Active", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Disputed", value: "disputed" },
];

export default function OrdersNavbar({
    filter,
    setFilter,
    search,
    setSearch,
}) {
    return (
        <div className="flex justify-between items-center bg-card p-4 border border-border">
            <div className="flex gap-4">
                {filters.map((item) => (
                    <button
                        key={item.value}
                        onClick={() => setFilter(item.value)}
                        className={`font-medium px-3 py-1
            ${filter === item.value
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>  

            <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-sm !bg-white"
            />
        </div>
    );
}