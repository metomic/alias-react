# @metomic/alias-react

> Use metomic alias with your react application

[![NPM](https://img.shields.io/npm/v/@metomic/alias-react.svg)](https://www.npmjs.com/package/@metomic/alias-react)

## Install

```bash
yarn add @metomic/alias-react
```

## Usage

### Step 1. Configure an AliasProvider at the top level
```tsx
// in your main / index / app root
import React from 'react'
import {AliasProvider} from '@metomic/alias-react'

ReactDOM.render(
  // your appId is given to you when you join the Alias alpha
  <AliasProvider appId={"YOUR-APP-ID"}> 
    <App />
  </AliasProvider>
, document.getElementById('root'))

```

### 2. Use the useAlias hook in your component
```tsx
import {useAlias, AliasToggle} from '@metomic/alias-react

const MySignupBox = () => {
  // Provide a purpose for this alias
  const {ref, toggleSecured, isSecured, } = useAlias({ purpose: 'marketing' })

  return (
    <div>
      {/* To make alias work, the alias "ref" parameter has to be provided to the input element you wish to use */}
      <input ref={ref}>
      
      {/* Finally, set up a toggle to control whether or not the mail address is secured */}
      <AliasToggle onChange={toggleSecured} />
    </div>
  )


}

```



## License

MIT © [metomic](https://github.com/metomic)
