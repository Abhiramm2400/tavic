const rateLimitMap = new Map()

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const windowMs = 60 * 1000
  const maxRequests = 10

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, start: now })
  } else {
    const entry = rateLimitMap.get(ip)
    if (now - entry.start < windowMs) {
      if (entry.count >= maxRequests) {
        return Response.json({ error: 'Too many requests. Wait a minute.' }, { status: 429 })
      }
      entry.count++
    } else {
      rateLimitMap.set(ip, { count: 1, start: now })
    }
  }

  const { prompt } = await req.json()

  if (!prompt || prompt.trim().length === 0) {
    return Response.json({ error: 'Prompt is empty' }, { status: 400 })
  }

  let groqResponse
  try {
    groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        max_tokens: 4096,
        messages: [
          {
            role: 'system',
            content: `You are an expert web developer. 
Your job is to return a single complete self-contained HTML file based on the user's request.
Rules:
- Always include <script src="https://cdn.tailwindcss.com"></script> in the head
- For 3D effects use Three.js: <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
- For animations use GSAP: <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
- Never use relative paths, always use CDN links
- Never explain anything
- Never use markdown or code fences
- Output raw HTML only, starting with <!DOCTYPE html>`
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })
  } catch (err) {
    return Response.json({ error: 'Failed to reach Groq: ' + err.message }, { status: 500 })
  }

  const data = await groqResponse.json()
  console.log('Groq raw response:', JSON.stringify(data))

  if (data.error) {
    return Response.json({ error: data.error.message }, { status: 500 })
  }

  const reply = data.choices?.[0]?.message?.content || ''

  if (!reply) {
    return Response.json({ error: 'Groq returned empty response' }, { status: 500 })
  }

  // Strip markdown fences if present
  let code = reply.trim()
  if (code.startsWith('```')) {
    code = code.replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/, '').trim()
  }

  return Response.json({ reply: code })
}