import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion'

export default function StatCounter({ value, duration = 1.5 }: { value: string; duration?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const count = useMotionValue(0)
  const rounded = useTransform(count, Math.round)

  useEffect(() => {
    if (inView) {
      const numValue = parseInt(value.replace(/\D/g, ''), 10)
      if (!isNaN(numValue)) {
        animate(count, numValue, {
          duration,
          ease: 'easeOut',
        })
      }
    }
  }, [inView, value, count, duration])

  return (
    <span ref={ref}>
      {value.includes('s') ? (
        <>~<motion.span style={{ minWidth: '1.5em', display: 'inline-block' }}>{rounded}</motion.span>s</>
      ) : value.includes('%') ? (
        <><motion.span style={{ minWidth: '2em', display: 'inline-block' }}>{rounded}</motion.span>%</>
      ) : (
        <motion.span style={{ minWidth: '1em', display: 'inline-block' }}>{rounded}</motion.span>
      )}
    </span>
  )
}
