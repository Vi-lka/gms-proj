import { MapIcon, Table2 } from "lucide-react";
import { type SVGProps } from "react";
import { FaGoogle, FaYandexInternational } from "react-icons/fa";

export const Icons = {
  github: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  google: (props: SVGProps<SVGSVGElement>) => (
    <FaGoogle {...props} />
    // <svg viewBox="0 0 24 24" {...props}>
    //   <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    // </svg>
  ),
  yandex: (props: SVGProps<SVGSVGElement>) => (
    <FaYandexInternational {...props} />
  ),
  vk: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
    </svg>
  ),
  spinner: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" />
      <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z">
        <animateTransform
          attributeName="transform"
          type="rotate"
          dur="0.75s"
          values="0 12 12;360 12 12"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  ),
  map: (props: SVGProps<SVGSVGElement>) => (
    <MapIcon {...props} />
  ),
  table: (props: SVGProps<SVGSVGElement>) => (
    <Table2 {...props} />
  ),
  rosneft: (props: SVGProps<SVGSVGElement>) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      xmlnsXlink="http://www.w3.org/1999/xlink" 
      xmlSpace="preserve" 
      width="2317px" 
      height="827px" 
      version="1.1" 
      style={{
        shapeRendering: "geometricPrecision",
        textRendering: "geometricPrecision",
        fillRule: "evenodd",
        clipRule: "evenodd",
      }}
      viewBox="0 0 2363 843"
      {...props}
    >
     <defs>
     </defs>
     <g id="Слой_x0020_1">
      <g id="_1336144656">
       <path fill="white" d="M223 0l0 70 -74 0 0 70 -74 0 0 72 -75 0 0 239c0,0 131,120 150,138l0 254 322 0 0 -253c19,-17 150,-139 150,-139l0 -239 -75 0 0 -71 -75 0 0 -71 -75 0 0 -70 -174 0z"/>
       <polygon fill="#FFD100" points="267,787 204,787 204,472 267,472 "/>
       <polygon fill="#FFD100" points="342,787 279,787 279,407 342,407 "/>
       <polygon fill="#FFD100" points="354,787 417,787 417,472 354,472 "/>
       <polygon fill="#211F20" points="117,485 54,429 54,267 117,267 "/>
       <polygon fill="#211F20" points="192,555 129,493 129,196 192,196 "/>
       <polygon fill="#211F20" points="267,463 204,463 204,126 267,126 "/>
       <polygon fill="#211F20" points="342,394 279,394 279,55 342,55 "/>
       <polygon fill="#211F20" points="503,485 566,429 566,267 503,267 "/>
       <polygon fill="#211F20" points="428,555 492,493 492,196 428,196 "/>
       <polygon fill="#211F20" points="354,463 417,463 417,126 354,126 "/>
       <path className="text" fill="#211F20" d="M1016 776c-8,8 -23,12 -45,12l-71 0c-21,0 -36,-3 -44,-11 -9,-8 -13,-20 -13,-35l0 -69c0,-16 4,-27 13,-35 8,-8 23,-12 44,-12l71 0c22,0 37,4 45,12 8,8 12,20 12,35l0 69c0,15 -4,26 -12,34zm-37 -87l0 0c0,-9 -2,-15 -5,-20 -4,-4 -12,-6 -25,-6l-27 0c-12,0 -20,3 -24,7 -4,4 -6,11 -6,19l0 37c0,8 2,14 6,19 4,4 12,7 24,7l27 0c13,0 21,-3 24,-7 4,-4 6,-10 6,-19l0 -37z"/>
       <path className="text" fill="#211F20" d="M1229 776c-8,8 -23,12 -45,12l-71 0c-21,0 -36,-3 -44,-11 -9,-8 -13,-20 -13,-35l0 -69c0,-16 4,-27 13,-35 8,-8 23,-12 44,-12l71 0c22,0 37,4 45,12 8,8 11,20 11,35l0 16 -48 0c0,-9 -2,-15 -6,-20 -3,-4 -11,-6 -24,-6l-27 0c-12,0 -20,3 -24,7 -4,4 -6,11 -6,19l0 37c0,8 2,14 6,19 4,4 12,7 24,7l27 0c13,0 21,-3 24,-7 4,-4 6,-10 6,-19l48 0 0 16c0,15 -3,26 -11,34z"/>
       <polygon className="text" fill="#211F20" points="1317,788 1269,788 1269,742 1269,673 1269,626 1317,626 1317,688 1404,688 1404,626 1453,626 1453,673 1453,742 1453,788 1404,788 1404,725 1317,725 "/>
       <path className="text" fill="#211F20" d="M1544 725l-14 0c0,9 2,15 6,20 4,4 12,7 24,7l27 0 79 0 0 36 -56 0 -71 0c-22,0 -37,-3 -45,-11 -8,-8 -12,-20 -12,-35l0 -69c0,-16 4,-27 12,-35 8,-8 23,-12 45,-12l71 0 56 0 0 37 -79 0 -27 0c-12,0 -20,3 -24,7 -4,4 -6,11 -6,18l14 0 122 0 0 37 -122 0z"/>
       <polygon className="text" fill="#211F20" points="2039,663 1973,663 1973,626 2029,626 2100,626 2157,626 2157,663 2088,663 2088,788 2039,788 "/>
       <path className="text" fill="#211F20" d="M1930 655l-75 0 0 -29 -48 0 0 29 -77 0c0,0 -43,2 -43,51 0,50 44,50 44,50l76 0 0 32 48 0 0 -32 74 0c0,0 45,0 45,-50 0,-49 -44,-51 -44,-51zm-26 69l0 0 -49 0 0 -34 49 0c0,0 17,-3 17,18 0,17 -17,16 -17,16zm-163 -16l0 0c0,-21 17,-18 17,-18l49 0 0 34 -49 0c0,0 -17,1 -17,-16z"/>
       <path className="text" fill="#211F20" d="M803 638c-8,-8 -23,-12 -44,-12l-128 0 0 162 48 0 0 -55 80 0c21,0 36,-4 44,-12 8,-8 12,-20 12,-35l0 -13c0,-15 -4,-27 -12,-35zm-52 58l0 0 -72 0 0 -33 72 0c8,0 16,8 16,17 0,8 -8,16 -16,16z"/>
       <path className="text" fill="#211F20" d="M2363 742l0 -13c0,-15 -4,-27 -12,-35 -8,-8 -23,-12 -45,-12l-79 0 0 -56 -49 0 0 162 128 0c22,0 37,-4 45,-12 8,-8 12,-19 12,-34zm-48 -7l0 0c0,9 -8,17 -17,17l-71 0 0 -33 71 0c9,0 17,7 17,16z"/>
      </g>
     </g>
    </svg>
  )
}

interface IconByNameProps extends SVGProps<SVGSVGElement> {
  name: string
}

export function IconByName(props: IconByNameProps) {
  const { name, ...rest } = props

  const iconName = name as keyof typeof Icons

  switch (iconName) {
    case "github": return <Icons.github {...rest}/>;
    case "google": return <Icons.google {...rest}/>;
    case "yandex": return <Icons.yandex {...rest}/>;
    case "vk": return <Icons.vk {...rest}/>;
    case "map": return <Icons.map {...rest}/>;
    case "table": return <Icons.table {...rest}/>;
    case "spinner": return <Icons.spinner {...rest}/>;
    default: return null;
  }
}
