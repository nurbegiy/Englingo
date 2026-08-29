import { useEffect, useState } from 'react'
import { getLeaderboard } from '../lib/dataClient'

export function useLeaderboard(scope, params) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    getLeaderboard(scope, params)
      .then((data) => { if (active) setRows(data) })
      .catch((e) => { if (active) setError(e) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, params?.branchId, params?.groupId])

  return { rows, loading, error }
}
