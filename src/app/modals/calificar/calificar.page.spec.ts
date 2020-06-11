import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CalificarPage } from './calificar.page';

describe('CalificarPage', () => {
  let component: CalificarPage;
  let fixture: ComponentFixture<CalificarPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalificarPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CalificarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
