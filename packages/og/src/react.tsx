import type { OgSchema } from './Og'
import { toMetaTags } from './Og'

export function MetaTags({ of: schema }: { readonly of: OgSchema }) {
  return (
    <>
      {toMetaTags(schema).map(({ property, content }) => (
        <meta
          key={`${property}-${content}`}
          property={property}
          content={content}
        />
      ))}
    </>
  )
}
