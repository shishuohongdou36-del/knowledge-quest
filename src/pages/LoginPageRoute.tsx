import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { LoginPage } from '@/components/auth/LoginPage'
import { BackgroundFX } from '@/components/shell/BackgroundFX'

export function LoginPageRoute() {
  const { isLoggedIn } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isLoggedIn) {
      const returnTo = (location.state as { from?: string } | null)?.from ?? '/'
      navigate(returnTo, { replace: true })
    }
  }, [isLoggedIn, navigate, location])

  return (
    <>
      <BackgroundFX />
      <LoginPage />
    </>
  )
}
