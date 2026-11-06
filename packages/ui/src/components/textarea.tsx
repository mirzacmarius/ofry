import { cn } from "@ofry/ui/lib/utils";
import * as React from "react";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field flex field-sizing-content min-h-16 resize-none",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
