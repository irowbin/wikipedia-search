import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TypeaheadContainerComponent } from './typeahead-container.component'
import { provideMockStore } from '@ngrx/store/testing'

describe('TypeaheadContainerComponent', () => {
  let component: TypeaheadContainerComponent
  let fixture: ComponentFixture<TypeaheadContainerComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeaheadContainerComponent],
      providers: [provideMockStore({})],
    }).compileComponents()

    fixture = TestBed.createComponent(TypeaheadContainerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
