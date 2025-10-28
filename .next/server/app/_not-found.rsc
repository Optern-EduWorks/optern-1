2:I[9275,[],""]
3:I[1343,[],""]
4:T19cd,
            /* BRANDING & UTILITIES */
            .font-inter { font-family: 'Inter', sans-serif; }
            .font-poppins { font-family: 'Poppins', sans-serif; }
            .text-navy-800 { color: #002B5B; }
            .bg-navy-800 { background-color: #002B5B; }
            .text-sky-500 { color: #00A8E8; }
            .bg-sky-500 { background-color: #00A8E8; }
            .hover\:bg-sky-600:hover { background-color: #008CC7; }
            .border-sky-500 { border-color: #00A8E8; }
            .bg-blue-50 { background-color: #ECF8FF; }
            .bg-green-500 { background-color: #10B981; }
            .hover\:bg-green-600:hover { background-color: #059669; }
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
          5:{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"}
6:{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"}
7:{"display":"inline-block"}
8:{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0}
0:["OiduCCS8EEdybRBpzUwVR",[[["",{"children":["/_not-found",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",{"children":["/_not-found",{"children":["__PAGE__",{},[["$L1",[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":"404"}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]]],null],null]},["$","$L2",null,{"parallelRouterKey":"children","segmentPath":["children","/_not-found","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L3",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined","styles":null}],null]},[["$","html",null,{"lang":"en","children":[["$","head",null,{"children":[["$","meta",null,{"charset":"UTF-8"}],["$","meta",null,{"name":"viewport","content":"width=device-width, initial-scale=1.0"}],["$","title",null,{"children":"Optern EduWorks – Revolutionizing Campus Opportunities"}],["$","link",null,{"rel":"icon","type":"image/x-icon","href":"/favicon.ico"}],["$","script",null,{"src":"https://cdn.tailwindcss.com"}],["$","link",null,{"href":"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap","rel":"stylesheet"}],["$","style",null,{"children":"$4"}]]}],["$","body",null,{"className":"min-h-screen bg-gray-50 font-inter text-gray-800","children":["$","$L2",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L3",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":"$5","children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":"$6","children":"404"}],["$","div",null,{"style":"$7","children":["$","h2",null,{"style":"$8","children":"This page could not be found."}]}]]}]}]],"notFoundStyles":[],"styles":null}]}]]}],null],null],[null,[["$","meta",null,{"name":"robots","content":"noindex"}],"$L9"]]]]]
9:[["$","meta","0",{"name":"viewport","content":"width=device-width, initial-scale=1"}],["$","meta","1",{"charSet":"utf-8"}]]
1:null
