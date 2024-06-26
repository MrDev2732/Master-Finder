import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilePostingComponent } from './profile-posting.component';

describe('ProfilePostingComponent', () => {
  let component: ProfilePostingComponent;
  let fixture: ComponentFixture<ProfilePostingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePostingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePostingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
