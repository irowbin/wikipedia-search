import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TypeaheadSuggestionsListComponent } from './typeahead-suggestions-list.component'
import { provideMockStore } from '@ngrx/store/testing'
import { SearchResult } from '@/models/typeahead.model'
import { ElementRef } from '@angular/core'
import { TypeaheadStateFacade } from '@/+state/typeahead-state.facade'
import { Subject } from 'rxjs'

describe('TypeaheadSuggestionsListComponent', () => {
  let component: TypeaheadSuggestionsListComponent
  let fixture: ComponentFixture<TypeaheadSuggestionsListComponent>
  let mockFacade: Partial<TypeaheadStateFacade>
  let mockHideEmitter: jest.SpyInstance
  let mockLoadMoreEmitter: jest.SpyInstance
  let intersectionCallback: IntersectionObserverCallback
  let observeSpy: jest.Mock
  let disconnectSpy: jest.Mock

  beforeEach(() => {
    mockFacade = {
      selectSelectedTypeahead$: new Subject(),
      selectIsLoadingNextPage$: new Subject(),
      storeSelectedTypeahead: jest.fn(),
    }

    observeSpy = jest.fn()
    disconnectSpy = jest.fn()

    global.IntersectionObserver = jest.fn((callback) => {
      intersectionCallback = callback
      return {
        observe: observeSpy,
        disconnect: disconnectSpy,
        unobserve: jest.fn(),
        takeRecords: jest.fn(),
      }
    }) as jest.Mock

    TestBed.configureTestingModule({
      imports: [TypeaheadSuggestionsListComponent],
      providers: [
        provideMockStore({}),
        { provide: TypeaheadStateFacade, useValue: mockFacade },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(TypeaheadSuggestionsListComponent)
    component = fixture.componentInstance

    component.scrollerContainer = {
      nativeElement: {
        scrollTop: 0,
      },
    } as ElementRef<HTMLDivElement>

    component.sentinel = {
      nativeElement: {},
    } as ElementRef<HTMLDivElement>

    mockHideEmitter = jest.spyOn(component.hide, 'emit')
    mockLoadMoreEmitter = jest.spyOn(component.loadMore, 'emit')

    fixture.detectChanges()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Should successfully create the component instance', () => {
    expect(component).toBeTruthy()
  })
  it('Should update content height and visible items when the input items change', () => {
    // GIVEN the component has a list of items
    component.items = [
      { title: 'Item 1', snippet: 'Snippet 1' },
      { title: 'Item 2', snippet: 'Snippet 2' },
    ] as SearchResult[]

    // WHEN ngOnChanges is called
    component.ngOnChanges()

    // THEN totalContentHeight should be updated
    expect(component.totalContentHeight).toBe(
      component.items.length * component.itemHeight
    )

    // AND displayedItems should be updated
    expect(component.displayedItems()).toEqual(
      component.items.slice(component.startIndex, component.endIndex)
    )
  })
  it('Should update the displayed items when the user scrolls through the list', () => {
    // GIVEN the component has a list of items
    component.items = Array.from({ length: 50 }, (_, i) => ({
      title: `Item ${i + 1}`,
      snippet: `Snippet ${i + 1}`,
    })) as SearchResult[]

    component.ngOnChanges()

    // WHEN onScroll is called with a scrollTop value
    const event = {
      target: { scrollTop: 200 },
    } as unknown as Event
    component.onScroll(event)

    // THEN displayedItems should be updated based on the new scroll position
    const expectedStartIndex = Math.floor(200 / component.itemHeight)
    expect(component.startIndex).toBe(expectedStartIndex)
    expect(component.displayedItems()).toEqual(
      component.items.slice(component.startIndex, component.endIndex)
    )
  })
  it('Should clean and store the selected item when a suggestion is selected', () => {
    // GIVEN a selected item with HTML in snippet
    const item: SearchResult = {
      pageid: 1,
      sn: 1,
      title: 'Test Item',
      snippet: '<p>Test Snippet</p>',
    }

    const storeSelectedTypeaheadSpy = jest.spyOn(
      mockFacade,
      'storeSelectedTypeahead'
    )

    // WHEN typeaheadItemSelect is called
    component.typeaheadItemSelect(item)

    // THEN storeSelectedTypeahead should be called with parsed snippet
    expect(storeSelectedTypeaheadSpy).toHaveBeenCalledWith({
      ...item,
      snippet: 'Test Snippet',
    })
  })
  it('Should load more items when the user scrolls to the bottom of the suggestions', () => {
    // GIVEN IntersectionObserver has been initialized
    component.ngAfterViewInit()

    // WHEN the intersection callback is called with isIntersecting true
    const entries = [
      {
        isIntersecting: true,
        target: component.sentinel.nativeElement,
      } as unknown as IntersectionObserverEntry,
    ]
    intersectionCallback(entries, null)

    // THEN loadMore should be emitted
    expect(mockLoadMoreEmitter).toHaveBeenCalled()
  })
  it('Should hide the suggestions list when clicking outside the component', () => {
    // GIVEN a click event outside the component
    const event = {
      target: document.createElement('div'),
    } as unknown as MouseEvent

    // WHEN onClick is called
    component.onClick(event)

    // THEN hide should be emitted
    expect(mockHideEmitter).toHaveBeenCalled()
  })
  it('Should keep the suggestions list visible when clicking inside the component', () => {
    // GIVEN a click event inside the component
    const event = {
      target: component.elRef.nativeElement,
    } as unknown as MouseEvent

    // WHEN onClick is called
    component.onClick(event)

    // THEN hide should not be emitted
    expect(mockHideEmitter).not.toHaveBeenCalled()
  })
  it('Should keep the suggestions list visible when clicking on an input field', () => {
    // GIVEN a click event on an input element
    const inputElement = document.createElement('input')
    const event = {
      target: inputElement,
    } as unknown as MouseEvent

    // WHEN onClick is called
    component.onClick(event)

    // THEN hide should not be emitted
    expect(mockHideEmitter).not.toHaveBeenCalled()
  })
  it('Should set up the observer to detect when more items need to be loaded after initialization', () => {
    // GIVEN scrollerContainer and sentinel are set

    // WHEN ngAfterViewInit is called
    component.ngAfterViewInit()

    // THEN observer should be initialized and observe called on sentinel
    expect(global.IntersectionObserver).toHaveBeenCalled()
    expect(component['observer']).toBeDefined()
    expect(observeSpy).toHaveBeenCalledWith(component.sentinel.nativeElement)
  })
  it('Should update the selected item when a new selection is made', () => {
    // WHEN ngOnInit is called
    component.ngOnInit()

    // GIVEN the facade emits a selected typeahead
    const selectedItem = {
      title: 'Selected Item',
      snippet: 'Snippet',
    } as SearchResult
    ;(mockFacade.selectSelectedTypeahead$ as Subject<SearchResult>).next(
      selectedItem
    )

    // THEN selectedTypeahead signal should be updated
    expect(component.selectedTypeahead()).toBe(selectedItem)
  })
  it('Should reflect loading status when more items are being fetched', () => {
    // WHEN ngOnInit is called
    component.ngOnInit()

    // GIVEN the facade emits isLoading as true
    ;(mockFacade.selectIsLoadingNextPage$ as Subject<boolean>).next(true)

    // THEN isBatchLoading should be true
    expect(component.isBatchLoading()).toBe(true)
  })
  it('Should calculate the correct position of items for smooth scrolling', () => {
    // GIVEN startIndex is set
    component.startIndex = 5

    // WHEN getTransform is called
    const transform = component.getTransform()

    // THEN it should return correct translateY value
    expect(transform).toBe(
      `translateY(${component.startIndex * component.itemHeight}px)`
    )
  })
  it('Should shorten titles that are too long', () => {
    // GIVEN a title longer than 40 characters
    const longTitle = 'This is a very long title that exceeds forty characters'

    // WHEN getTruncatedTitle is called
    const truncatedTitle = component.getTruncatedTitle(longTitle, 40)

    // THEN it should be truncated with ellipsis
    expect(truncatedTitle).toBe(longTitle.slice(0, 40) + '...')
  })
  it('Should display full titles when they are short enough', () => {
    // GIVEN a title shorter than 40 characters
    const shortTitle = 'Short title'

    // WHEN getTruncatedTitle is called
    const truncatedTitle = component.getTruncatedTitle(shortTitle, 40)

    // THEN it should return the original title
    expect(truncatedTitle).toBe(shortTitle)
  })
  it('Should properly clean up resources when the component is destroyed', () => {
    // GIVEN observer is set
    const disconnectSpy = jest.fn()
    component['observer'] = {
      disconnect: disconnectSpy,
    } as never

    const toDestroyNextSpy = jest.spyOn(component.toDestroy$, 'next')
    const toDestroyCompleteSpy = jest.spyOn(component.toDestroy$, 'complete')

    // WHEN ngOnDestroy is called
    component.ngOnDestroy()

    // THEN observer should be disconnected
    expect(disconnectSpy).toHaveBeenCalled()

    // AND toDestroy$ should be completed
    expect(toDestroyNextSpy).toHaveBeenCalled()
    expect(toDestroyCompleteSpy).toHaveBeenCalled()
  })
})
