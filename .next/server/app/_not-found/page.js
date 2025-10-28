(()=>{var e={};e.id=409,e.ids=[409],e.modules={7849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},5403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},4749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},3781:(e,t,n)=>{"use strict";n.r(t),n.d(t,{GlobalError:()=>a.a,__next_app__:()=>p,originalPathname:()=>u,pages:()=>c,routeModule:()=>g,tree:()=>d}),n(7352),n(5866),n(7764);var r=n(3191),o=n(8716),i=n(7922),a=n.n(i),s=n(5231),l={};for(let e in s)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>s[e]);n.d(t,l);let d=["",{children:["/_not-found",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(n.t.bind(n,5866,23)),"next/dist/client/components/not-found-error"]}]},{}]},{layout:[()=>Promise.resolve().then(n.bind(n,7764)),"D:\\khanna\\btech\\optern-main\\app\\layout.js"],"not-found":[()=>Promise.resolve().then(n.t.bind(n,5866,23)),"next/dist/client/components/not-found-error"]}],c=[],u="/_not-found/page",p={require:n,loadChunk:()=>Promise.resolve()},g=new r.AppPageRouteModule({definition:{kind:o.x.APP_PAGE,page:"/_not-found/page",pathname:"/_not-found",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},265:(e,t,n)=>{Promise.resolve().then(n.t.bind(n,2994,23)),Promise.resolve().then(n.t.bind(n,6114,23)),Promise.resolve().then(n.t.bind(n,9727,23)),Promise.resolve().then(n.t.bind(n,9671,23)),Promise.resolve().then(n.t.bind(n,1868,23)),Promise.resolve().then(n.t.bind(n,4759,23))},5303:()=>{},7764:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>o});var r=n(9510);function o({children:e}){return(0,r.jsxs)("html",{lang:"en",children:[(0,r.jsxs)("head",{children:[r.jsx("meta",{charset:"UTF-8"}),r.jsx("meta",{name:"viewport",content:"width=device-width, initial-scale=1.0"}),r.jsx("title",{children:"Optern EduWorks – Revolutionizing Campus Opportunities"}),r.jsx("link",{rel:"icon",type:"image/x-icon",href:"/favicon.ico"}),r.jsx("script",{src:"https://cdn.tailwindcss.com"}),r.jsx("link",{href:"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap",rel:"stylesheet"}),r.jsx("style",{children:`
            /* BRANDING & UTILITIES */
            .font-inter { font-family: 'Inter', sans-serif; }
            .font-poppins { font-family: 'Poppins', sans-serif; }
            .text-navy-800 { color: #002B5B; }
            .bg-navy-800 { background-color: #002B5B; }
            .text-sky-500 { color: #00A8E8; }
            .bg-sky-500 { background-color: #00A8E8; }
            .hover\\:bg-sky-600:hover { background-color: #008CC7; }
            .border-sky-500 { border-color: #00A8E8; }
            .bg-blue-50 { background-color: #ECF8FF; }
            .bg-green-500 { background-color: #10B981; }
            .hover\\:bg-green-600:hover { background-color: #059669; }
            .text-yellow-600 { color: #D97706; }
            .bg-yellow-100 { background-color: #FEF3C7; }

            /* MINIMAL GRADIENTS */
            .gradient-hero { background: linear-gradient(135deg, #002B5B 0%, #004080 100%); }
            .gradient-student-card { background: linear-gradient(145deg, #ECF8FF 0%, #E0F2FF 100%); }
            .gradient-recruiter-card { background: linear-gradient(145deg, #FEF3C7 0%, #FDECD0 100%); }

            /* SCROLL ANIMATIONS */
            .fade-in-on-scroll {
              opacity: 0;
              transform: translateY(30px);
              transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            .fade-in-on-scroll.is-visible {
              opacity: 1;
              transform: translateY(0);
            }

            /* CARD HOVER EFFECTS */
            .feature-card-hover {
              transition: all 0.3s ease;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
            }
            .feature-card-hover:hover {
              transform: translateY(-5px);
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
              border-color: #00A8E8;
              z-index: 10;
            }

            /* HEADER DYNAMIC VISIBILITY */
            .header-hidden { transform: translateY(-100%); transition: transform 0.3s ease-in-out; }
            .header-visible { transform: translateY(0); transition: transform 0.3s ease-in-out; }

            /* --- BACKGROUND PATTERN STYLES --- */
            @keyframes bg-move {
              0% { background-position: 0% 0%; }
              100% { background-position: 100% 100%; }
            }

            /* 1. Student Section Background: Sky Blue Squares */
            .bg-pattern-students {
              position: relative;
              overflow: hidden;
              background-color: #ffffff;
            }
            .bg-pattern-students::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 300%;
              height: 300%;
              opacity: 0.6;
              z-index: 0;
              background-image: repeating-linear-gradient(45deg, #00A8E8 0px, #00A8E8 10px, transparent 10px, transparent 20px);
              background-size: 50px 50px;
              animation: bg-move 60s linear infinite alternate;
            }
            .bg-pattern-students > * {
              position: relative;
              z-index: 10;
            }

            /* 2. Recruiter Section Background: Yellow/Orange Dots */
            .bg-pattern-recruiters {
              position: relative;
              overflow: hidden;
              background-color: #f9fafb;
            }
            .bg-pattern-recruiters::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 300%;
              height: 300%;
              opacity: 0.6;
              z-index: 0;
              background-image: radial-gradient(circle, #D97706 2px, transparent 2px);
              background-size: 20px 20px;
              animation: bg-move 90s linear infinite reverse;
            }
            .bg-pattern-recruiters > * {
              position: relative;
              z-index: 10;
            }

            /* 3. Institutions Section Background: Navy Triangles */
            .bg-pattern-institutions {
              position: relative;
              overflow: hidden;
              background-color: #ECF8FF;
            }
            .bg-pattern-institutions::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 300%;
              height: 300%;
              opacity: 0.6;
              z-index: 0;
              background-image: repeating-linear-gradient(60deg, #002B5B 0px, #002B5B 15px, transparent 15px, transparent 30px);
              background-size: 150px 150px;
              animation: bg-move 75s linear infinite alternate;
            }
            .bg-pattern-institutions > * {
              position: relative;
              z-index: 10;
            }

            /* Ensure content is positioned relative to avoid being covered by ::before */
            .content-relative { position: relative; z-index: 10; }

            /* Mobile menu styling adjustments */
            .mobile-menu {
              position: fixed;
              top: 0;
              right: 0;
              width: 80%;
              max-width: 300px;
              height: 100%;
              background-color: white;
              box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
              transform: translateX(100%);
              transition: transform 0.3s ease-in-out;
              z-index: 100;
              padding: 2rem;
            }
            .mobile-menu.open {
              transform: translateX(0);
            }
            .mobile-menu-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.4);
              z-index: 90;
              display: none;
            }
            .mobile-menu-overlay.open {
              display: block;
            }

            .mobile-menu nav {
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
              margin-top: 1rem;
            }

            .mobile-menu nav a {
              padding: 0.75rem 0;
              border-bottom: 1px solid #f3f4f6;
              width: 100%;
              display: block;
            }

            .mobile-menu button {
              margin-top: 1.5rem;
              width: 100%;
              text-align: center;
            }
          `})]}),r.jsx("body",{className:"min-h-screen bg-gray-50 font-inter text-gray-800",children:e})]})}},6399:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var n in t)Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}(t,{isNotFoundError:function(){return o},notFound:function(){return r}});let n="NEXT_NOT_FOUND";function r(){let e=Error(n);throw e.digest=n,e}function o(e){return"object"==typeof e&&null!==e&&"digest"in e&&e.digest===n}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},7352:(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var n in t)Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}(t,{PARALLEL_ROUTE_DEFAULT_PATH:function(){return o},default:function(){return i}});let r=n(6399),o="next/dist/client/components/parallel-route-default.js";function i(){(0,r.notFound)()}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)}};var t=require("../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),r=t.X(0,[819],()=>n(3781));module.exports=r})();