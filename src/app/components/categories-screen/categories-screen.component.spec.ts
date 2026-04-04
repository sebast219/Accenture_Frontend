import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CategoriesScreenComponent } from './categories-screen.component';

describe('CategoriesScreenComponent', () => {
  let component: CategoriesScreenComponent;
  let fixture: ComponentFixture<CategoriesScreenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CategoriesScreenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
