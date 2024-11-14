import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TypeaheadComponent } from './components/typeahead/typeahead.component'
import { CommonModule } from '@angular/common'
import { UserManualComponent } from './components/user-manual/user-manual.component'
import { SelectedTypeaheadComponent } from './components/selected-typeahead/selected-typeahead.component'
import { TypeaheadContainerComponent } from './components/typeahead-container/typeahead-container.component'
import { Subject, takeUntil } from 'rxjs'
import { SearchResult } from './models/typeahead.model'
import { TypeaheadStateFacade } from './+state/typeahead-state.facade'

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TypeaheadComponent,
    UserManualComponent,
    SelectedTypeaheadComponent,
    TypeaheadContainerComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy, OnInit {
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
