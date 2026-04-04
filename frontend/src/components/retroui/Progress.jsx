"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => (
    <ProgressPrimitive.Root
        ref={ref}
        className="relative w-full overflow-hidden bg-muted rounded-none h-2"
        {...props}
    >
        <ProgressPrimitive.Indicator
            className={cn("h-full transition-all", className)}
            style={{ width: `${value}%` }}
        />
    </ProgressPrimitive.Root>
));

Progress.displayName = "Progress";

export { Progress };
