import { Producto } from 'src/app/interfaces/producto';
import { Direccion } from './direcciones';
import { FormaPago } from './forma-pago.interface';

export interface Pedido {
    aceptado: any;
    cliente: Cliente;
    createdAt: number;
    comision: number;
    id?: string;
    entrega: string;
    formaPago: FormaPago;
    negocio: DatosNegocioParaPedido;
    productos: Producto[];
    avances: Avance[];
    region: string;
    repartidor?: Repartidor;
    total: number;
    unRead?: number;
    entregado?: boolean;
    categoria?: string;
    calificacion?: Calificacion;
}

export interface Avance {
    fecha: number;
    concepto: string;
}

export interface Calificacion {
    creado: number;
    region: string;
    negocio: DetallesCalificacionNegocio;
    repartidor: DetallesCalificacionRepartidor;
}

export interface DetallesCalificacionNegocio {
    comentarios: string;
    idNegocio: string;
    puntos: number;
}

export interface DetallesCalificacionRepartidor {
    comentarios: string;
    idRepartidor: string;
    puntos: number;
    externo: boolean;
}

export interface Repartidor {
    nombre: string;
    telefono: string;
    foto: string;
    lat: number;
    lng: number;
    id: string;
    externo: boolean;
}

export interface Cliente {
    direccion: Direccion;
    nombre: string;
    telefono?: string;
    uid: string;
}


export interface DatosNegocioParaPedido {
    envio: number;
    idNegocio: string;
    direccion: Direccion;
    nombreNegocio: string;
    logo: string;
    telefono: number;
    entrega: string;
    formas_pago: FormaPagoPermitida;
}

export interface FormaPagoPermitida {
    efectivo: boolean;
    tarjeta: boolean;
}
