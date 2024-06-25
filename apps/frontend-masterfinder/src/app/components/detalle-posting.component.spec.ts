import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallePostingComponent } from './detalle-posting.component';

describe('DetallePostingComponent', () => {
  let component: DetallePostingComponent;
  let fixture: ComponentFixture<DetallePostingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePostingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetallePostingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
