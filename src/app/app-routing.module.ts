import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RegionGuard } from './guard/region.guard';


const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home', loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule), canActivate: [RegionGuard]
  },
  {
    path: 'categoria/:cat',
    loadChildren: () => import('./pages/categoria/categoria.module').then( m => m.CategoriaPageModule), canActivate: [RegionGuard]
  },
  {
    path: 'negocio/:cat/:id/:status',
    loadChildren: () => import('./pages/negocio/negocio.module').then( m => m.NegocioPageModule), canActivate: [RegionGuard]
  },
  {
    path: 'negocio-servicios/:cat/:id/:status',
    loadChildren: () => import('./pages/negocio-servicios/negocio-servicios.module').then( m => m.NegocioServiciosPageModule), canActivate: [RegionGuard]
  },
  {
    path: 'mapa/:id',
    loadChildren: () => import('./pages/mapa/mapa.module').then( m => m.MapaPageModule), canActivate: [RegionGuard]
  },
  {
    path: 'historial',
    loadChildren: () => import('./pages/historial/historial.module').then( m => m.HistorialPageModule), canActivate: [RegionGuard]
  },
  {
    path: 'region',
    loadChildren: () => import('./pages/region/region.module').then( m => m.RegionPageModule)
  },
  {
    path: 'avances/:id',
    loadChildren: () => import('./pages/avances/avances.module').then( m => m.AvancesPageModule), canActivate: [RegionGuard]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule],
  providers: [RegionGuard]
})
export class AppRoutingModule { }
