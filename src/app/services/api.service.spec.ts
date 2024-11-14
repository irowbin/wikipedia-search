import { TestBed } from '@angular/core/testing'
import { ApiService } from './api.service'
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing'
import { SearchResult, WikipediaSearchResponse } from '@/models/typeahead.model'
import { provideHttpClient } from '@angular/common/http'

describe('ApiService', () => {
  let service: ApiService
  let httpMock: HttpTestingController
  const API_URL = 'https://en.wikipedia.org/w/api.php'

  // Variables to store spies
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [ApiService, provideHttpClient(), provideHttpClientTesting()],
    })

    service = TestBed.inject(ApiService)
    httpMock = TestBed.inject(HttpTestingController)

    // Spy on console.error for each test
    consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => ({}))
  })

  afterEach(() => {
    httpMock.verify()
    // Restore console.error after each test
    consoleErrorSpy.mockRestore()
  })

  it('Should return search results and total pages when the API provides valid data', (done) => {
    // GIVEN the API returns a valid response with search results and total hits
    const query = 'test'
    const page = 1
    const pageSize = 10
    const mockResponse: WikipediaSearchResponse = {
      query: {
        search: [
          { title: 'Test Article', snippet: 'Test snippet' } as SearchResult,
        ],
        searchinfo: { totalhits: 25 },
      },
    }

    // WHEN the search method is called
    service.search(query, page, pageSize).subscribe((data) => {
      // THEN it should return the results and correctly calculate totalPages
      expect(data.results.length).toBe(1)
      expect(data.totalPages).toBe(3)
      expect(data.results[0].title).toBe('Test Article')
      expect(consoleErrorSpy).not.toHaveBeenCalled()
      done()
    })

    // Expecting the HTTP request with correct parameters
    const req = httpMock.expectOne((request) => {
      const url = request.url.split('?')[0]
      return (
        url === API_URL &&
        request.params.get('srsearch') === query &&
        request.params.get('srlimit') === pageSize.toString() &&
        request.params.get('sroffset') === '0'
      )
    })
    expect(req.request.method).toBe('GET')

    // Respond with mock data
    req.flush(mockResponse)
  })
  it('Should return empty results when the API response is missing required data', (done) => {
    // GIVEN the API returns a response without "query" or "search"
    const query = 'test'
    const page = 1
    const pageSize = 10
    const mockResponse = {}

    // WHEN the search method is called
    service.search(query, page, pageSize).subscribe((data) => {
      // THEN it should return empty results and totalPages as 0
      expect(data.results.length).toBe(0)
      expect(data.totalPages).toBe(0)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Unexpected API response:',
        mockResponse
      )
      done()
    })

    // Expecting the HTTP request with correct parameters
    const req = httpMock.expectOne((request) => {
      const url = request.url.split('?')[0]
      return url === API_URL
    })
    expect(req.request.method).toBe('GET')

    // Respond with mock data
    req.flush(mockResponse)
  })
  it('Should handle API errors gracefully and return empty results', (done) => {
    // GIVEN the API returns an error response
    const query = 'test'
    const page = 1
    const pageSize = 10
    const mockError = new ErrorEvent('Network error')

    // WHEN the search method is called
    service.search(query, page, pageSize).subscribe((data) => {
      // THEN it should handle the error and return empty results and totalPages as 0
      expect(data.results.length).toBe(0)
      expect(data.totalPages).toBe(0)
      // Assert that console.error was called with the expected message
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Wikipedia API Error:',
        expect.objectContaining({
          error: mockError,
        })
      )
      done()
    })

    // Expecting the HTTP request with correct parameters
    const req = httpMock.expectOne((request) => {
      const url = request.url.split('?')[0]
      return url === API_URL
    })
    expect(req.request.method).toBe('GET')

    // Respond with an error
    req.error(mockError)
  })
  it('Should calculate zero total pages when there are no search results', (done) => {
    // GIVEN the API returns totalHits as zero
    const query = 'test'
    const page = 1
    const pageSize = 10
    const mockResponse: WikipediaSearchResponse = {
      query: {
        search: [],
        searchinfo: { totalhits: 0 },
      },
    }

    // WHEN the search method is called
    service.search(query, page, pageSize).subscribe((data) => {
      // THEN totalPages should be zero
      expect(data.results.length).toBe(0)
      expect(data.totalPages).toBe(0)
      expect(consoleErrorSpy).not.toHaveBeenCalled()
      done()
    })

    // Expecting the HTTP request with correct parameters
    const req = httpMock.expectOne((request) => {
      const url = request.url.split('?')[0]
      return url === API_URL
    })
    expect(req.request.method).toBe('GET')

    // Respond with mock data
    req.flush(mockResponse)
  })
  it('Should calculate total pages accurately when total hits aren\'t a multiple of page size', (done) => {
    // GIVEN the API returns totalHits not a multiple of pageSize
    const query = 'test'
    const page = 1
    const pageSize = 10
    const totalHits = 25
    const mockResponse: WikipediaSearchResponse = {
      query: {
        search: new Array(10).fill({
          title: 'Article',
          snippet: 'Snippet',
        } as SearchResult),
        searchinfo: { totalhits: totalHits },
      },
    }

    // WHEN the search method is called
    service.search(query, page, pageSize).subscribe((data) => {
      // THEN totalPages should be correctly calculated and rounded up
      expect(data.results.length).toBe(10)
      expect(data.totalPages).toBe(3)
      expect(consoleErrorSpy).not.toHaveBeenCalled()
      done()
    })

    // Expecting the HTTP request with correct parameters
    const req = httpMock.expectOne((request) => {
      const url = request.url.split('?')[0]
      return url === API_URL
    })
    expect(req.request.method).toBe('GET')

    // Respond with mock data
    req.flush(mockResponse)
  })
  it('Should include the correct parameters in the API request', () => {
    // GIVEN specific query parameters
    const query = 'angular testing'
    const page = 2
    const pageSize = 20

    // WHEN the search method is called
    service.search(query, page, pageSize).subscribe()

    // THEN the request should have the correct parameters
    const req = httpMock.expectOne((request) => {
      const url = request.url.split('?')[0]
      return (
        url === API_URL &&
        request.params.get('action') === 'query' &&
        request.params.get('list') === 'search' &&
        request.params.get('srsearch') === query &&
        request.params.get('srlimit') === pageSize.toString() &&
        request.params.get('sroffset') === ((page - 1) * pageSize).toString() &&
        request.params.get('format') === 'json' &&
        request.params.get('origin') === '*'
      )
    })
    expect(req.request.method).toBe('GET')

    // Respond with empty data
    req.flush({})
  })
  it('Should use default values for page and page size when they are not provided', () => {
    // GIVEN only the query parameter
    const query = 'test'

    // WHEN the search method is called without a page and pageSize
    service.search(query).subscribe()

    // THEN it should default page to 1 and pageSize to 100
    const req = httpMock.expectOne((request) => {
      const url = request.url.split('?')[0]
      return (
        url === API_URL &&
        request.params.get('srsearch') === query &&
        request.params.get('srlimit') === '25' &&
        request.params.get('sroffset') === '0'
      )
    })
    expect(req.request.method).toBe('GET')

    // Respond with empty data
    req.flush({})
  })
})
