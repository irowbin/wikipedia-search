import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TypeaheadSelectedComponent } from './typeahead-selected.component'
import { provideMockStore } from '@ngrx/store/testing'

describe('TypeaheadSelectedComponent', () => {
  let component: TypeaheadSelectedComponent
  let fixture: ComponentFixture<TypeaheadSelectedComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeaheadSelectedComponent],
      providers:[
        provideMockStore({})
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(TypeaheadSelectedComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
