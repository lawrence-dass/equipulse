"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type PopoverContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

function usePopoverContext() {
  const context = React.useContext(PopoverContext)

  if (!context) {
    throw new Error("Popover components must be used inside <Popover>")
  }

  return context
}

function composeEventHandlers<E>(
  original?: (event: E) => void,
  next?: (event: E) => void
) {
  return (event: E) => {
    original?.(event)
    next?.(event)
  }
}

function Popover({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)

  const open = controlledOpen ?? uncontrolledOpen

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen)
      }

      onOpenChange?.(nextOpen)
    },
    [controlledOpen, onOpenChange]
  )

  React.useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        return
      }

      setOpen(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, setOpen])

  return (
    <PopoverContext.Provider value={{ open, onOpenChange: setOpen }}>
      <div ref={rootRef} data-slot="popover" className="relative w-full">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

function PopoverTrigger({
  asChild,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  children: React.ReactElement
}) {
  const { open, onOpenChange } = usePopoverContext()

  if (asChild) {
    const child = children as React.ReactElement<{
      onClick?: (event: React.MouseEvent) => void
      "aria-expanded"?: boolean
      "data-slot"?: string
    }>

    return React.cloneElement(child, {
      ...props,
      "data-slot": "popover-trigger",
      "aria-expanded": open,
      onClick: composeEventHandlers(
        child.props.onClick,
        () => onOpenChange(!open)
      ),
    })
  }

  return (
    <button
      type="button"
      data-slot="popover-trigger"
      aria-expanded={open}
      onClick={composeEventHandlers(props.onClick, () => onOpenChange(!open))}
      {...props}
    >
      {children}
    </button>
  )
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end"
  sideOffset?: number
}) {
  const { open } = usePopoverContext()

  if (!open) {
    return null
  }

  const alignmentClassName =
    align === "start"
      ? "left-0"
      : align === "end"
        ? "right-0"
        : "left-1/2 -translate-x-1/2"

  return (
    <div
      data-slot="popover-content"
      className={cn(
        "absolute top-full z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden",
        alignmentClassName,
        className
      )}
      style={{ marginTop: sideOffset, ...style }}
      {...props}
    >
      {children}
    </div>
  )
}

function PopoverAnchor({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="popover-anchor" {...props}>
      {children}
    </div>
  )
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
