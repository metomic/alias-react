import * as React from 'react'
// import {createPortal} from 'react-dom
import * as Securemail from '@metomic/alias'



// FIXME: use htmlinput types
export const SecuremailInput = (props: any) => {
  return React.createElement('input',props)
}

export const SecuremailToggle = () => {
  <div>toggle</div>
}



type SecuremailContext = {
  appId: string
}
const SecuremailContext = React.createContext<SecuremailContext | undefined>(undefined)

type SecuremailHookResult = {
  toggleSecure: () => {},
  isActive: boolean,
  ref: React.Ref<HTMLInputElement>,
  error?: string
}

export const SecuremailProvider : React.FC<SecuremailContext> = ({ children, ...props}) => (
  <SecuremailContext.Provider value={props}>{children}</SecuremailContext.Provider>
)

type SecuremailHookParams = {
  purpose: string
}


const setNativeValue = (element : HTMLInputElement, value: string) => {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (valueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter?.call(element, value);
  } else {
      valueSetter?.call(element, value);
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
}

export const useSecuremail = ({purpose} : SecuremailHookParams) => {
  const {appId} = React.useContext(SecuremailContext) as SecuremailContext
  
  const ref = React.useRef<HTMLInputElement>(null)
  const overlayRef = React.useRef(null)
  const securingContextRef = React.useRef(null)

  const [state, setState] = React.useState({
    active: false,
    error: undefined as string | undefined
  })

  React.useLayoutEffect(() => {
    const input = ref.current as HTMLInputElement
    overlayRef.current = Securemail.dom.createOverlayController(input)
    securingContextRef.current = Securemail.dom.createSecuringContext(appId, purpose, input, (state : any) => {
      const overlay = overlayRef.current as any
      switch (state.status){
        case 'loading':
          overlay.setActive(true)
          setState({ active: true, error: undefined })
          break;
        case 'complete':
          overlay.setActive(false)
          setState({ active: true, error: undefined })
          setNativeValue(input, state.result)
          break;
        case 'error':
          overlay.setActive(false)
          setState({ active: false, error: state.error.message })
          break;
        case 'reset':
          overlay.setActive(false)
          setState({ active: false, error: undefined })
          setNativeValue(input, state.result)
          break;
        default:
      }
    })
  },[])

  const toggleSecure = () => {
    const securingContext = securingContextRef?.current as any
    securingContext.doToggle(!state.active).catch((e:Error) => console.error(e))
  }

  return {ref, toggleSecure, isActive: state.active, error: state.error } as SecuremailHookResult

}

