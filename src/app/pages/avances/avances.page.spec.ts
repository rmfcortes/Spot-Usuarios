import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AvancesPage } from './avances.page';

describe('AvancesPage', () => {
  let component: AvancesPage;
  let fixture: ComponentFixture<AvancesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvancesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AvancesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
