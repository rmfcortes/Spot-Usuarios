import { Producto } from './producto';

export interface Negocio {
    abierto: boolean;
    foto: string;
    id: string;
    nombre: string;
    promedio: number;
    subCategoria: string;
    tipo: string;
    valoraciones: number;
}

export interface DetallesNegocio {
    descripcion: string;
    direccion: string;
    lat: number;
    lng: number;
    telefono: number;
    horario: Horario[];
}

export interface ProductoPasillo {
    nombre: string;
    productos: Producto[];
}

export interface DatosParaCuenta {
    logo: string;
    idNegocio: string;
    nombreNegocio: string;
    categoria: string;
    abierto?: boolean;
}

export interface Horario {
    activo: boolean;
    dia: string;
    corrido?: boolean;
    horaApertura: string;
    horaCierre: string;
}

export interface NegocioInfo {
    datos: DatosParaCuenta;
    detalles: DetallesNegocio;
    status: boolean;
}

export interface Oferta {
    categoria: string;
    foto: string;
    id: string;
    idNegocio: string;
    abierto: boolean;
}

export interface InfoPasillos {
    pasillos: Pasillo[];
    vista: string;
    portada: string;
    telefono?: string;
    whats?: string;
}

export interface Pasillo {
    nombre: string;
    prioridad: number;
}

export interface InfoGral {
    abierto: boolean;
    categoria: string;
    cuenta: string;
    foto: string;
    idNegocio: string;
    nombre: string;
    subCategoria: string;
    tipo: string;
    visitas: number;
    productos: number;
    promedio?: number;
    calificaciones?: number;
}

export interface NegocioBusqueda{
    abierto: boolean;
    foto: string;
    idNegocio: string;
    nombre: string;
    palabras: string;
    promedio?: number;
}

export interface visistasNegocio {
    idNegocio: string;
    visitas: number
}
