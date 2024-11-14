import { inject, Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { SearchResult, WikipediaSearchResponse } from '@/models/typeahead.model'

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  public readonly httpClient = inject(HttpClient)
  static readonly API_URL = 'https://en.wikipedia.org/w/api.php'

  /**
   * Searches Wikipedia for the given query.
   * @param {string} query - The search term.
   * @param {number} page - The page number for pagination.
   * @param {number} pageSize - The number of results per page.
   * @returns { Observable<{ results: SearchResult[]; totalPages: number }>} -
   * An observable containing search results and total pages.
   */
  public search(
    query: string,
    page = 1,
    pageSize = 25
  ): Observable<{ results: SearchResult[]; totalPages: number }> {
    const offset: number = this.#calculateOffset(page, pageSize)
    const params: HttpParams = this.#buildHttpParams(query, pageSize, offset)

    return this.httpClient
      .get<WikipediaSearchResponse>(ApiService.API_URL, { params })
      .pipe(
        map((response) => this.#extractData(response, pageSize)),
        catchError((error) => this.#handleError(error))
      )
  }

  /**
   * Calculates the offset for pagination.
   * @param {number} page - The current page number.
   * @param {number} pageSize - The number of results per page.
   * @returns {number} - The calculated offset.
   */
  #calculateOffset(page: number, pageSize: number): number {
    return (page - 1) * pageSize
  }

  /**
   * Builds the HTTP parameters for the API request.
   * @param {string} query - The search term.
   * @param {number} pageSize - The number of results per page.
   * @param {number} offset - The offset for pagination.
   * @returns {HttpParams} - The HTTP parameters object.
   */
  #buildHttpParams(
    query: string,
    pageSize: number,
    offset: number
  ): HttpParams {
    return new HttpParams({
      fromObject: {
        action: 'query',
        list: 'search',
        srsearch: query,
        srlimit: pageSize.toString(),
        sroffset: offset.toString(),
        format: 'json',
        origin: '*',
      },
    })
  }

  /**
   * Extracts data from the API response.
   * @param {WikipediaSearchResponse} response - The API response.
   * @param {number} pageSize - The number of results per page.
   * @returns {Object} An object containing results and total pages.
   */
  #extractData(
    response: WikipediaSearchResponse,
    pageSize: number
  ): { results: SearchResult[]; totalPages: number } {
    const results: SearchResult[] = response.query?.search ?? []
    const totalHits: number = response.query?.searchinfo?.totalhits ?? 0
    const totalPages: number = Math.ceil(totalHits / pageSize)
    return { results, totalPages }
  }

  /**
   * Handles errors from the API request.
   * @param {any} error - The error object.
   * @returns {Observable<{ results: SearchResult[]; totalPages: number }>} -
   * An observable with empty results and zero total pages.
   */
  #handleError(
    error: any
  ): Observable<{ results: SearchResult[]; totalPages: number }> {
    console.error('Wikipedia API Error:', error)
    return of({ results: [], totalPages: 0 })
  }
}
