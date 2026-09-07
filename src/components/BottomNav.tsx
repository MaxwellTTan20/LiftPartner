import { NavLink } from 'react-router-dom'
import { useT } from '../contexts/I18nContext'

export default function BottomNav() {
  const { t } = useT()
  const tabs = [
    { to: '/', label: t('nav.home'), icon: '⌂' },
    { to: '/plan', label: t('nav.plan'), icon: '▤' },
    { to: '/log', label: t('nav.log'), icon: '+' },
    { to: '/history', label: t('nav.history'), icon: '☷' },
    { to: '/account', label: t('nav.account'), icon: '○' },
  ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-app-border bg-app-surface/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] ${
                isActive ? 'text-app-accent' : 'text-app-muted'
              }`
            }
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
