import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TypeaheadStateFacade } from '../../+state/typeahead-state.facade'
import { Subject, takeUntil } from 'rxjs'
import { SearchResult } from '../../models/typeahead.model'

@Component({
  selector: 'app-typeahead-selected',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './typeahead-selected.component.html',
  styleUrl: './typeahead-selected.component.scss',
})
export class TypeaheadSelectedComponent implements OnDestroy, OnInit {
  /** Manages subscriptions when the component is destroyed */
  private readonly toDestroy$ = new Subject<void>()

  /** Injects the TypeaheadStateFacade for state management */
  private readonly typeaheadFacade = inject(TypeaheadStateFacade)

  /** Selected typeahead object signal with undefined initially */
  public readonly selectedTypeahead = signal<SearchResult>(undefined)

  public ngOnInit(): void {
    this.#selectSelectedTypeahead()
  }

  public ngOnDestroy(): void {
    this.toDestroy$.next()
    this.toDestroy$.complete()
  }

  /**
   * Selects the selected typeahead from the state.
   * @returns {void}
   */
  #selectSelectedTypeahead(): void {
    this.typeaheadFacade.selectSelectedTypeahead$
      .pipe(takeUntil(this.toDestroy$))
      .subscribe((typeahead) => {
        this.selectedTypeahead.set(typeahead)
      })
  }
}
