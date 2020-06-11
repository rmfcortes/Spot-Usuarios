import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InfoSucursalPage } from './info-sucursal.page';

describe('InfoSucursalPage', () => {
  let component: InfoSucursalPage;
  let fixture: ComponentFixture<InfoSucursalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoSucursalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InfoSucursalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
