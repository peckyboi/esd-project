import { AlertCircle, Clock, CheckCircle, Truck } from "lucide-react";

const statusConfig = {
    disputed: {
        color: "bg-red-100 text-red-600",
        icon: AlertCircle,
        label: "Order Disputed"
    },
    in_progress: {
        color: "bg-yellow-100 text-yellow-700",
        icon: Clock,
        label: "In Progress"
    },
    delivered: {
        color: "bg-blue-100 text-blue-600",
        icon: Truck,
        label: "Delivered"
    },
    completed: {
        color: "bg-green-100 text-green-600",
        icon: CheckCircle,
        label: "Completed"
    }
};

function StatusBadge({ status }) {
    const config = statusConfig[status];

    if (!config) return null;

    const Icon = config.icon;

    return (
        <div
            className={`w-full flex justify-center items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${config.color}`}
        >
            <Icon size={16} />
            {config.label}
        </div>
      );
}

export default StatusBadge;