import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_auth/messages/")({
  component: () => (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center text-muted-foreground">
      <MessageCircle className="size-10" />
      <p>Alege o conversație din listă.</p>
    </div>
  ),
});
