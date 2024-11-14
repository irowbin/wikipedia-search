import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TypeaheadComponent } from '../typeahead/typeahead.component'
import { VirtualScrollerComponent } from '../virtual-scroller/virtual-scroller.component'

@Component({
  selector: 'app-typeahead-container',
  standalone: true,
  imports: [CommonModule, TypeaheadComponent, VirtualScrollerComponent],
  templateUrl: './typeahead-container.component.html',
  styleUrl: './typeahead-container.component.scss',
})
export class TypeaheadContainerComponent {}
