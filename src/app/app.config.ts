import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
  importProvidersFrom,
} from '@angular/core'
import { provideRouter } from '@angular/router'
import { appRoutes } from './app.routes'
import { provideStore, provideState } from '@ngrx/store'
import { provideEffects } from '@ngrx/effects'
import { provideStoreDevtools } from '@ngrx/store-devtools'
import * as fromAppState from './+state/typeahead-state.reducer'
import { TypeaheadEffects } from './+state/typeahead-state.effects'
import { TypeaheadStateFacade } from './+state/typeahead-state.facade'
import { provideHttpClient } from '@angular/common/http'
import { provideAnimations } from '@angular/platform-browser/animations'

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(),
    provideEffects(TypeaheadEffects),
    provideState(
      fromAppState.TYPEAHEAD_STATE_FEATURE_KEY,
      fromAppState.typeaheadReducer
    ),
    TypeaheadStateFacade,
    provideStoreDevtools({ logOnly: !isDevMode() }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(),
  ],
}
