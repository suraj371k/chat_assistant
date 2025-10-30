import * as z from 'zod'

export const registrationSchema = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string()
})

export const loginSchema = z.object({
    email: z.string(),
    password: z.string()
})