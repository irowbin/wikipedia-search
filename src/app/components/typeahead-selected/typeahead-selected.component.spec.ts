import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TypeaheadSelectedComponent } from './typeahead-selected.component'
import { TypeaheadStateFacade } from '@/+state/typeahead-state.facade'
import { Subject } from 'rxjs'
import { SearchResult } from '@/models/typeahead.model'

describe('TypeaheadSelectedComponent', () => {
  let component: TypeaheadSelectedComponent
  let fixture: ComponentFixture<TypeaheadSelectedComponent>
  let mockFacade: Partial<TypeaheadStateFacade>
  let selectSelectedTypeahead$: Subject<SearchResult>

  beforeEach(async () => {
    selectSelectedTypeahead$ = new Subject<SearchResult>()
    mockFacade = {
      selectSelectedTypeahead$: selectSelectedTypeahead$,
    }

    await TestBed.configureTestingModule({
      imports: [TypeaheadSelectedComponent],
      providers: [{ provide: TypeaheadStateFacade, useValue: mockFacade }],
    }).compileComponents()

    fixture = TestBed.createComponent(TypeaheadSelectedComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    selectSelectedTypeahead$.complete()
  })

  it('Should successfully create the component instance', () => {
    expect(component).toBeTruthy()
  })
  it('Should update selectedTypeahead when a new typeahead item is selected', () => {
    // GIVEN the component is initialized
    const testData: SearchResult = {
      title: 'Test Item',
      snippet: 'Test Snippet',
      sn: 0,
      pageid: 0,
    }

    // WHEN a new value is emitted from the facade
    selectSelectedTypeahead$.next(testData)

    // THEN selectedTypeahead should be updated
    expect(component.selectedTypeahead()).toBe(testData)
  })
  it('Should not update selectedTypeahead after the component is destroyed', () => {
    // GIVEN the component is destroyed
    component.ngOnDestroy()

    // WHEN a new value is emitted from the facade
    const testData: SearchResult = {
      title: 'New Item',
      snippet: 'New Snippet',
      sn: 1,
      pageid: 1,
    }
    selectSelectedTypeahead$.next(testData)

    // THEN selectedTypeahead should not be updated
    expect(component.selectedTypeahead()).toBeUndefined()
  })
  it('Should properly clean up subscriptions when the component is destroyed', () => {
    // GIVEN spies on toDestroy$ methods
    const nextSpy = jest.spyOn(component['toDestroy$'], 'next')
    const completeSpy = jest.spyOn(component['toDestroy$'], 'complete')

    // WHEN ngOnDestroy is called
    component.ngOnDestroy()

    // THEN toDestroy$ should be properly completed
    expect(nextSpy).toHaveBeenCalled()
    expect(completeSpy).toHaveBeenCalled()
  })
})
