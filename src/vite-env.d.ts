/// <reference types="vite/client" />

declare module '*.js' {
  const content: any;
  export default content;
}

declare module '*/graviton-engine.js' {
  const content: any;
  export default content;
}

declare module '*/quantum-morph-engine.js' {
  const content: any;
  export default content;
}

declare module './engine/graviton-engine.js' {
  const content: any;
  export default content;
}

declare module './engine/quantum-morph-engine.js' {
  const content: any;
  export default content;
}
