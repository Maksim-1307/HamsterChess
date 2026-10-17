import { PageState } from '@/components/layout/PageState'
import { Button } from '@/components/ui/Button'

export const NotFoundPage = () => (
  <PageState
    title="Page not found"
    description="The page you are looking for does not exist."
    action={<Button to="/">Back to lobby</Button>}
  />
)
