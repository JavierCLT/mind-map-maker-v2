import { parseApiError } from "./api-error"

export interface AccountResponse {
  user: {
    id: string
    email: string | null
  }
  plan: "free" | "pro"
  usage: {
    monthlyMapsUsed: number
    monthlyMapsLimit: number | null
    remainingMaps: number | null
  }
  billing: {
    subscriptionStatus: string
    currentPeriodEnd: string | null
  }
}

export interface SavedMindmap {
  id: string
  topic: string
  markdown: string
  created_at: string
  updated_at: string
}

function backendBaseUrl() {
  let url = process.env.NEXT_PUBLIC_BACKEND_URL || "https://mindmap-backend-five.vercel.app"
  url = url.trim()
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`
  }
  return url.endsWith("/") ? url.slice(0, -1) : url
}

async function authedFetch(path: string, accessToken: string, init?: RequestInit) {
  const response = await fetch(`${backendBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw await parseApiError(response, `Request failed (${response.status})`)
  }
  return response
}

export async function getAccount(accessToken: string): Promise<AccountResponse> {
  const response = await authedFetch("/me", accessToken)
  return (await response.json()) as AccountResponse
}

export async function getMindmaps(accessToken: string): Promise<SavedMindmap[]> {
  const response = await authedFetch("/mindmaps", accessToken)
  const data = await response.json()
  return data.mindmaps || []
}

export async function saveMindmap(
  accessToken: string,
  payload: { id?: string; topic: string; markdown: string },
): Promise<SavedMindmap> {
  const response = await authedFetch("/mindmaps", accessToken, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  return data.mindmap
}

export async function createCheckout(accessToken: string): Promise<string> {
  const response = await authedFetch("/checkout", accessToken, {
    method: "POST",
  })
  const data = await response.json()
  return data.url
}

export async function createBillingPortal(accessToken: string): Promise<string> {
  const response = await authedFetch("/billing-portal", accessToken, {
    method: "POST",
  })
  const data = await response.json()
  return data.url
}

export async function renameMindmap(accessToken: string, id: string, topic: string): Promise<SavedMindmap> {
  const response = await authedFetch("/mindmaps", accessToken, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, topic }),
  })
  const data = await response.json()
  return data.mindmap
}

export async function deleteMindmap(accessToken: string, id: string): Promise<void> {
  await authedFetch(`/mindmaps?id=${encodeURIComponent(id)}`, accessToken, {
    method: "DELETE",
  })
}
