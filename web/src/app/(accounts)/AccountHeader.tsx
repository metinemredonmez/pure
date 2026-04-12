'use client'

import { useEffect, useState } from 'react'

export default function AccountHeader() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pureolentia_user')
      if (raw) setUser(JSON.parse(raw))
    } catch {}
  }, [])

  const name = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Kullanıcı'
    : 'Hesabım'
  const email = user?.email || ''

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-semibold xl:text-4xl">Hesap</h2>
      <span className="mt-4 block text-base text-neutral-500 sm:text-lg dark:text-neutral-400">
        {user ? (
          <>
            <span className="font-semibold text-neutral-900 dark:text-neutral-200">{name}</span>
            {email && <> · {email}</>}
          </>
        ) : (
          <span className="text-neutral-400">Yükleniyor...</span>
        )}
      </span>
    </div>
  )
}
