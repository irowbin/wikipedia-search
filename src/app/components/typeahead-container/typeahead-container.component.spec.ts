import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TypeaheadContainerComponent } from './typeahead-container.component'

describe('TypeaheadContainerComponent', () => {
  let component: TypeaheadContainerComponent
  let fixture: ComponentFixture<TypeaheadContainerComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeaheadContainerComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(TypeaheadContainerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
