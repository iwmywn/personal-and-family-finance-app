import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="center h-[calc(100vh-4.375rem)]">
      <Spinner className="size-8" />
    </div>
  )
}
