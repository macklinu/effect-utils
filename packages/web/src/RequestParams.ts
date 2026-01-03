import * as Context from 'effect/Context'

/** An Effect service for obtaining route URL params. */
export class RequestParams extends Context.Tag(
  '@macklinu/effect-web/RequestParams'
)<RequestParams, Record<string, string | number | undefined>>() {}
