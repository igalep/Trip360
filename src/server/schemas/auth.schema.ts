import { z } from 'zod';

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .transform((val) => val.trim().toLowerCase())
  .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: 'Invalid email address',
  });

export const RegisterUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(4, 'Password must be at least 4 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').transform((val) => val.trim()),
});

export const LoginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserSchema>;
