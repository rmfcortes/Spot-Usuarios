import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NegocioPage } from './negocio.page';

describe('NegocioPage', () => {
  let component: NegocioPage;
  let fixture: ComponentFixture<NegocioPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NegocioPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NegocioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
