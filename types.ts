
export type Gender = 'M' | 'F';

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'tecnico';
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
