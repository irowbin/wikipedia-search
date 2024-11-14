import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TypeaheadUserManualComponent } from './typeahead-user-manual.component'
import { provideMockStore } from '@ngrx/store/testing'

describe('TypeaheadUserManualComponent', () => {
  let component: TypeaheadUserManualComponent
  let fixture: ComponentFixture<TypeaheadUserManualComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeaheadUserManualComponent],
      providers:[
        provideMockStore({})
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(TypeaheadUserManualComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
