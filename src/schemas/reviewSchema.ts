import {
  array,
  minLength,
  number,
  object,
  optional,
  picklist,
  pipe,
  string,
  transform,
  unknown,
  nullish,
} from 'valibot'
import type { InferOutput } from 'valibot'

// Acepta string o number y siempre devuelve number (para campos decimal de MySQL)
const coerceNumber = pipe(unknown(), transform(Number))

// ─── Enums ────────────────────────────────────────────────────────────────────

export const ToolStateSchema = picklist([
  'nuevo',
  'buen estado',
  'regular',
  'mal estado',
  'obsoleto',
])

// ─── Schemas de respuesta API ─────────────────────────────────────────────────

export const ReviewToolSchema = object({
  id: number(),
  name: string(),
  category: string(),
  price: coerceNumber,
  supplier: string(),
  quantity: number(),
  unassigned_quantity: number(),
})

export const ReviewAsignationSchema = object({
  id: number(),
  tool_id: number(),
  worker_id: number(),
  assigned_quantity: number(),
  state: ToolStateSchema,
  date: string(),
  tool: optional(ReviewToolSchema),
})

export const LostToolSchema = object({
  id: number(),
  review_id: number(),
  tool_id: number(),
  worker_id: number(),
  quantity_lost: number(),
  lost_at: string(),
  tool: optional(ReviewToolSchema),
})

export const ReviewItemSchema = object({
  id: number(),
  review_id: number(),
  tool_id: number(),
  worker_id: number(),
  previous_state: ToolStateSchema,
  new_state: nullish(ToolStateSchema),
  tool: optional(ReviewToolSchema),
})

export const ReviewSchema = object({
  id: number(),
  worker_id: number(),
  reviewed_by: number(),
  name: string(),
  created_at: string(),
  worker: optional(object({
    id: number(),
    name: string(),
    lastname: string(),
    worker_code: string(),
    area: string(),
  })),
  review_items: optional(array(ReviewItemSchema)),
  lost_tools: optional(array(LostToolSchema)),
})

export const ReviewListResponseSchema = object({
  data: array(ReviewSchema),
})

export const CreateReviewResponseSchema = object({
  data: ReviewSchema,
})

export const ReviewDetailResponseSchema = object({
  data: ReviewSchema,
})

// ─── Schemas de entrada ───────────────────────────────────────────────────────

export const ReviewItemInputSchema = object({
  asignation_id: number(),
  quantity_present: number(),
  new_state: optional(ToolStateSchema),
})

export const CreateReviewInputSchema = object({
  worker_id: number(),
  name: pipe(string(), minLength(1, 'El nombre es requerido')),
  items: array(ReviewItemInputSchema),
})

// ─── Tipos inferidos ──────────────────────────────────────────────────────────

export type ToolState = InferOutput<typeof ToolStateSchema>
export type ReviewTool = InferOutput<typeof ReviewToolSchema>
export type ReviewAsignation = InferOutput<typeof ReviewAsignationSchema>
export type LostTool = InferOutput<typeof LostToolSchema>
export type ReviewItem = InferOutput<typeof ReviewItemSchema>
export type Review = InferOutput<typeof ReviewSchema>
export type ReviewItemInput = InferOutput<typeof ReviewItemInputSchema>
export type CreateReviewInput = InferOutput<typeof CreateReviewInputSchema>

// Agrupación de asignaciones del mismo tool para el wizard
export interface ReviewGroup {
  tool_id: number
  tool?: ReviewTool
  state: ToolState
  asignations: ReviewAsignation[]
}

export interface ReviewItemResult {
  group: ReviewGroup
  quantityPresent: number
  unitStates: ToolState[] // one per present unit, in asignations order
}
