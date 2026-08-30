'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [sites, setSites] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      const { data } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setSites(data || [])
      setLoading(false)
    }
    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const deleteSite = async (siteId) => {
    const confirmed = window.confirm('Are you sure you want to delete this site?')
    if (!confirmed) return
    await supabase.from('sites').delete().eq('id', siteId)
    setSites(sites.filter(s => s.id !== siteId))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading your sites...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">TAVIC</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Sites</h1>
            <p className="text-gray-600 mt-1">Manage and build your websites</p>
          </div>
          <Link href="/subdomain/new" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-medium">
            + New Site
          </Link>
        </div>

        {sites.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold mb-2">No sites yet</h3>
            <p className="text-gray-400 mb-6">Create your first site and get a free subdomain</p>
            <Link href="/subdomain/new" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Create your first site
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sites.map(site => (
              <div key={site.id} className="bg-white rounded-xl border p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{site.subdomain}.tavic.com</h3>
                    <p className="text-gray-400 text-sm mt-0.5">Created {new Date(site.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Live</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link href={`/builder/${site.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Open Builder</Link>
                  <Link href={`/settings/${site.id}`} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Settings</Link>
                  <a href={"http://" + site.subdomain + ".tavic.com"} target="_blank" rel="noreferrer" className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Visit</a>
                  <button onClick={() => deleteSite(site.id)} className="border border-red-200 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}