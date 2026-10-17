import { PageState } from '@/components/layout/PageState'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/hooks/useTranslation'

export const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <PageState
      title={t('notFound.title')}
      description={t('notFound.description')}
      action={<Button to="/">{t('common.backToLobby')}</Button>}
    />
  )
}
