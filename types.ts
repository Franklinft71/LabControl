
export type Gender = 'M' | 'F';
export type UserRole = 'admin' | 'tecnico' | 'recepcionista';
export type UserStatus = 'activo' | 'inactivo';

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: UserRole;
  estado: UserStatus;
  fecha_ingreso: string;
  telefono?: string;
}

export interface Patient {
  id: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  genero: Gender;
  telefono: string;
  email?: string;
  fecha_registro: string;
}

export interface Exam {
  id: number;
  nombre_examen: string;
  rango_referencia: string;
  unidad_medida: string;
  precio: number;
}

export interface Result {
  id: number;
  paciente_id: number;
  examen_id: number;
  valor_resultado: number;
  fecha_registro: string;
  observaciones: string;
}

export interface ResultWithDetails extends Result {
  paciente_nombre: string;
  paciente_apellido: string;
  examen_nombre: string;
  rango_referencia: string;
  unidad_medida: string;
}
