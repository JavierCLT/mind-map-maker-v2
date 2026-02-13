export class ApiError extends Error {
  status: number
  code?: string
  payload?: any

  constructor(message: string, status: number, code?: string, payload?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.payload = payload
  }
}

export async function parseApiError(response: Response, fallbackMessage: string): Promise<ApiError> {
  try {
    const data = await response.json()
    const message = data?.message || data?.error || fallbackMessage
    const code = data?.code
    return new ApiError(message, response.status, code, data)
  } catch {
    const text = await response.text()
    return new ApiError(text || fallbackMessage, response.status)
  }
}
