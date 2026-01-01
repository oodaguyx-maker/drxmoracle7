"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface ModeSplashScreenProps {
  title: string
  subtitle: string
  description: string
  onContinue: () => void
}

export function ModeSplashScreen({ title, subtitle, description, onContinue }: ModeSplashScreenProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onContinue, 500)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onContinue])

  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5"
    >
      <div className="text-center space-y-6 max-w-2xl px-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-pink-500 to-purple-500 bg-clip-text text-transparent">
            {title}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <p className="text-2xl font-medium text-foreground">{subtitle}</p>
          <p className="text-base text-muted-foreground mt-3">{description}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Button size="lg" onClick={onContinue} className="mt-4 px-8">
            Continue
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ModeSplashScreen
