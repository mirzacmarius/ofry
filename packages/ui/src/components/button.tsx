import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@ofry/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Mirrors the .btn classes in styles/components.css so both APIs look identical.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.125rem]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/85",
        accent: "bg-brand text-brand-foreground hover:brightness-95",
        secondary: "bg-surface text-foreground hover:bg-surface-strong aria-expanded:bg-surface-strong",
        outline: "border-border bg-background hover:bg-surface aria-expanded:bg-surface",
        ghost: "hover:bg-surface aria-expanded:bg-surface",
        inverse: "bg-white text-neutral-950 hover:bg-white/90",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/15",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 gap-2 px-5",
        xs: "h-7 gap-1 rounded-md px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1.5 rounded-md px-3.5 text-[0.8125rem] [&_svg:not([class*='size-'])]:size-4",
        lg: "h-14 gap-2 rounded-xl px-6 text-base",
        icon: "size-11",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9 rounded-md [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-14 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
