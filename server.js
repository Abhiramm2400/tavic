require('dotenv').config({ path: '.env.server' })
const express = require('express')
const { createClient } = require('@supabase/supabase-js')

const app = express()

const supabase = createClient(
 process.env.SUPABASE_URL,
 process.env.SUPABASE_SERVICE_KEY
)

function getSubdomainFromHost(host) {
 const hostname = (host || '').split(':')[0].toLowerCase()

 if (!hostname) {
   return null
 }

 const localHosts = ['localhost', '127.0.0.1', '::1']
 if (localHosts.includes(hostname)) {
   return null
 }

 if (hostname.endsWith('.localhost')) {
   const subdomain = hostname.replace(/\.localhost$/, '')
   return subdomain || null
 }

 if (hostname.endsWith('.localtest.me')) {
   const subdomain = hostname.replace(/\.localtest\.me$/, '')
   return subdomain || null
 }

 const parts = hostname.split('.')
 if (parts.length < 3) {
   return null
 }

 const subdomain = parts[0]
 const reserved = ['www', 'admin', 'api', 'mail']
 if (reserved.includes(subdomain)) {
   return null
 }

 return subdomain
}

app.use(async (req, res) => {
 const host = req.headers.host || ''
 const subdomain = getSubdomainFromHost(host)

 if (!subdomain) {
   return res.redirect('https://tavic.com')
 }

 try {
   const { data, error } = await supabase
     .from('sites')
     .select('html_content, seo_title, seo_description')
     .eq('subdomain', subdomain)
     .single()

   if (error || !data) {
     return res.status(404).send(`
       <!DOCTYPE html>
       <html>
       <head>
         <title>Site Not Found</title>
         <script src="https://cdn.tailwindcss.com"></script>
       </head>
       <body class="min-h-screen bg-gray-900 flex items-center justify-center">
         <div class="text-center">
           <h1 class="text-6xl font-bold text-white mb-4">404</h1>
           <p class="text-gray-400 text-xl mb-8">${subdomain}.tavic.com doesn't exist yet.</p>
           <a href="https://tavic.com" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
             Create your site on TAVIC
           </a>
         </div>
       </body>
       </html>
     `)
   }

   let html = data.html_content
   if (data.seo_title && html.includes('<title>')) {
     html = html.replace(/<title>.*?<\/title>/, `<title>${data.seo_title}</title>`)
   }
   if (data.seo_description && html.includes('</head>')) {
     html = html.replace('</head>', `<meta name="description" content="${data.seo_description}"/></head>`)
   }

   res.setHeader('Content-Type', 'text/html; charset=utf-8')
   return res.send(html)
 } catch (err) {
   console.error('Error while serving site:', err)
   return res.status(500).send('Unable to load site.')
 }
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Subdomain server running on port ${PORT}`))