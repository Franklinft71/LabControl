
import { useState, useEffect } from 'react';
import { Patient, Exam, Result, ResultWithDetails } from './types';

// Initial Mock Data
const INITIAL_EXAMS: Exam[] = [
  { id: 1, nombre_examen: 'Glucosa en Ayunas', rango_referencia: '70-100', unidad_medida: 'mg/dL', precio: 15.00 },
  { id: 2, nombre_examen: 'Colesterol Total', rango_referencia: '150-200', unidad_medida: 'mg/dL', precio: 20.00 },
  { id: 3, nombre_examen: 'Hemoglobina Glicosilada', rango_referencia: '4.0-5.6', unidad_medida: '%', precio: 35.00 },
  { id: 4, nombre_examen: 'Creatinina', rango_referencia: '0.7-1.3', unidad_medida: 'mg/dL', precio: 18.00 },
];

export const useLabData = () => {
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('lab_patients');
    return saved ? JSON.parse(saved) : [
      { id: 1, nombre: 'Juan', apellido: 'Pérez', fecha_nacimiento: '1985-05-15', genero: 'M', telefono: '555-0101', fecha_registro: new Date().toISOString() },
      { id: 2, nombre: 'María', apellido: 'García', fecha_nacimiento: '1992-08-22', genero: 'F', telefono: '555-0202', fecha_registro: new Date().toISOString() }
    ];
  });

  const [exams] = useState<Exam[]>(INITIAL_EXAMS);

  const [results, setResults] = useState<Result[]>(() => {
    const saved = localStorage.getItem('lab_results');
    return saved ? JSON.parse(saved) : [
      { id: 1, paciente_id: 1, examen_id: 1, valor_resultado: 115, fecha_registro: new Date().toISOString(), observaciones: 'Paciente reporta ayuno de 8 horas.' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('lab_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('lab_results', JSON.stringify(results));
  }, [results]);

  const addPatient = (p: Omit<Patient, 'id' | 'fecha_registro'>) => {
    const newPatient: Patient = {
      ...p,
      id: patients.length > 0 ? Math.max(...patients.map(x => x.id)) + 1 : 1,
      fecha_registro: new Date().toISOString()
    };
    setPatients([...patients, newPatient]);
    return newPatient;
  };

  const addResult = (r: Omit<Result, 'id' | 'fecha_registro'>) => {
    const newResult: Result = {
      ...r,
      id: results.length > 0 ? Math.max(...results.map(x => x.id)) + 1 : 1,
      fecha_registro: new Date().toISOString()
    };
    setResults([...results, newResult]);
    return newResult;
  };

  const getResultsWithDetails = (): ResultWithDetails[] => {
    return results.map(r => {
      const p = patients.find(x => x.id === r.paciente_id);
      const e = exams.find(x => x.id === r.examen_id);
      return {
        ...r,
        paciente_nombre: p?.nombre || 'N/A',
        paciente_apellido: p?.apellido || 'N/A',
        examen_nombre: e?.nombre_examen || 'N/A',
        rango_referencia: e?.rango_referencia || 'N/A',
        unidad_medida: e?.unidad_medida || 'N/A'
      };
    });
  };

  return {
    patients,
    exams,
    results,
    addPatient,
    addResult,
    getResultsWithDetails
  };
};
