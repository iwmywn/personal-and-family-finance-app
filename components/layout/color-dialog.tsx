import { Palette } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const colors = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--border",
  "--input",
  "--ring",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--sidebar-border",
  "--sidebar-ring",
]

export function ColorDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Palette />
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Bảng màu & Token</DialogTitle>
          <DialogDescription>
            Token màu chủ đề được định nghĩa dưới dạng biến CSS để tạo kiểu nhất
            quán.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {colors.map((color) => (
            <div key={color} className="flex items-center justify-between">
              <span className="font-mono text-sm">{color}</span>
              <div
                className="size-8 rounded border"
                style={{ backgroundColor: `var(${color})` }}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
