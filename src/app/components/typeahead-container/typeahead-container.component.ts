import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TypeaheadControlComponent } from '../typeahead-control/typeahead-control.component'

@Component({
  selector: 'app-typeahead-container',
  standalone: true,
  imports: [CommonModule, TypeaheadControlComponent],
  templateUrl: './typeahead-container.component.html',
  styleUrl: './typeahead-container.component.scss',
})
export class TypeaheadContainerComponent {}
