import { useState } from 'react'
import type { ServiceCategory } from '../../lib/types'
import Layout from '../../components/Layout'
import CustomerDashboard from '../../components/CustomerDashboard'

export default function CustomerLayout() {
  const [activeTab, setActiveTab] = useState<'create' | 'my' | 'completed' | 'confirm' | 'workers'>('create')
  const [workerCategory, setWorkerCategory] = useState<ServiceCategory | 'All'>('All')
  const [workerQuery, setWorkerQuery] = useState('')
  const [profileModalWorkerId, setProfileModalWorkerId] = useState<string | null>(null)

  return (
    <Layout>
      <CustomerDashboard
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        workerCategory={workerCategory}
        setWorkerCategory={setWorkerCategory}
        workerQuery={workerQuery}
        setWorkerQuery={setWorkerQuery}
        profileModalWorkerId={profileModalWorkerId}
        setProfileModalWorkerId={setProfileModalWorkerId}
      />
    </Layout>
  )
}
