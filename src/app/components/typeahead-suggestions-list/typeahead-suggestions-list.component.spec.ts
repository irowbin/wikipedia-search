import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TypeaheadSuggestionsListComponent } from './typeahead-suggestions-list.component'
import { provideMockStore } from '@ngrx/store/testing'

describe('TypeaheadSuggestionsListComponent', () => {
  let component: TypeaheadSuggestionsListComponent
  let fixture: ComponentFixture<TypeaheadSuggestionsListComponent>

  // Must come before other beforeEach
  beforeEach(() => {
    // mock IntersectionObserver properly so jest can pass using mock
    (global as any).IntersectionObserver = class IntersectionObserver {
      observe() {
        return null
      }
      disconnect() {
        return null
      }
    }
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeaheadSuggestionsListComponent],
      providers:[
        provideMockStore({})
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(TypeaheadSuggestionsListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })



  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
