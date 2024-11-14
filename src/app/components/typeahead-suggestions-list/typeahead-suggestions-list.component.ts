import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
  HostListener,
  AfterViewInit,
  OnChanges,
  ViewChild,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { SanitizePipe } from '@/pipes/dom-sanitizer.pipe'
import { filter, Subject, takeUntil } from 'rxjs'
import { SearchResult } from '@/models/typeahead.model'
import { TypeaheadStateFacade } from '@/+state/typeahead-state.facade'
import { HighlightPipe } from '@/pipes/highlight.pipe'

@Component({
  selector: 'app-typeahead-suggestions-list',
  standalone: true,
  imports: [CommonModule, SanitizePipe, HighlightPipe],
  templateUrl: './typeahead-suggestions-list.component.html',
  styleUrls: ['./typeahead-suggestions-list.component.scss'],
})
export class TypeaheadSuggestionsListComponent
  implements OnChanges, OnInit, AfterViewInit, OnDestroy
{
  /** Subject to emit when the component is destroyed to unsubscribe from observables */
  public readonly toDestroy$ = new Subject<void>()

  /** Reference to the scrollable container element */
  @ViewChild('scrollerContainer', { static: true })
  public scrollerContainer: ElementRef<HTMLDivElement>

  /** Reference to the sentinel element used for infinite scrolling */
  @ViewChild('sentinel')
  public sentinel: ElementRef<HTMLDivElement>

  /** All search results including those loaded in batches */
  @Input()
  public items: SearchResult[] = []

  /** The current search term used to highlight matched text */
  @Input()
  public searchTerm: string

  /** List of search results currently displayed in the viewport */
  public readonly displayedItems = signal<SearchResult[]>([])

  /** Height of a single item in pixels */
  public readonly itemHeight = 120

  /** Extra items to render above and below the viewport for smooth scrolling */
  public readonly bufferItems = 5

  /** Height of the viewport in pixels */
  public readonly viewportHeight = 560

  /** Total height of all items in pixels */
  public totalContentHeight: number

  /** Index of the first visible item in the viewport */
  public startIndex = 0

  /** Index of the last visible item in the viewport */
  public endIndex = 0

  /** Currently selected typeahead-control item */
  public readonly selectedTypeahead = signal<SearchResult>(undefined)

  /** Facade for accessing and updating the typeahead-control state */
  public readonly typeaheadFacade = inject(TypeaheadStateFacade)

  /** Emits when the suggestion list should be hidden */
  @Output()
  public readonly hide = new EventEmitter<void>()

  /** Emits when more items should be loaded (infinite scrolling) */
  @Output()
  public readonly loadMore = new EventEmitter<void>()

  /** IntersectionObserver to detect when the sentinel element is in view */
  private observer: IntersectionObserver

  /** Signal indicating whether the next batch of items is loading */
  public isBatchLoading = signal(false)

  /**
   * Creates an instance of TypeaheadSuggestionsListComponent.
   * @param elRef Reference to the component's element
   */
  constructor(public elRef: ElementRef) {}

  /**
   * Updates the total content height and recalculates the visible items based on the current scroll position.
   * @returns {void}
   */
  public ngOnChanges(): void {
    this.#setTotalContentHeight()
    const scrollTop = this.#getScrollTop()
    this.#calculateVisibleItems(scrollTop)
  }

  public ngOnInit(): void {
    this.#subscribeToIsLoadingNextBatch()
    this.#setTotalContentHeight()
    this.#subscribeToSelectedTypeahead()
    this.#calculateVisibleItems()
  }

  public ngAfterViewInit(): void {
    this.#initIntersectionObserver()
  }

  public ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect()
    }

    this.toDestroy$.next()
    this.toDestroy$.complete()
  }

  /**
   * Event handler for the scroll event of the scroller container.
   * Recalculates the visible items based on the new scroll position.
   * @param {Event} event The scroll event
   * @returns {void}
   */
  public onScroll(event: Event): void {
    const target = event.target as HTMLElement
    const scrollTop = target.scrollTop
    this.#calculateVisibleItems(scrollTop)
  }

  /**
   * Computes the CSS transform property to position the visible items correctly.
   * @returns  {string} The transform string to translate the items vertically
   */
  public getTransform(): string {
    return `translateY(${this.startIndex * this.itemHeight}px)`
  }

  /**
   * Truncates the title of a search result to a maximum of 40 characters.
   * @param {string} title The title to truncate
   * @returns {string} The truncated title
   */
  public getTruncatedTitle(title: string): string {
    title = title.trim()
    return title.length > 40 ? title.slice(0, 40) + '...' : title
  }

  /**
   * Host listener for document click events to detect clicks outside the component.
   * Emits the hide event if the click is outside the suggestion list and not on an input element.
   * @param {MouseEvent} event The mouse click event
   * @returns {void}
   */
  @HostListener('document:click', ['$event'])
  public onClick(event: MouseEvent): void {
    // When a user clicks outside the suggestion list, or it is not an input element, hide the list
    if (
      !this.elRef.nativeElement.contains(event.target) &&
      event.target['tagName'] !== 'INPUT'
    ) {
      this.hide.emit()
    }
  }

  /**
   * Handles the selection of a typeahead-control item.
   * Parses the snippet HTML to plain text to prevent XSS attacks and stores the selected item.
   * @param {SearchResult} item The selected search result item
   */
  public typeaheadItemSelect(item: SearchResult): void {
    this.#parseAndStoreSelectedItem(item)
  }

  /**
   * Calculates and sets the total content height based on the number of items and item height.
   * @returns {void}
   */
  #setTotalContentHeight(): void {
    this.totalContentHeight = this.items.length * this.itemHeight
  }

  /**
   * Retrieves the current scroll position from the scroller container.
   * @returns {number} The current scrollTop value
   */
  #getScrollTop(): number {
    const scroller = this.scrollerContainer?.nativeElement
    return scroller ? scroller.scrollTop : 0
  }

  /**
   * Calculates the indices of items to display based on the current scroll position.
   * @param {number} scrollTop The current scroll position from the top of the scroller container
   */
  #calculateVisibleItems(scrollTop = 0): void {
    const itemsInView = Math.ceil(this.viewportHeight / this.itemHeight)
    const totalItems = this.items.length

    // Calculate start and end indices with buffer
    this.startIndex = Math.floor(scrollTop / this.itemHeight)
    this.endIndex = Math.min(
      this.startIndex + itemsInView + this.bufferItems,
      totalItems
    )

    // Ensure we show all available items at the bottom
    if (this.endIndex >= totalItems) {
      this.startIndex = Math.max(0, totalItems - itemsInView - this.bufferItems)
      this.endIndex = totalItems
    }

    // Update the displayed items signal
    this.displayedItems.set(this.items.slice(this.startIndex, this.endIndex))
  }

  /**
   * Parses the snippet HTML of a selected item to plain text and stores it using the facade.
   * This is necessary to avoid XSS attacks.
   * @param {SearchResult} item The selected search result item
   * @returns {void}
   */
  #parseAndStoreSelectedItem(item: SearchResult): void {
    const domParser = new DOMParser()
    const parsedHtml = domParser.parseFromString(item.snippet, 'text/html')
    this.typeaheadFacade.storeSelectedTypeahead({
      ...item,
      snippet: parsedHtml.body.textContent,
    })
  }

  /**
   * Loads the next batch of items by emitting the loadMore event.
   * @returns {void}
   */
  #loadNextBatch(): void {
    this.loadMore.emit()
  }

  /**
   * Initializes the IntersectionObserver for infinite scrolling.
   * Observes the sentinel element to detect when it comes into view.
   * @returns {void}
   */
  #initIntersectionObserver(): void {
    const scroller = this.scrollerContainer.nativeElement
    const sentinel = this.sentinel.nativeElement

    const options = {
      root: scroller,
      rootMargin: '0px',
      threshold: 0.1,
    }

    if (sentinel) {
      this.observer = new IntersectionObserver(
        this.#onIntersection.bind(this),
        options
      )
      this.observer.observe(sentinel)
    }
  }

  /**
   * Callback for the IntersectionObserver to detect when the sentinel is intersecting.
   * Used to trigger the loading of the next batch of items when the sentinel is in view and is last in the list.
   * @param {IntersectionObserverEntry[]} entries Array of intersection entries
   * @returns {void}
   */
  #onIntersection(entries: IntersectionObserverEntry[]): void {
    if (entries[0].isIntersecting) {
      this.#loadNextBatch()
    }
  }

  /**
   * Selects to the selected typeahead-control observable from the facade and updates the signal.
   * @returns {void}
   */
  #subscribeToSelectedTypeahead(): void {
    this.typeaheadFacade.selectSelectedTypeahead$
      .pipe(takeUntil(this.toDestroy$))
      .subscribe((selected) => this.selectedTypeahead.set(selected))
  }

  /**
   * Selects to the isLoadingNextPage observable from the facade and updates the isBatchLoading signal.
   * @returns {void}
   */
  #subscribeToIsLoadingNextBatch(): void {
    this.typeaheadFacade.selectIsLoadingNextPage$
      .pipe(
        filter((isLoading) => typeof isLoading !== 'undefined'),
        takeUntil(this.toDestroy$)
      )
      .subscribe((isLoading) => {
        this.isBatchLoading.set(isLoading)
      })
  }
}
