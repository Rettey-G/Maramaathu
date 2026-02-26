import { useEffect, useState } from 'react'
import { getDB, subscribe } from './db'
import type { DB } from './types'

export function useDBSnapshot() {
  const [db, setDb] = useState<DB>(() => getDB())

  useEffect(() => {
    setDb(getDB())
    return subscribe(() => setDb(getDB()))
  }, [])

  return db
}
