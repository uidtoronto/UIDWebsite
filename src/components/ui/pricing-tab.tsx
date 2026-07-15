"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

interface TabProps {
  text: string
  selected: boolean
  setSelected: (text: string) => void
}

export function PricingTab({ text, selected, setSelected }: TabProps) {
  return (
    <button
      onClick={() => setSelected(text)}
      className={cn(
        "relative w-fit px-5 py-2 text-sm font-semibold capitalize",
        "transition-colors duration-200",
        selected ? "text-[var(--uid-navy)]" : "text-[var(--text-soft)]"
      )}
    >
      <span className="relative z-10">{text}</span>
      {selected && (
        <motion.span
          layoutId="pricing-tab"
          transition={{ type: "spring", duration: 0.4 }}
          className="absolute inset-0 z-0 rounded-full bg-white shadow-sm"
        />
      )}
    </button>
  )
}
