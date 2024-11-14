import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import {
  SearchResult,
  WikipediaSearchResponse,
} from '../models/typeahead.model'

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly API_URL = 'https://en.wikipedia.org/w/api.php'

  constructor(private http: HttpClient) {}

  public search(
    query: string,
    page = 1,
    pageSize = 100
  ): Observable<SearchResult[] | null> {
    const offset = (page - 1) * pageSize

    const params = new HttpParams()
      .set('action', 'query')
      .set('list', 'search')
      .set('srsearch', query)
      .set('srlimit', pageSize.toString())
      .set('sroffset', offset.toString())
      .set('format', 'json')
      .set('origin', '*')

    return this.http
      .get<WikipediaSearchResponse>(this.API_URL, { params })
      .pipe(
        map((response) => {
          if (response.query && response.query.search) {
            // Map the search results to the SearchResult interface
            return response.query.search
          } else {
            console.error('Unexpected API response:', response)
            return null
          }
        }),
        catchError((error) => {
          console.error('Wikipedia API Error:', error)
          return of(null)
        })
      )
  }
}
