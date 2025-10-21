import * as React from "react"

export function useDynamicSizeAuto() {
  const elementsRef = React.useRef<Set<HTMLElement>>(new Set())
  const [calculatedWidth, setCalculatedWidth] = React.useState<number>(0)
  const [calculatedHeight, setCalculatedHeight] = React.useState<number>(0)

  const calculateSize = React.useCallback(() => {
    let totalWidth = 0
    let totalHeight = 0

    elementsRef.current.forEach((el) => {
      totalWidth += el.offsetWidth
      totalHeight += el.offsetHeight
    })

    setCalculatedWidth(totalWidth)
    setCalculatedHeight(totalHeight)
  }, [])

  const registerRef = React.useCallback(
    (node: HTMLElement | null) => {
      if (node) {
        elementsRef.current.add(node)
        requestAnimationFrame(calculateSize)
      } else {
        elementsRef.current.forEach((el) => {
          if (!document.body.contains(el)) {
            elementsRef.current.delete(el)
          }
        })
      }
    },
    [calculateSize]
  )

  React.useEffect(() => {
    calculateSize()

    window.addEventListener("resize", calculateSize)

    const observer = new ResizeObserver(calculateSize)
    elementsRef.current.forEach((el) => observer.observe(el))

    return () => {
      window.removeEventListener("resize", calculateSize)
      observer.disconnect()
    }
  }, [calculateSize])

  return { registerRef, calculatedWidth, calculatedHeight }
}
