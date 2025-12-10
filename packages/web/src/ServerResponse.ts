import * as HttpServerResponse from '@effect/platform/HttpServerResponse'
import * as Context from 'effect/Context'

export class ServerResponse extends Context.Tag(
  '@macklinu/effect-web/ServerResponse'
)<ServerResponse, HttpServerResponse.HttpServerResponse>() {}
