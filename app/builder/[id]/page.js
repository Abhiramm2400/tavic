'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const BLOCKS = [
  { type: 'navbar', label: 'Navbar', icon: '🔝', html: `<nav style="background:#1e293b;padding:16px 32px;display:flex;justify-content:space-between;align-items:center;"><span style="color:white;font-size:1.5rem;font-weight:bold;">Brand</span><div style="display:flex;gap:24px;"><a href="#" style="color:#94a3b8;text-decoration:none;">Home</a><a href="#" style="color:#94a3b8;text-decoration:none;">About</a><a href="#" style="color:#94a3b8;text-decoration:none;">Contact</a></div></nav>` },
  { type: 'hero', label: 'Hero', icon: '🦸', html: `<section style="background:linear-gradient(135deg,#667eea,#764ba2);padding:80px 32px;text-align:center;"><h1 style="color:white;font-size:3rem;font-weight:bold;margin-bottom:16px;">Welcome to My Site</h1><p style="color:#e2e8f0;font-size:1.25rem;margin-bottom:32px;">A beautiful landing page built with TAVIC</p><a href="#" style="background:white;color:#667eea;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">Get Started</a></section>` },
  { type: 'text', label: 'Text Block', icon: '📝', html: `<section style="padding:48px 32px;max-width:800px;margin:0 auto;"><h2 style="font-size:2rem;font-weight:bold;margin-bottom:16px;color:#1e293b;">Section Title</h2><p style="color:#64748b;font-size:1.1rem;line-height:1.8;">Add your content here. This is a text block you can edit to tell your story, describe your services, or share information with your visitors.</p></section>` },
  { type: 'features', label: 'Features', icon: '⭐', html: `<section style="padding:64px 32px;background:#f8fafc;"><h2 style="text-align:center;font-size:2rem;font-weight:bold;margin-bottom:48px;color:#1e293b;">Our Features</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;max-width:1100px;margin:0 auto;"><div style="background:white;padding:32px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;"><div style="font-size:2.5rem;margin-bottom:16px;">⚡</div><h3 style="font-weight:bold;margin-bottom:8px;color:#1e293b;">Fast</h3><p style="color:#64748b;">Lightning fast performance</p></div><div style="background:white;padding:32px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;"><div style="font-size:2.5rem;margin-bottom:16px;">🔒</div><h3 style="font-weight:bold;margin-bottom:8px;color:#1e293b;">Secure</h3><p style="color:#64748b;">Enterprise grade security</p></div><div style="background:white;padding:32px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;"><div style="font-size:2.5rem;margin-bottom:16px;">🎨</div><h3 style="font-weight:bold;margin-bottom:8px;color:#1e293b;">Beautiful</h3><p style="color:#64748b;">Stunning designs out of the box</p></div></div></section>` },
  { type: 'cta', label: 'Call to Action', icon: '📣', html: `<section style="background:#1e293b;padding:64px 32px;text-align:center;"><h2 style="color:white;font-size:2.5rem;font-weight:bold;margin-bottom:16px;">Ready to get started?</h2><p style="color:#94a3b8;font-size:1.1rem;margin-bottom:32px;">Join thousands of users building with TAVIC</p><a href="#" style="background:#6366f1;color:white;padding:14px 40px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:1.1rem;">Start for free</a></section>` },
  { type: 'footer', label: 'Footer', icon: '🔻', html: `<footer style="background:#0f172a;padding:32px;text-align:center;"><p style="color:#475569;">© 2025 My Site. Built with TAVIC.</p></footer>` },
  { type: 'image', label: 'Image', icon: '🖼️', html: `<section style="padding:32px;text-align:center;"><img src="https://placehold.co/800x400/6366f1/white?text=Your+Image+Here" style="width:100%;max-width:800px;border-radius:12px;" alt="placeholder"/></section>` },
  { type: 'contact', label: 'Contact Form', icon: '✉️', html: `<section style="padding:64px 32px;background:#f8fafc;"><div style="max-width:600px;margin:0 auto;"><h2 style="font-size:2rem;font-weight:bold;margin-bottom:32px;text-align:center;color:#1e293b;">Contact Us</h2><form style="display:flex;flex-direction:column;gap:16px;"><input type="text" placeholder="Your Name" style="padding:12px;border:1px solid #e2e8f0;border-radius:8px;font-size:1rem;"/><input type="email" placeholder="Your Email" style="padding:12px;border:1px solid #e2e8f0;border-radius:8px;font-size:1rem;"/><textarea placeholder="Your Message" rows="5" style="padding:12px;border:1px solid #e2e8f0;border-radius:8px;font-size:1rem;resize:vertical;"></textarea><button type="submit" style="background:#6366f1;color:white;padding:14px;border:none;border-radius:8px;font-size:1rem;font-weight:bold;cursor:pointer;">Send Message</button></form></div></section>` },
]

export default function BuilderPage() {
  const { id } = useParams()
  const router = useRouter()
  const [html, setHtml] = useState('')
  const [site, setSite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [mode, setMode] = useState('blocks') // blocks | code | preview
  const [dragOver, setDragOver] = useState(false)
  const [previewSize, setPreviewSize] = useState('desktop')

  useEffect(() => {
    const loadSite = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
      if (error || !data) { router.push('/dashboard'); return }
      setSite(data)
      setHtml(data.html_content || '')
      setLoading(false)
    }
    loadSite()
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('sites').update({ html_content: html }).eq('id', id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAI = async () => {
    if (!prompt.trim()) return
    setAiLoading(true)
    setAiError('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      if (data.error) { setAiError(data.error); setAiLoading(false); return }
      if (data.reply && data.reply.trim().length > 0) {
        let code = data.reply.trim()
        if (code.startsWith('```')) {
          code = code.replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/,'').trim()
        }
        setHtml(code)
        setPrompt('')
        setMode('preview')
      } else {
        setAiError('AI returned empty response. Try a different prompt.')
      }
    } catch (err) {
      setAiError('Network error: ' + err.message)
    }
    setAiLoading(false)
  }

  const addBlock = (block) => {
    // If html is empty or is default, wrap in proper html structure
    if (!html || html.trim() === '' || html.includes('Start editing this page')) {
      setHtml(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<script src="https://cdn.tailwindcss.com"></script>
<title>My Site</title>
</head>
<body>
${block.html}
</body>
</html>`)
    } else {
      // Insert block before closing body tag
      if (html.includes('</body>')) {
        setHtml(html.replace('</body>', `${block.html}\n</body>`))
      } else {
        setHtml(html + '\n' + block.html)
      }
    }
    setMode('preview')
  }

  const previewWidth = previewSize === 'mobile' ? '390px' : previewSize === 'tablet' ? '768px' : '100%'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-gray-400">Loading builder...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">

      {/* Top bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-blue-400 text-sm hover:text-blue-300">
            Back
          </Link>
          <span className="text-white font-medium text-sm">{site?.subdomain}.tavic.com</span>
        </div>

        {/* Mode switcher */}
        <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
          {['blocks', 'code', 'preview'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded text-sm capitalize transition ${mode === m ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {m === 'blocks' ? '🧩 Blocks' : m === 'code' ? '💻 Code' : '👁 Preview'}
            </button>
          ))}
        </div>

        {/* Preview size (only in preview mode) */}
        {mode === 'preview' && (
          <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
            {[['desktop','🖥'], ['tablet','📱'], ['mobile','📲']].map(([size, icon]) => (
              <button
                key={size}
                onClick={() => setPreviewSize(size)}
                className={`px-3 py-1 rounded text-sm transition ${previewSize === size ? 'bg-gray-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {icon}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {saving ? 'Saving...' : saved ? '✅ Saved!' : '💾 Save'}
        </button>
      </div>

      {/* AI Bar */}
      <div className="bg-gray-850 border-b border-gray-700 px-4 py-2 flex gap-2 shrink-0" style={{background:'#111827'}}>
        <div className="flex items-center gap-2 text-purple-400 text-sm whitespace-nowrap">
          ✨ AI
        </div>
        {aiError && (
          <span className="text-red-400 text-xs flex items-center">{aiError}</span>
        )}
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !aiLoading && handleAI()}
          placeholder="Describe what you want to build... e.g. 'a portfolio page with dark theme and animations'"
          className="flex-1 bg-gray-700 text-white text-sm px-3 py-1.5 rounded border border-gray-600 focus:outline-none focus:border-purple-500"
          disabled={aiLoading}
        />
        <button
          onClick={handleAI}
          disabled={aiLoading || !prompt.trim()}
          className="bg-purple-600 text-white px-4 py-1.5 rounded text-sm hover:bg-purple-700 disabled:opacity-50 whitespace-nowrap font-medium"
        >
          {aiLoading ? '⏳ Thinking...' : '🚀 Generate'}
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">

        {/* BLOCKS MODE */}
        {mode === 'blocks' && (
          <>
            {/* Block sidebar */}
            <div className="w-56 bg-gray-800 border-r border-gray-700 overflow-y-auto shrink-0">
              <p className="text-gray-400 text-xs px-3 pt-3 pb-2 uppercase tracking-wider">Drag or click to add</p>
              {BLOCKS.map(block => (
                <button
                  key={block.type}
                  onClick={() => addBlock(block)}
                  className="w-full text-left px-3 py-3 hover:bg-gray-700 border-b border-gray-700 transition group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{block.icon}</span>
                    <span className="text-gray-300 text-sm group-hover:text-white">{block.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="flex-1 bg-gray-900 overflow-auto">
              {html && (html.trim().length > 50) ? (
                <iframe
                  srcDoc={html}
                  sandbox="allow-scripts allow-same-origin"
                  className="w-full h-full border-none bg-white"
                  title="Preview"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-8">
                  <div className="text-6xl mb-4">🧩</div>
                  <h3 className="text-white text-xl font-semibold mb-2">Start building</h3>
                  <p className="text-gray-400 mb-6">Click a block on the left to add it, or use AI above to generate a full page</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* CODE MODE */}
        {mode === 'code' && (
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              defaultLanguage="html"
              value={html}
              onChange={(val) => setHtml(val || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        )}

        {/* PREVIEW MODE */}
        {mode === 'preview' && (
          <div className="flex-1 bg-gray-700 overflow-auto flex justify-center p-4">
            <div style={{ width: previewWidth, height: '100%', transition: 'width 0.3s' }}>
              <iframe
                srcDoc={html}
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-full border-none rounded-lg shadow-2xl bg-white"
                title="Preview"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}