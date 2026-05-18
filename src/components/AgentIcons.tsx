import type { SVGProps } from 'react'
import { motion } from 'framer-motion'

type IconProps = SVGProps<SVGSVGElement>

export function DiagnosisIcon(props: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        viewport={{ once: true }}
      />
      <motion.path
        d="M12 7V12M12 16H12.01"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeInOut' }}
        viewport={{ once: true }}
      />
      <motion.circle cx="7" cy="12" r="1.5" fill="currentColor" opacity="0.4" initial={{ opacity: 0 }} whileInView={{ opacity: 0.4 }} transition={{ duration: 0.3, delay: 0.2 }} viewport={{ once: true }} />
      <motion.circle cx="17" cy="12" r="1.5" fill="currentColor" opacity="0.4" initial={{ opacity: 0 }} whileInView={{ opacity: 0.4 }} transition={{ duration: 0.3, delay: 0.2 }} viewport={{ once: true }} />
    </svg>
  )
}

export function FixesIcon(props: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <motion.path
        d="M9 12L11 14L15 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        viewport={{ once: true }}
      />
      <motion.path
        d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeInOut' }}
        viewport={{ once: true }}
      />
      <motion.circle cx="20" cy="5" r="1.5" fill="currentColor" opacity="0.3" initial={{ opacity: 0 }} whileInView={{ opacity: 0.3 }} transition={{ duration: 0.3, delay: 0.2 }} viewport={{ once: true }} />
    </svg>
  )
}

export function VerifyIcon(props: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <motion.path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        viewport={{ once: true }}
      />
      <motion.path
        d="M8 12.5L10.5 15L16 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeInOut' }}
        viewport={{ once: true }}
      />
      <motion.circle cx="19" cy="6" r="2" fill="currentColor" opacity="0.2" initial={{ opacity: 0 }} whileInView={{ opacity: 0.2 }} transition={{ duration: 0.3, delay: 0.2 }} viewport={{ once: true }} />
    </svg>
  )
}
