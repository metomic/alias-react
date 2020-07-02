import * as React from 'react'
// import {createPortal} from 'react-dom
import * as Alias from '@metomic/alias-core'

type AliasToggleProps = {
  onToggle: () => Promise<any>
}

export const AliasToggle = ({ onToggle }: AliasToggleProps) => {
  const ref = React.useRef(document.createElement('div'))

  React.useLayoutEffect(() => {
    // eslint-disable-next-line no-new
    new Alias.AliasToggle({
      target: ref.current,
      props: { onToggle }
    })
  }, [onToggle])

  return <div ref={ref} />
}

type AliasContext = {
  appId: string
}
const AliasContext = React.createContext<AliasContext | undefined>(undefined)

type AliasHookResult = {
  toggleSecure: () => Promise<any>
  isActive: boolean
  ref: React.Ref<HTMLInputElement>
  error?: string
}

export const AliasProvider: React.FC<AliasContext> = ({
  children,
  ...props
}) => <AliasContext.Provider value={props}>{children}</AliasContext.Provider>

type AliasHookParams = {
  purpose: string
}

const setNativeValue = (element: HTMLInputElement, value: string) => {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set
  const prototype = Object.getPrototypeOf(element)
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(
    prototype,
    'value'
  )?.set

  if (valueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter?.call(element, value)
  } else {
    valueSetter?.call(element, value)
  }

  element.dispatchEvent(new Event('input', { bubbles: true }))
}

export const useAlias = ({ purpose }: AliasHookParams) => {
  const context = React.useContext(AliasContext) as AliasContext

  if (!context) {
    throw new Error(
      'Invalid use of "useAlias" hook: You must add an <AliasProvider> at the top level of your application'
    )
  }

  const { appId } = context
 
  const ref = React.useRef<HTMLInputElement>(null)
  const overlayRef = React.useRef(null)
  const securingContextRef = React.useRef(null)

  const [state, setState] = React.useState({
    active: false,
    error: undefined as string | undefined
  })

  React.useLayoutEffect(() => {
    if (ref.current) {
      const input = ref.current as HTMLInputElement
      overlayRef.current = Alias.dom.createOverlayController(input)
      securingContextRef.current = Alias.dom.createSecuringContext(
        appId,
        purpose,
        input,
        (state: any) => {
          const overlay = overlayRef.current as any
          switch (state.status) {
            case 'loading':
              overlay.setActive(true)
              setState({ active: true, error: undefined })
              break
            case 'complete':
              overlay.setActive(false)
              setState({ active: true, error: undefined })
              setNativeValue(input, state.result)
              break
            case 'error':
              overlay.setActive(false)
              setState({ active: false, error: state.error.message })
              break
            case 'reset':
              overlay.setActive(false)
              setState({ active: false, error: undefined })
              setNativeValue(input, state.result)
              break
            default:
          }
        }
      )
    }
  }, [ref])

  const toggleSecure = () => {
    if (securingContextRef.current) {
      const securingContext = securingContextRef.current as any
      securingContext
        .doToggle(!state.active)
        .catch((e: Error) => console.error(e))
    }
  }

  return {
    ref,
    toggleSecure,
    isActive: state.active,
    error: state.error
  } as AliasHookResult
}
