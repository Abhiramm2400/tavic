'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function NewSubdomain() {
  const router = useRouter()
  const [subdomain, setSubdomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Validate format
    const valid = /^[a-z0-9-]{3,30}$/.test(subdomain)
    if (!valid) {
      setError('3-30 characters, lowercase letters, numbers and hyphens only.')
      setLoading(false)
      return
    }

    // 2. Block reserved names
    const reserved = ['www', 'admin', 'api', 'mail', 'ftp', 'dashboard', 'login', 'support', 'tavic']
    if (reserved.includes(subdomain)) {
      setError('That name is reserved. Please choose another.')
      setLoading(false)
      return
    }

    // 3. Check if already taken
    const { data: existing } = await supabase
      .from('sites')
      .select('id')
      .eq('subdomain', subdomain)
      .maybeSingle()

    if (existing) {
      setError(`"${subdomain}" is already taken. Try another name.`)
      setLoading(false)
      return
    }

    // 4. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // 5. Create the site
    const { data, error: insertError } = await supabase
      .from('sites')
      .insert({
        subdomain,
        user_id: user.id,
        html_content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <title>${subdomain}</title>
</head>
<body class="min-h-screen bg-white flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-5xl font-bold text-gray-900 mb-4">Welcome to ${subdomain}.tavic.com</h1>
    <p class="text-gray-500 text-xl">Start editing this page in the builder.</p>
  </div>
</body>
</html>`
      })
      .select()
      .single()

    if (insertError) {
      setError('Something went wrong: ' + insertError.message)
      setLoading(false)
      return
    }

    // 6. Go to builder
    router.push(`/builder/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">

        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
          Back to dashboard
        </Link>

        <h2 className="text-2xl font-bold mb-1">Create a new site</h2>
        <p className="text-gray-400 text-sm mb-6">Choose your subdomain name</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Subdomain</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={subdomain}
                onChange={e => setSubdomain(e.target.value.toLowerCase())}
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="my-awesome-site"
                required
              />
              <span className="text-gray-400 text-sm whitespace-nowrap">.tavic.com</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              3-30 characters, lowercase, hyphens allowed
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create site and open builder'}
          </button>
        </form>

      </div>
    </div>
  )
}