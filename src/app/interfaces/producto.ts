export interface Producto {
    agotado: boolean;
    codigo: string;
    descripcion: string;
    id: string;
    nombre: string;
    pasillo: string;
    precio: number;
    unidad: string;
    url: string;
    variables: boolean;
    agregados?: number;
    cantidad?: number;
    idAsCart?: string;
    complementos?: ListaComplementosElegidos[];
    observaciones?: string;
    total?: number;
    descuento?: number;
    dosxuno?: boolean;
}

export interface ProductoAlgolia {
    agotado: boolean;
    url: string;
    precio: number;
    nombre: string;
    objectID: string;
    descripcion: string;
    descuento: number;
    dosxuno: boolean;
    idNegocio: string;
    categoria: string;
    nombreNegocio: string;
}

export interface ListaComplementos {
    titulo: string;
    limite: number;
    obligatorio: boolean;
    productos: Complemento[];
    elegido?: boolean;
    radioSelected?: number;
}

export interface ListaComplementosElegidos {
    titulo: string;
    complementos: Complemento[];
    radioSelected?: number;
}
export interface Complemento {
    nombre: string;
    precio: number;
    isChecked?: boolean;
    deshabilitado?: boolean;
}

export interface MasVendido {
    agotado: boolean;
    categoria: string;
    descripcion: string;
    id: string;
    idNegocio: string;
    nombre: string;
    nombreNegocio: string;
    pasillo: string;
    precio: number;
    url: string;
    ventas?: number;
    descuento?: number;
    dosxuno?: boolean;
}

export interface Cart{
    detalles: Producto[];
    cantidades: number[];
}
