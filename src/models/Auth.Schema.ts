import { z } from 'zod';

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, { message: "El correo es obligatorio" })
        .email({ message: "Correo inválido" }),
    password: z
        .string()
        .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

export const registerSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 letras"),
    email: z
        .string()
        .min(1, { message: "El correo es obligatorio" })
        .email({ message: "Correo inválido" }),
    password: z
        .string()
        .min(6, { message: "Mínimo 6 caracteres" }),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;