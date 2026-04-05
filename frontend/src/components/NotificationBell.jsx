import { useState } from "react";
import { Text } from "@/components/retroui/Text";
import { Avatar } from "@/components/retroui/Avatar";
import { Bell, Loader2 } from "lucide-react";

function NotificationBell({
  notifications = [],
  loading = false,
  error = "",
  onOpen,
}) {
  const [open, setOpen] = useState(false);

  const handleToggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && onOpen) onOpen();
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("en-SG", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="relative">
      <button
        onClick={handleToggleOpen}
        aria-label="Notifications"
      >
        <Avatar className="h-10 w-10 border-2 border-border bg-card transition-colors hover:bg-muted">
          <Avatar.Fallback className="bg-transparent">
            <Bell size={22} />
          </Avatar.Fallback>
        </Avatar>
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center border-2 border-border bg-destructive text-[10px] font-bold text-destructive-foreground">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-80 border-2 border-border bg-card shadow-md"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="flex items-center justify-between border-b-2 border-border bg-primary px-4 py-2">
            <Text as="p" className="font-semibold text-primary-foreground">Notifications</Text>
            {notifications.length > 0 && (
              <span className="border border-border bg-card px-1.5 py-0.5 text-xs font-bold">
                {notifications.length}
              </span>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <Loader2 size={24} className="mx-auto mb-2 animate-spin text-muted-foreground" />
                <Text as="p" className="text-sm text-muted-foreground">Loading notifications...</Text>
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center">
                <Text as="p" className="text-sm text-red-600">{error}</Text>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={28} className="mx-auto mb-2 text-muted-foreground" />
                <Text as="p" className="text-sm text-muted-foreground">No notifications yet.</Text>
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div key={notif.id} className={`px-4 py-3 ${index !== notifications.length - 1 ? "border-b border-border/40" : ""}`}>
                  <Text as="p" className="text-sm leading-snug">{notif.message}</Text>
                  <Text as="p" className="mt-1 text-xs text-muted-foreground">{formatDate(notif.created_at)}</Text>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
