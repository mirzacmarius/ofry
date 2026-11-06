import { EmptyArt } from "@ofry/ui/components/ofry-feedback";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_auth/messages/")({
  component: () => (
    <div className="flex h-full flex-col items-center justify-center p-10 text-center">
      <EmptyArt icon={<MessageCircle />} />
      <h2 className="mt-6 text-lg font-semibold">Alege o conversație</h2>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">Mesajele cu cumpărătorii și vânzătorii apar aici, grupate pe anunț.</p>
    </div>
  ),
});
