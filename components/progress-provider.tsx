"use client"

import { ProgressProvider as Provider } from "@bprogress/next/app"

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider height="4px" options={{ showSpinner: false }} shallowRouting>
      {children}
    </Provider>
  )
}
