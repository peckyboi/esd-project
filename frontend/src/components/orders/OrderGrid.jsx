import OrderCard from "./OrderCard";

export default function OrderGrid({ orders }) {
    return (
        <div className="grid grid-cols-2 gap-6">
            {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
            ))}
        </div>
    );
}