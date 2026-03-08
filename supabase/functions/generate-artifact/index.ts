import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transcript, sourceUrl, category } = await req.json()

    let finalTranscript = transcript

    // If YouTube URL provided but no transcript, fetch it
    if (!finalTranscript && sourceUrl) {
      const videoId = extractVideoId(sourceUrl)
      if (videoId) {
        const supadataKey = Deno.env.get('SUPADATA_API_KEY')
        if (supadataKey) {
          try {
            const transcriptRes = await fetch(
              `https://api.supadata.ai/v1/youtube/${videoId}/transcript`,
              {
                headers: { 'x-api-key': supadataKey },
              }
            )
            if (transcriptRes.ok) {
              const data = await transcriptRes.json()
              if (data.text) {
                finalTranscript = data.text
              } else if (data.transcript) {
                finalTranscript = data.transcript
              }
            }
          } catch (e) {
            console.error('Failed to fetch transcript:', e)
          }
        }
      }
    }

    if (!finalTranscript) {
      return new Response(
        JSON.stringify({ error: 'Transcript is required. Provide a YouTube URL or paste transcript manually.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const groqKey = Deno.env.get('GROQ_API_KEY')
    if (!groqKey) {
      return new Response(
        JSON.stringify({ error: 'Groq API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const systemPrompt = `Act as a ${category} expert. Extract 3 high-impact quotes and 5 flashcards from this transcript. Focus on actionable insights. Return ONLY valid JSON in this exact format:
{
  "quotes": [
    {"text": "quote text", "timestamp": "optional timestamp"}
  ],
  "flashcards": [
    {"front": "question or concept", "back": "answer or explanation"}
  ]
}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: finalTranscript.slice(0, 12000) }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return new Response(
        JSON.stringify({ error: 'Groq API error', details: error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '{}'
    
    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      parsed = { quotes: [], flashcards: [] }
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
