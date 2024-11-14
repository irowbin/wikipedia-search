import { Component, computed, ElementRef, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TypeaheadControlComponent } from '../typeahead-control/typeahead-control.component'
import { TypeaheadSelectedComponent } from '@/components/typeahead-selected/typeahead-selected.component'

@Component({
  selector: 'app-typeahead-container',
  standalone: true,
  imports: [
    CommonModule,
    TypeaheadControlComponent,
    TypeaheadSelectedComponent,
  ],
  templateUrl: './typeahead-container.component.html',
  styleUrl: './typeahead-container.component.scss',
})
export class TypeaheadContainerComponent {
  @ViewChild('container')
  public container: ElementRef<HTMLDivElement>

  /**
   * The width of the container element in pixels.
   *
   * Used for selected typeahead item container width calculation.
   * */
  public readonly containerWidth = computed(
    () => this.container?.nativeElement?.clientWidth
  )
}
