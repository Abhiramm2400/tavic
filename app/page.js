import Link from 'next/link'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 border-b">
        <span className="text-xl font-bold text-blue-600">TAVIC</span>
        <div className="flex gap-4">
          <Link href="/login" className="text-gray-600 hover:text-black">Login</Link>
          <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-4 py-24">
        <h1 className="text-6xl font-bold text-gray-900 mb-6 max-w-3xl leading-tight">
          Build your website in minutes
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-xl">
          AI-powered builder. Custom subdomain. One-click publish.
          No coding required.
        </p>
        <div className="flex gap-4">
          <Link href="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700">
            Start for free
          </Link>
          <Link href="#pricing" className="border border-gray-300 px-8 py-3 rounded-lg text-lg hover:bg-gray-50">
            See pricing
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-16 py-16 bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="text-lg font-semibold mb-2">AI Builder</h3>
          <p className="text-gray-500">Describe your site and AI builds it instantly. Frontend, backend, everything.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-3">🌐</div>
          <h3 className="text-lg font-semibold mb-2">Your own subdomain</h3>
          <p className="text-gray-500">Get yourname.tavic.com instantly. No setup, no DNS headaches.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-3">🚀</div>
          <h3 className="text-lg font-semibold mb-2">One-click publish</h3>
          <p className="text-gray-500">Hit publish and your site is live in seconds. No FTP, no hosting config.</p>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="py-20 px-8 text-center">
        <h2 className="text-4xl font-bold mb-12">Simple pricing</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center max-w-4xl mx-auto">

          <div className="flex-1 border rounded-xl p-8">
            <h3 className="text-xl font-bold mb-2">Free</h3>
            <div className="text-4xl font-bold mb-4">₹0</div>
            <ul className="text-gray-500 space-y-2 mb-8 text-left">
              <li>✅ 1 site</li>
              <li>✅ yourname.tavic.com</li>
              <li>✅ AI builder (limited)</li>
              <li>✅ 100MB storage</li>
            </ul>
            <Link href="/signup" className="block bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200">
              Get started
            </Link>
          </div>

          <div className="flex-1 border-2 border-blue-600 rounded-xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
              Popular
            </div>
            <h3 className="text-xl font-bold mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-4">₹299<span className="text-lg font-normal text-gray-400">/mo</span></div>
            <ul className="text-gray-500 space-y-2 mb-8 text-left">
              <li>✅ 5 sites</li>
              <li>✅ Custom domain support</li>
              <li>✅ Unlimited AI usage</li>
              <li>✅ 5GB storage</li>
              <li>✅ Priority support</li>
            </ul>
            <Link href="/signup" className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Start Pro
            </Link>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t px-8 py-6 text-center text-gray-400 text-sm">
        © 2025 TAVIC. Built by Abhi.
      </footer>

    </div>
  )
}