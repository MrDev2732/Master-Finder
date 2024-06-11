import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilWorkerComponent } from './perfil-worker.component';

describe('PerfilWorkerComponent', () => {
  let component: PerfilWorkerComponent;
  let fixture: ComponentFixture<PerfilWorkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilWorkerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
