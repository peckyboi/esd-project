import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Text } from "@/components/retroui/Text";
import { Input } from "@/components/retroui/Input";
import { Button } from "@/components/retroui/Button";
import { Loader2 } from "lucide-react";
import OrderCard from "@/components/orders/OrderCard";
import OrdersPagination from "@/components/orders/OrdersPagination";
import { useActor } from "@/context/actorContext";
import { fetchGigById } from "@/api/browseGigApi";
import {
    approveOrder,
    deliverOrder,
    disputeOrder,
    listOrders,
} from "@/api/orderApi";

const ORDERS_PER_PAGE = 4;

const STATUS_GROUPS = {
    All: () => true,
    Active: (status) => ["pending_payment", "in_progress", "delivered"].includes(status),
    Completed: (status) => ["completed", "released", "refunded", "cancelled"].includes(status),
    Disputed: (status) => status === "disputed",
};

export default function OrdersPage() {
    const navigate = useNavigate();
    const { role, resolvedUserId } = useActor();
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const tabs = ["All", "Active", "Completed", "Disputed"];

    const loadOrders = async () => {
        if (!resolvedUserId) {
            setOrders([]);
            setError("Set a valid user id in the top bar first.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const rawOrders = await listOrders(
                role === "client"
                    ? { clientId: resolvedUserId }
                    : { freelancerId: resolvedUserId },
            );

            const gigIds = [...new Set(rawOrders.map((o) => o.gig_id))];
            const gigPairs = await Promise.all(
                gigIds.map(async (gigId) => {
                    try {
                        const gig = await fetchGigById(gigId);
                        return [gigId, gig];
                    } catch {
                        return [gigId, null];
                    }
                }),
            );
            const gigsById = Object.fromEntries(gigPairs);

            const normalized = rawOrders.map((order) => {
                const gig = gigsById[order.gig_id];
                return {
                    id: order.id,
                    gigId: order.gig_id,
                    title: gig && gig.title ? gig.title : `Gig #${order.gig_id}`,
                    freelancer: gig && gig.freelancer_name ? gig.freelancer_name : `Freelancer #${order.freelancer_id}`,
                    price: order.price,
                    deliveryDays: gig && gig.delivery_days ? gig.delivery_days : 0,
                    status: order.status,
                };
            });
            setOrders(normalized);
        } catch (err) {
            setError(err.message || "Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedUserId, role]);

    const filteredOrders = orders
        .filter((order) => {
            const matcher = STATUS_GROUPS[activeTab] || STATUS_GROUPS.All;
            return matcher(order.status);
        })
        .filter((order) => {
            const term = searchQuery.toLowerCase();
            return (
                order.title.toLowerCase().includes(term) ||
                order.freelancer.toLowerCase().includes(term)
            );
        });

    const ordersToShow = useMemo(() => {
        const start = (currentPage - 1) * ORDERS_PER_PAGE;
        const end = start + ORDERS_PER_PAGE;
        return filteredOrders.slice(start, end);
    }, [currentPage, filteredOrders]);

    const runAction = async (orderId, actionFn) => {
        setActionLoadingId(orderId);
        setError("");
        try {
            await actionFn();
            await loadOrders();
        } catch (err) {
            setError(err.message || "Action failed.");
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <main className="min-h-screen w-full p-6 bg-muted">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex gap-3">
                    <Text as="h4">Status: </Text>
                    {tabs.map((tab) => (
                        <Button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setCurrentPage(1);
                            }}
                            variant={activeTab === tab ? "default" : "outline"}
                            size="sm"
                            className={activeTab === tab ? "" : "bg-card"}
                        >
                            {tab}
                        </Button>
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

            {error && (
                <Text as="p" className="mb-4 text-sm text-red-600">
                    {error}
                </Text>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ordersToShow.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            actorRole={role}
                            actionLoading={actionLoadingId}
                            onViewGig={(selectedOrder) => navigate(`/gig/${selectedOrder.gigId}`)}
                            onDeliver={(selectedOrder) => runAction(selectedOrder.id, () => deliverOrder(selectedOrder.id))}
                            onApprove={(selectedOrder) => runAction(selectedOrder.id, () => approveOrder(selectedOrder.id))}
                            onDispute={(selectedOrder) =>
                                runAction(selectedOrder.id, () => disputeOrder(selectedOrder.id, "Disputed by client from UI"))
                            }
                            onViewChat={() => {}}
                        />
                    ))}
                </div>
            )}

            {!loading && ordersToShow.length === 0 && (
                <Text as="p" className="mt-4 text-sm text-muted-foreground">
                    No orders found for the selected filter.
                </Text>
            )}

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
