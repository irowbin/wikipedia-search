import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  Observable,
  of,
  Subject,
  takeUntil,
  tap,
} from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { TypeaheadStateFacade } from '@/+state/typeahead-state.facade'
import { SearchResult } from '@/models/typeahead.model'
import { TypeaheadSuggestionsListComponent } from '../typeahead-suggestions-list/typeahead-suggestions-list.component'
import { QueryPageInfo } from '@/+state/typeahead-state.models'

/**
 * TypeaheadControlComponent provides a typeahead-control search functionality with suggestions.
 */
@Component({
  selector: 'app-typeahead-control',
  standalone: true,
  imports: [CommonModule, TypeaheadSuggestionsListComponent],
  templateUrl: './typeahead-control.component.html',
  styleUrl: './typeahead-control.component.scss',
})
export class TypeaheadControlComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  /** Manages subscriptions when the component is destroyed */
  private readonly toDestroy$ = new Subject<void>()

  /**
   * Reference to the input element for the typeahead-control.
   */
  @ViewChild('typeahead')
  public readonly typeahead: ElementRef<HTMLInputElement>

  /** Injects the TypeaheadStateFacade for state management */
  private readonly appFacade = inject(TypeaheadStateFacade)

  /**
   * Emits search query strings from the input field.
   */
  private query$ = new Subject<string>()

  /** Query page information for pagination. */
  private readonly queryPageInfo = signal<QueryPageInfo>(undefined)

  /**
   * Holds the list of search suggestions.
   */
  public readonly suggestions = signal<SearchResult[]>([])

  /**
   * The current search term entered by the user.
   */
  public readonly searchTerm = signal<string>('')

  /**
   * Indicates whether the suggestion dropdown is visible.
   */
  public readonly isDropdownVisible = signal<boolean>(false)

  /**
   * Tri-state loading indicator for the search.
   */
  public readonly isSearchLoading = signal<boolean>(undefined)

  public ngOnInit(): void {
    this.#selectQueryPageInfo()
    this.#selectIsSearchLoading()
    this.#selectSuggestions()
  }

  public ngAfterViewInit(): void {
    this.#focusInput()
  }

  public ngOnDestroy(): void {
    this.toDestroy$.next()
    this.toDestroy$.complete()
  }

  /**
   * Handles input changes in the typeahead-control input field.
   * @param {string} value - The current value of the input field.
   */
  public onInputChange(value: string): void {
    value = value.trim()
    this.searchTerm.set(value)
    this.query$.next(value)
  }

  /**
   * Toggles the visibility of the suggestion dropdown.
   * @param {boolean} [isVisible] - Optional visibility state to set.
   */
  public toggleDropdown(isVisible?: boolean): void {
    this.isDropdownVisible.set(isVisible)
  }

  /**
   * Loads the next page of suggestions.
   */
  public loadNextBatch(): void {
    const term = this.searchTerm().trim()
    // Grab the current page and total pages for the current search term
    const { currentPage, totalPages } = this.queryPageInfo()[term] || {}
    const current = currentPage || 1
    const total = totalPages || Infinity

    if (current < total) {
      const nextPage = current + 1
      this.appFacade.fetchNextPage(term, nextPage)
    } else {
      // TODO: Implement a toast or other UI feedback for no more pages
      console.warn('No more pages to load')
    }
  }

  /**
   * Focuses the typeahead-control input field.
   */
  #focusInput(): void {
    this.typeahead.nativeElement.focus()
  }

  /**
   * Sets up the subscription to query$ to handle fetching and updating suggestions.
   */
  #selectSuggestions(): void {
    this.query$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => this.#startLoading()),
        switchMap((query) => this.#fetchSuggestions(query)),
        takeUntil(this.toDestroy$)
      )
      .subscribe((suggestions) => this.#updateSuggestions(suggestions))
  }

  /**
   * Initiates the loading state and clears current suggestions.
   */
  #startLoading(): void {
    this.appFacade.toggleSearchLoadingState(true)
    this.suggestions.set([])
  }

  /**
   * Fetches suggestions for the given query.
   * @param {string} query - The search query string.
   * @returns {Observable<SearchResult[]>} - An observable of the suggestions.
   */
  #fetchSuggestions(query: string): Observable<SearchResult[]> {
    if (query.trim().length === 0) {
      return of([])
    }

    return this.appFacade.selectQueries$.pipe(
      map((queries) => queries[query]),
      tap((suggestions) => {
        if (!suggestions) {
          this.appFacade.fetchSuggestions(query)
        }
      }),
      filter((suggestions) => typeof suggestions !== 'undefined')
    )
  }

  /**
   * Updates the component with new suggestions and toggles loading state.
   * @param {SearchResult[]} suggestions - The list of new suggestions.
   */
  #updateSuggestions(suggestions: SearchResult[]): void {
    this.isDropdownVisible.set(suggestions?.length > 0)
    this.suggestions.set([...suggestions])
    this.appFacade.toggleSearchLoadingState(false)
  }

  /**
   * Selects to the loading state from the facade to update the component's loading state.
   */
  #selectIsSearchLoading(): void {
    this.appFacade.selectIsLoading$
      .pipe(takeUntil(this.toDestroy$))
      .subscribe((isLoading) => {
        this.isSearchLoading.set(isLoading)
      })
  }

  #selectQueryPageInfo(): void {
    this.appFacade.selectQueryPageInfo$
      .pipe(
        filter((qi) => typeof qi !== 'undefined'),
        takeUntil(this.toDestroy$)
      )
      .subscribe((pageInfo) => {
        this.queryPageInfo.set(pageInfo)
      })
  }
}
