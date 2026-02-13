import { parseApiError } from "./api-error"

export interface GenerateMindmapResult {
  markdown: string
  mapId?: string
  usage?: {
    monthlyMapsUsed: number
    monthlyMapsLimit: number | null
    isPaid: boolean
  }
}

export async function generateMindmapMarkdown(topic: string, accessToken?: string): Promise<GenerateMindmapResult> {
  try {
    let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

    if (!backendUrl) {
      backendUrl = "https://mindmap-backend-five.vercel.app"
    }
    backendUrl = backendUrl.trim()

    if (!backendUrl.startsWith("http://") && !backendUrl.startsWith("https://")) {
      backendUrl = `https://${backendUrl}`
    }

    backendUrl = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl

    const apiUrl = `${backendUrl}/generate-mindmap`

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ topic }),
    })

    if (!response.ok) {
      throw await parseApiError(response, `Failed to generate mindmap (status ${response.status})`)
    }

    const data = await response.json()

    if (!data.markdown) {
      throw new Error("Invalid response format: missing markdown field")
    }

    return {
      markdown: data.markdown,
      mapId: data.mapId,
      usage: data.usage,
    }
  } catch (error) {
    console.error("Error generating mind map:", error)
    throw error
  }
}
