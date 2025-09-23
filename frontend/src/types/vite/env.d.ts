interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// not working bhai
//declare module "*.module.css" --> if you do this then the css filename has to be .module.css
declare module "*.css" { //the css filename will be .css only
  const classes: { readonly [key: string]: string };
  export default classes;
}


// declare module "*.module.css";
// declare module "*.module.scss";