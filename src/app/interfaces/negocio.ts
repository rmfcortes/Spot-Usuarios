import { Producto } from './producto';
import { Direccion } from './direcciones';

export interface Negocio {
    abierto: boolean;
    calificaciones;
    categoria: string;
    foto: string;
    id: string;
    nombre: string;
    promedio: number;
    subCategoria: string;
    tipo: string;
    valoraciones: number;
    envio: number;
    envio_costo_fijo: boolean;
    envio_gratis_pedMin: number;
    repartidores_propios: boolean;
    direccion: Direccion;
}

export interface NegocioAlgolia {
    abierto: boolean;
    categoria: string;
    nombre: string;
    productos: number;
    subCategoria: string[];
    objectID: string;
    logo: string;
}

export interface DetallesNegocio {
    descripcion: string;
    telefono: string;
    horario: Horario[];
    direccion?: string;
    lat: number;
    lng: number;
}

export interface ProductoPasillo {
    nombre: string;
    productos: Producto[];
}

export interface DatosParaCuenta {
    logo: string;
    direccion: Direccion;
    idNegocio: string;
    nombreNegocio: string;
    categoria: string;
    abierto?: boolean;
    envio?: number;
    envio_gratis_pedMin?: number;
    repartidores_propios?: boolean;
    envio_costo_fijo?: boolean;
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
    loaded?: boolean;
    tipo: string;
    agotado: boolean;
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
    cantidad: number;
}

export interface InfoGral {
    abierto: boolean;
    categoria: string;
    plan: string;
    foto: string;
    idNegocio: string;
    nombre: string;
    subCategoria: string;
    tipo: string;
    visitas: number;
    productos: number;
    promedio?: number;
    calificaciones?: number;
    envio: number;
    envio_costo_fijo: boolean;
    envio_gratis_pedMin: number;
    repartidores_propios: boolean;
    direccion: Direccion;

}

export interface NegocioBusqueda{
    abierto: boolean;
    foto: string;
    idNegocio: string;
    nombre: string;
    palabras: string;
    promedio?: number;
    envio: number;
    envio_costo_fijo: boolean;
    envio_gratis_pedMin: number;
    repartidores_propios: boolean;
    direccion: Direccion;
}

export interface visistasNegocio {
    idNegocio: string;
    visitas: number
}
