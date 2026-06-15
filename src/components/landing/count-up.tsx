"use client"

import { useState, useEffect, useRef } from "react"
import { useInView } from "framer-motion"

interface CountUpNumberProps {
  value: number
  suffix?: string
}

export default function CountUpNumber({ value, suffix = "" }: CountUpNumberProps) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let start = 0
      const duration = 1.5
      const end = value
      const stepTime = Math.abs(Math.floor(1500 / end))
      const timer = setInterval(() => {
        start += 1
        setCount(start)
        if (start >= end) {
          clearInterval(timer)
          setCount(end)
        }
      }, stepTime)
      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}
