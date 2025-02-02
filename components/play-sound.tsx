"use client"

import { useEffect, useRef } from "react"

interface PlaySoundProps {
  src: string
}

export function PlaySound({ src }: PlaySoundProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play()
    }
  }, [])

  return <audio ref={audioRef} src={src} />
}

