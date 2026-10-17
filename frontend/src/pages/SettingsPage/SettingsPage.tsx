import { Page } from '@/components/layout/Page'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { useSettings } from '@/hooks/useSettings'
import { useTranslation } from '@/hooks/useTranslation'
import { getLanguageName, SUPPORTED_LANGUAGES } from '@/i18n/translations'
import styles from './SettingsPage.module.scss'

export const SettingsPage = () => {
  const { settings, setLanguage } = useSettings()
  const { t } = useTranslation()

  const languageOptions = SUPPORTED_LANGUAGES.map((code) => ({
    value: code,
    label: getLanguageName(code),
  }))

  return (
    <Page>
      <div className={styles.intro}>
        <h1 className={styles.title}>{t('settings.title')}</h1>
        <p className={styles.subtitle}>{t('settings.subtitle')}</p>
      </div>

      <Card
        title={t('settings.languageCardTitle')}
        subtitle={t('settings.languageCardSubtitle')}
      >
        <Select
          label={t('settings.languageLabel')}
          name="language"
          value={settings.language}
          options={languageOptions}
          onChange={(event) => setLanguage(event.target.value)}
        />
      </Card>
    </Page>
  )
}
