import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TypeaheadStateFacade } from '../../+state/typeahead-state.facade'
import { Subject, takeUntil } from 'rxjs'
import { SearchResult } from '../../models/typeahead.model'

@Component({
  selector: 'app-selected-typeahead',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selected-typeahead.component.html',
  styleUrl: './selected-typeahead.component.scss',
})
export class SelectedTypeaheadComponent implements OnDestroy, OnInit {
  public readonly toDestroy$ = new Subject<void>()
  public readonly selectedTypeahead = signal<SearchResult>(undefined)
  public readonly typeaheadFacade = inject(TypeaheadStateFacade)

  public ngOnInit(): void {
    this.#selectSelectedTypeahead()
  }

  public ngOnDestroy(): void {
    this.toDestroy$.next()
    this.toDestroy$.complete()
  }

  #selectSelectedTypeahead(): void {
    this.typeaheadFacade.selectSelectedTypeahead$
      .pipe(takeUntil(this.toDestroy$))
      .subscribe((typeahead) => {
        this.selectedTypeahead.set(typeahead)
      })
  }
}
