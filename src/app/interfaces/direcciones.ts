export interface Direccion {
    region: string;
    direccion: string;
    lat: number;
    lng: number;
    id?: string;
}

export interface Ubicacion {
    lat: number;
    lng: number;
}