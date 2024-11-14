import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TypeaheadControlComponent } from './components/typeahead-control/typeahead-control.component'
import { CommonModule } from '@angular/common'
import { TypeaheadUserManualComponent } from './components/typeahead-user-manual/typeahead-user-manual.component'
import { TypeaheadSelectedComponent } from './components/typeahead-selected/typeahead-selected.component'
import { TypeaheadContainerComponent } from './components/typeahead-container/typeahead-container.component'
import { Subject, takeUntil } from 'rxjs'
import { SearchResult } from './models/typeahead.model'
import { TypeaheadStateFacade } from './+state/typeahead-state.facade'

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TypeaheadControlComponent,
    TypeaheadUserManualComponent,
    TypeaheadSelectedComponent,
    TypeaheadContainerComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy, OnInit {
  /** Manages subscriptions when the component is destroyed */
  private readonly toDestroy$ = new Subject<void>()

  /** Selected typeahead object signal with undefined initially */
  public readonly selectedTypeahead = signal<SearchResult>(undefined)

  /** Injects the TypeaheadStateFacade for state management */
  private readonly typeaheadFacade = inject(TypeaheadStateFacade)

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
