import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TypeaheadUserManualComponent } from './components/typeahead-user-manual/typeahead-user-manual.component'
import { TypeaheadContainerComponent } from './components/typeahead-container/typeahead-container.component'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TypeaheadUserManualComponent,
    TypeaheadContainerComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
