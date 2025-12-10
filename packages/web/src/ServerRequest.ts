import * as HttpServerRequest from '@effect/platform/HttpServerRequest'
import * as Context from 'effect/Context'

export class ServerRequest extends Context.Tag(
  '@macklinu/effect-web/ServerRequest'
)<ServerRequest, HttpServerRequest.HttpServerRequest>() {}
