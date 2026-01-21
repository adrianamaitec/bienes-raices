// lib/types.ts

// Tipo para la tabla `users`
export type User = {
    id: string; // UUID de Supabase Auth
    first_name: string;
    last_name: string;
    email: string;
    phone?: string; // Opcional
    profile_image_url?: string; // Opcional
    role: 'client' | 'architect'; // Roles definidos
    address?: string; // Opcional
    created_at: string; // Fecha en formato ISO
};

// Tipo para la tabla `departments`
export type Department = {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    tamano: number;
    calle: string;
    zona: string;
    piso: number;
    dormitorios: number;
    banos: number;
    latitud: number;
    longitud: number;
    url_imagen?: string; // Opcional
    creado_en: string; // Fecha en formato ISO
    status: "available" | "sold" | "reserved";
};

// Tipo para la tabla `images`
export type Image = {
    id: number;
    department_id: number;
    image_url: string;
    created_at: string; // Fecha en formato ISO
};

// Tipo para la tabla `models`
export type Model = {
    id: number;
    department_id: number;
    model_url: string;
    created_at: string; // Fecha en formato ISO
};

// Tipo para respuestas de Supabase
export type SupabaseResponse<T> = {
    data: T | null;
    error: any;
};

// lib/types.ts

// Tipo para la función de creación de un departamento
export type CreateDepartmentParams = Omit<Department, 'id' | 'created_at'>;

// Tipo para la función de actualización de un departamento
export type UpdateDepartmentParams = Partial<Department> & { id: number };

// Tipo para la función de eliminación de un departamento
export type DeleteDepartmentParams = { id: number };