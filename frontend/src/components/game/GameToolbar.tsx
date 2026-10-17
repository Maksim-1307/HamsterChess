import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import styles from './GameToolbar.module.scss'

export interface GameToolbarProps {
  onUpdate: () => void
  isUpdating: boolean
  shareUrl: string
  className?: string
}

export const GameToolbar = ({ onUpdate, isUpdating, shareUrl, className }: GameToolbarProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [shareUrl])

  return (
    <div className={cn(styles.toolbar, className)}>
      <Button variant="secondary" onClick={onUpdate} loading={isUpdating}>
        Update
      </Button>
      <Button variant="ghost" onClick={handleCopy}>
        {copied ? 'Link copied' : 'Copy link'}
      </Button>
    </div>
  )
}
