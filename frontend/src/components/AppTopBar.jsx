import { useLocation } from "react-router-dom";
import { Input } from "@/components/retroui/Input";
import { Select } from "@/components/retroui/Select";
import { Text } from "@/components/retroui/Text";
import { Avatar } from "@/components/retroui/Avatar";
import { User, MessageSquare } from "lucide-react";
import { useActor } from "@/context/actorContext";

function AppTopBar() {
  const location = useLocation();
  const { userId, role, setUserId, setRole } = useActor();
  const canEditIdentity = location.pathname === "/home";

  return (
    <>
      <header className="flex items-center justify-between border-b border-border/60 bg-black/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <Text as="p" className="text-2xl font-semibold">
            Freelance Gig Service
          </Text>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Text as="p" className="whitespace-nowrap text-sm font-semibold text-black">
              Acting As
            </Text>
            <Input
              type="number"
              min="1"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={!canEditIdentity}
              placeholder="User ID"
              className="h-9 w-28 bg-white text-sm disabled:cursor-not-allowed disabled:opacity-70"
            />
            <Select
              value={role}
              onValueChange={setRole}
            >
              <Select.Trigger
                disabled={!canEditIdentity}
                className="h-9 w-32 bg-white text-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="client">client</Select.Item>
                <Select.Item value="freelancer">freelancer</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <nav className="flex items-center gap-4 text-lg">
            <a
              className="text-foreground no-underline"
              href="#"
              title="Profile"
              aria-label="Profile"
            >
              <Avatar className="h-10 w-10 border-2 border-border bg-card transition-colors hover:bg-muted">
                <Avatar.Fallback className="bg-transparent">
                  <User size={22} />
                </Avatar.Fallback>
              </Avatar>
            </a>
            <a
              className="text-foreground no-underline"
              href="#"
              title="Messages"
              aria-label="Messages"
            >
              <Avatar className="h-10 w-10 border-2 border-border bg-card transition-colors hover:bg-muted">
                <Avatar.Fallback className="bg-transparent">
                  <MessageSquare size={22} />
                </Avatar.Fallback>
              </Avatar>
            </a>
          </nav>
        </div>
      </header>

    </>
  );
}

export default AppTopBar;
