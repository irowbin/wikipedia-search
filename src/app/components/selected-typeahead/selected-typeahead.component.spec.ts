import { ComponentFixture, TestBed } from '@angular/core/testing'
import { SelectedTypeaheadComponent } from './selected-typeahead.component'

describe('SelectedTypeaheadComponent', () => {
  let component: SelectedTypeaheadComponent
  let fixture: ComponentFixture<SelectedTypeaheadComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedTypeaheadComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(SelectedTypeaheadComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
