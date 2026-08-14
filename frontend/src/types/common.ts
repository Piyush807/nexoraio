export interface ApiErrorShape {
  status?: number
  message: string
  details?: string
}

export class ApiError extends Error {
  status?: number
  details?: string
  constructor(shape: ApiErrorShape) {
    super(shape.message)
    this.status = shape.status
    this.details = shape.details
  }
}
