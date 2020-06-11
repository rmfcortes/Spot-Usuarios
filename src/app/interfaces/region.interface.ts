export interface Region {
    centro: Ubicacion;
    ciudad: string;
    referencia: string;
    ubicacion: Ubicacion[];
}

export interface Ubicacion {
    lat: number;
    lng: number;
}
