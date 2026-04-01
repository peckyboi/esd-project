import { useState } from "react";
import { Text } from "@/components/retroui/Text";
import { Input } from "@/components/retroui/Input";
import OrderCard from "@/components/orders/OrderCard";
import OrdersPagination from "@/components/orders/OrdersPagination";

const ORDERS_PER_PAGE = 4;

// Sample orders, replace with your data source later
const initialOrders = [
    { id: 1, title: "SaaS Web App", freelancer: "Alice W", status: "in_progress", statusMessage: "Halfway done" },
    { id: 2, title: "UI Design", freelancer: "Bob K", status: "delivered", statusMessage: "Delivered, pending approval" },
    { id: 3, title: "Backend API", freelancer: "Charlie L", status: "completed", statusMessage: "Completed successfully" },
    { id: 4, title: "Marketing Campaign", freelancer: "Dana M", status: "disputed", statusMessage: "Client raised a dispute" },
    { id: 5, title: "Mobile App", freelancer: "Eve P", status: "in_progress", statusMessage: "Halfway done" },
    { id: 6, title: "Landing Page", freelancer: "Frank Q", status: "completed", statusMessage: "Completed successfully" },
    { id: 7, title: "Logo Design", freelancer: "Grace R", status: "delivered", statusMessage: "Delivered, pending approval" },
    { id: 8, title: "SEO Optimization", freelancer: "Helen S", status: "in_progress", statusMessage: "Halfway done" },
];

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const tabs = ["All", "Active", "Completed", "Disputed"];

    // Filter orders by active tab
    const filteredOrders = initialOrders
        .filter((order) => {
            if (activeTab === "All") return true;
            return order.status === activeTab.toLowerCase();
        })
        .filter((order) => order.title.toLowerCase().includes(searchQuery.toLowerCase()));

    // Slice orders for current page
    const start = (currentPage - 1) * ORDERS_PER_PAGE;
    const end = start + ORDERS_PER_PAGE;
    const ordersToShow = filteredOrders.slice(start, end);

    return (
        <main className="min-h-screen w-full p-6 bg-muted">
            {/* Tabs + Search */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex gap-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded font-semibold ${activeTab === tab
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card text-foreground hover:bg-muted"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <Input
                    className="w-full md:w-1/3"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {/* Order grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ordersToShow.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>

            {/* Pagination */}
            <div className="mt-6">
                <OrdersPagination
                    totalOrders={filteredOrders.length}
                    ordersPerPage={ORDERS_PER_PAGE}
                    currentPage={currentPage}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>
        </main>
    );
}