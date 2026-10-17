import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/cn'
import styles from './GameToolbar.module.scss'

export interface GameToolbarProps {
  onUpdate: () => void
  isUpdating: boolean
  shareUrl: string
  className?: string
}

export const GameToolbar = ({ onUpdate, isUpdating, shareUrl, className }: GameToolbarProps) => {
  const { t } = useTranslation()
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
        {t('game.update')}
      </Button>
      <Button variant="ghost" onClick={handleCopy}>
        {copied ? t('game.linkCopied') : t('game.copyLink')}
      </Button>
    </div>
  )
}
