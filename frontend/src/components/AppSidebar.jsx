import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { House, ClipboardList, MessageSquare } from "lucide-react";

const navItems = [
  { label: "Browse Gigs", path: "/home", icon: House },
  { label: "My Orders", path: "/orders", icon: ClipboardList },
  { label: "Disputes", path: "/chat", icon: MessageSquare },
];

function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="w-52 shrink-0 border-r-2 border-black bg-[#ece8f8] p-3">
      <Text as="p" className="mb-4 text-sm font-semibold text-black">
        Navigation
      </Text>

      <div className="flex flex-col gap-2.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Button
              key={item.path}
              asChild
              size="sm"
              variant={isActive ? "default" : "outline"}
              className={isActive ? "justify-start text-base" : "justify-start bg-white text-base"}
            >
              <Link to={item.path}>
                <Icon className="mr-1.5 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </aside>
  );
}

export default AppSidebar;
