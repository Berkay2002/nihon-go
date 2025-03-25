import React, { PropsWithChildren } from "react";

export function StickyWrapper({ children }: PropsWithChildren) {
  return (
    <div className="sticky top-6 flex h-fit w-full flex-col gap-y-6">
      {children}
    </div>
  );
}