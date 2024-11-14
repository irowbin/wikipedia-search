import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TypeaheadControlComponent } from './typeahead-control.component'
import { provideMockStore } from '@ngrx/store/testing'

describe('TypeaheadControlComponent', () => {
  let component: TypeaheadControlComponent
  let fixture: ComponentFixture<TypeaheadControlComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeaheadControlComponent],
      providers:[
        provideMockStore({})
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(TypeaheadControlComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
