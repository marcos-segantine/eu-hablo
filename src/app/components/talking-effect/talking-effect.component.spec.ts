import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalkingEffectComponent } from './talking-effect.component';

describe('TalkingEffectComponent', () => {
  let component: TalkingEffectComponent;
  let fixture: ComponentFixture<TalkingEffectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalkingEffectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TalkingEffectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
