import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { RegionService } from '../services/region.service';
import { UidService } from '../services/uid.service';
import { DireccionService } from '../services/direccion.service';


@Injectable({
  providedIn: 'root'
})
export class RegionGuard implements CanActivate {

  constructor(
    private router: Router,
    private direccionService: DireccionService,
    private regionService: RegionService,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.regionService.getRegion()
      .then(resp => {
        if (!resp) {
          throw false
        }
        return this.direccionService.getDireccion()
      })
      .then(dir => {
        if (dir) return true
        throw false
      })
      .catch(() => {
        this.router.navigate(['/region'])
        return false
      })
  }

}
