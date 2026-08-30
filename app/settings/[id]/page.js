'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function Settings() {
  const { id } = useParams()
  const router = useRouter()
  const [site, setSite] = useState(null)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data, error } = await supabase.from('sites').select('*').eq('id', id).eq('user_id', user.id).single()
      if (error || !data) { router.push('/dashboard'); return }
      setSite(data)
      setTitle(data.seo_title || '')
      setDesc(data.seo_description || '')
      setSubdomain(data.subdomain || '')
      setLoading(false)
    }
    load()
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    if (subdomain !== site.subdomain) {
      const valid = /^[a-z0-9-]{3,30}$/.test(subdomain)
      if (!valid) { setError('3-30 chars, lowercase, hyphens only.'); setSaving(false); return }
      const reserved = ['www','admin','api','mail','ftp','dashboard','login','support','tavic']
      if (reserved.includes(subdomain)) { setError('That subdomain is reserved.'); setSaving(false); return }
      const { data: existing } = await supabase.from('sites').select('id').eq('subdomain', subdomain).maybeSingle()
      if (existing) { setError('That subdomain is already taken.'); setSaving(false); return }
    }
    const { error: updateError } = await supabase.from('sites').update({ seo_title: title, seo_description: desc, subdomain }).eq('id', id)
    if (updateError) { setError('Save failed: ' + updateError.message) }
    else { setSaved(true); setSite({ ...site, subdomain }); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure? This will permanently delete your site.')
    if (!confirmed) return
    await supabase.from('sites').delete().eq('id', id)
    router.push('/dashboard')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>

  const siteUrl = "http://" + subdomain + ".tavic.com"

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">TAVIC</Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">Back to dashboard</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
            <p className="text-gray-600 mt-1">{site?.subdomain}.tavic.com</p>
          </div>
          <Link href={"/builder/" + id} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Open Builder</Link>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}

        <div className="bg-white rounded-xl border p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
            <div className="flex items-center gap-2">
              <input type="text" value={subdomain} onChange={e => setSubdomain(e.target.value.toLowerCase())} className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span className="text-gray-400 text-sm whitespace-nowrap">.tavic.com</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Changing this will change your site URL</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="My Awesome Site" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-gray-400 mt-1">Shown in browser tab and Google search results</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="A short description of your site..." rows={3} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <p className="text-xs text-gray-400 mt-1">Shown in Google search results under your title</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Your site URL</p>
            <a href={siteUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline">{siteUrl}</a>
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Settings'}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-red-200 p-6 mt-6">
          <h3 className="text-red-600 font-semibold mb-2">Danger Zone</h3>
          <p className="text-gray-500 text-sm mb-4">Permanently delete this site and all its content. This cannot be undone.</p>
          <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Delete Site</button>
        </div>
      </div>
    </div>
  )
}