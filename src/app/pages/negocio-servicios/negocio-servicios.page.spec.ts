import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NegocioServiciosPage } from './negocio-servicios.page';

describe('NegocioServiciosPage', () => {
  let component: NegocioServiciosPage;
  let fixture: ComponentFixture<NegocioServiciosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NegocioServiciosPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NegocioServiciosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
