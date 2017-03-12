import { describe, given, it, equals, assert } from '45'
import { client } from '../src/index.js'

const url = 'https://httpbin.org/get'

export const test = describe('http client', [
    given('given a url', [
        it('can GET it', () => {
            return client(url)
		    .map(resp => resp.json())
		    .map(obj => equals(url, obj.url))
        })
    ])
])
