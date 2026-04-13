import type { OgData } from './Og'
import { toMetaTags } from './Og'

export function MetaTags({ of: data }: { readonly of: OgData }) {
  return (
    <>
      {toMetaTags(data).map(({ property, content }) => {
        const key = property.startsWith('twitter:') ? 'name' : 'property'
        const props = {
          [key]: property,
          content,
        }
        return <meta key={`${property}-${content}`} {...props} />
      })}
    </>
  )
}
