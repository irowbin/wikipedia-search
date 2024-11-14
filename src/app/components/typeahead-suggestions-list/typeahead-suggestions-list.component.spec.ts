import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TypeaheadSuggestionsListComponent } from './typeahead-suggestions-list.component'

describe('TypeaheadSuggestionsListComponent', () => {
  let component: TypeaheadSuggestionsListComponent
  let fixture: ComponentFixture<TypeaheadSuggestionsListComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeaheadSuggestionsListComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(TypeaheadSuggestionsListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
