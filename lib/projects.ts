export type Project={slug:string;title:string;category:string;year:string;tagline:string;image:string;alt:string;role:string;tools?:string;team?:string;intro:string;sections:{title:string;text:string;image?:string;caption?:string;video?:string;poster?:string;videoCaption?:string;videoWidth?:number;videoHeight?:number}[];link?:string;linkLabel?:string;nda?:boolean;platform?:string;duration?:string;context?:string;cardImage?:string;cardAlt?:string;gallery?:string[];resources?:{label:string;href:string}[]};
export const projects:Project[]=
[
  {
    "slug": "project-one-f5w4d-z9nem-s3jda-eyssk-73f62-tmxz9-9jkyc",
    "title": "ScentSync",
    "category": "Spatial experience",
    "year": "2025",
    "tagline": "What if you could step inside a scent?",
    "image": "/assets/scent-10.webp",
    "alt": "A blooming lily in the ScentSync mixed reality gallery",
    "role": "Developer & 3D Immersive Builder",
    "tools": "Xcode, SwiftUI, RealityKit, Reality Composer Pro, Blender, Rhino",
    "team": "Tina Jiang, Maya Mitchell, Khoi Nguyen",
    "intro": "An Apple Vision Pro experience that turns fragrance notes into places you can explore. Light, symbolic objects, movement, and sound translate the feeling of a scent into an immersive world. Pitched to Matt Stern from Apple’s Vision Products Group on demo day.",
    "sections": [
      {
        "title": "Giving an invisible experience a spatial language.",
        "text": "Words like fresh, clean, or warm leave a lot to interpretation. We explored how fragrance discovery could become more tangible: select a fragrance, enter a portal, and encounter objects that express its notes through interaction and atmosphere.",
        "image": "/assets/home-2.webp",
        "caption": "The fragrance selection interface in an immersive gallery."
      },
      {
        "title": "Three scents. Three different worlds.",
        "text": "Bubble Bath uses floating forms and soft motion. Springtime in a Park brings a blooming floral environment into the room. Lazy Sunday Morning uses blue irises, cooler tones, and quieter pacing. Each scene combines interaction with ambient sound and narration.",
        "image": "/assets/scent-7.webp",
        "caption": "Blue irises in the Lazy Sunday Morning scene."
      },
      {
        "title": "Making the animation work beyond Blender.",
        "text": "My first blooming-flower animation used procedural geometry nodes. It did not reliably survive the USD / USDZ export into visionOS. I switched to skeletal rigging, which gave me consistent export behavior, control over timing, and more predictable runtime performance.",
        "image": "/assets/scent-11.webp",
        "caption": "A spatial portal connects the gallery to a fragrance environment."
      },
      {
        "title": "A build pipeline shaped by the headset.",
        "text": "I translated narrative moods into spatial compositions, blocked scenes with low-poly geometry, and tested exports in the headset early. Each iteration focused on object hierarchy, readable scale, responsive interaction, lighting, and scene density. This kept the visual ambition grounded in what the hardware could reliably show."
      },
      {
        "title": "From visual concept to working prototype.",
        "text": "The resulting visionOS demo contains three interactive fragrance worlds. My build process combined scene composition, animation, export testing, and headset iteration, with particular attention to interaction clarity, scene density, and reliable transitions."
      },
      {
        "title": "Demo day at Apple.",
        "text": "Pitched ScentSync to Matt Stern from Apple’s Vision Products Group on demo day, presenting the spatial fragrance experience and working visionOS prototype."
      },
      {
        "title": "Where the experience could go next.",
        "text": "Future directions include saved scents, mood-based collections, a faster comparison mode, and deeper interactions for individual notes. Controls for brightness, audio intensity, and motion pacing would help visitors adjust the sensory experience."
      }
    ],
    "platform": "visionOS / Apple Vision Pro",
    "resources": [
      {
        "label": "Watch the demo",
        "href": "https://www.youtube.com/watch?v=WVlc_7suzCA"
      },
      {
        "label": "View the presentation",
        "href": "https://www.canva.com/design/DAG4C37I1x0/h8f-BRIQ-nebkXIap1qPvQ/view?utm_content=DAG4C37I1x0&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h4fa1e3b057"
      },
      {
        "label": "Explore the code",
        "href": "https://github.com/Boxxelf/ScentSync-Immersive-Final.git"
      }
    ],
    "gallery": [
      "/assets/scent-archive-1.webp",
      "/assets/scent-archive-2.webp",
      "/assets/scent-archive-3.webp",
      "/assets/scent-archive-4.webp",
      "/assets/scent-archive-5.webp",
      "/assets/scent-archive-6.webp",
      "/assets/scent-archive-7.webp",
      "/assets/scent-archive-8.webp",
      "/assets/scent-archive-9.webp",
      "/assets/scent-archive-10.webp",
      "/assets/scent-archive-11.webp",
      "/assets/scent-archive-12.webp",
      "/assets/scent-archive-13.webp",
      "/assets/scent-archive-14.webp",
      "/assets/scent-archive-15.webp",
      "/assets/scent-archive-16.webp"
    ]
  },
  {
    "slug": "stem-math-connections-explorer",
    "title": "STEM Math Connections Explorer",
    "category": "Data visualization",
    "year": "2025–present",
    "tagline": "Making the connections in learning visible.",
    "image": "/assets/stem-current-home.webp",
    "alt": "Calculus notation from the current STEM Math Connections Explorer website",
    "role": "Developer & Visualization Designer",
    "tools": "D3.js, JavaScript, HTML / CSS, Mermaid",
    "team": "ETS & WestEd / Degree Mapping Project",
    "intro": "An interactive exploration of how calculus supports advanced courses in Computer Science and Mechanical Engineering. Built for the ETS and WestEd Degree Mapping Project, it helps educators, researchers, and students trace concepts across degree pathways.",
    "sections": [
      {
        "title": "Where does calculus go next?",
        "text": "Calculus is a required gateway for many students, yet its connections to later coursework are often unclear. The explorer makes these connections visible to support curriculum design, advising, and student pathways."
      },
      {
        "title": "Two disciplines. Connected foundations.",
        "text": "Computer Science and Mechanical Engineering have dedicated mapping tools. Visitors can select discipline-specific areas or topics and explore the related calculus concepts, connection strengths, and written rationales."
      },
      {
        "title": "Two ways to explore the same relationships.",
        "text": "A ranked list surfaces calculus concepts most strongly connected to selected topics. The concept map supports zooming, panning, and discovery across clusters. Multi-select filters and written rationales help visitors understand both the strength and meaning of each connection."
      },
      {
        "title": "A maintainable path from concepts to a graph.",
        "text": "I built the front end with HTML, CSS, vanilla JavaScript, and D3.js. A data pipeline converts structured concept definitions, including Mermaid maps, into graph-ready JSON. Topic labels and rationale datasets keep the visual interface connected to the curriculum research."
      },
      {
        "title": "Making a dense network approachable.",
        "text": "The work includes responsive graph behavior, sorting, onboarding, informative empty states, and transitions that explain what changed after filtering. The underlying mappings draw on syllabi, textbooks, and expert review. The static architecture supports version-controlled releases through GitHub Pages."
      },
      {
        "title": "Explore the current version.",
        "text": "The live project includes the latest degree mappings, usage guidance, methods, team information, and dissemination updates. Open the explorer below to work directly with the current release."
      }
    ],
    "link": "https://boxxelf.github.io/STEM-Math-Connections-Explorer/",
    "linkLabel": "Explore the live project",
    "resources": [
      {
        "label": "Browse the source",
        "href": "https://github.com/Boxxelf/STEM-Math-Connections-Explorer"
      }
    ]
  },
  {
    "slug": "remlog",
    "title": "REM.log",
    "category": "Product & interaction design",
    "year": "2026",
    "tagline": "A place for the things you almost remember.",
    "image": "/assets/rem-2.webp",
    "alt": "REM.log dreamlike image landscape",
    "role": "UI/UX Designer & Interaction Designer",
    "tools": "Figma Make, Claude",
    "team": "Tina Jiang, Iris Xu, Psychea Dai",
    "intro": "A guided space for capturing dreams in fragments, images, and connections. Built at CreateSC 2026, where the project won first place in the Figma Make track.",
    "link": "https://remlog.site/",
    "linkLabel": "Explore the live project",
    "sections": [
      {
        "title": "Start with a fragment.",
        "text": "Dreams rarely arrive as orderly narratives. REM.log begins with keyword fragments and generates a visual alongside the written entry, preserving the visual, irrational quality of what the user remembers.",
        "image": "/assets/rem-4.webp",
        "caption": "A visual entry becomes part of a personal dream landscape."
      },
      {
        "title": "A map of an inner landscape.",
        "text": "As entries accumulate, a Dream Map connects recurring symbols, places, and moods. I worked on the interface and interaction design with Iris Xu and Psychea Dai, using Figma Make and Claude to bring the experience into a working web prototype.",
        "image": "/assets/rem-3.webp",
        "caption": "Dream entries are connected through an exploratory map."
      },
      {
        "title": "CreateSC 2026.",
        "text": "REM.log received first place in the Figma Make track. The prototype explores a gentler way to record personal experiences, allowing fragments to remain fragments while giving them a place to return to."
      }
    ],
    "platform": "Web / Figma Make",
    "gallery": [
      "/assets/rem-archive-1.webp",
      "/assets/rem-archive-2.webp",
      "/assets/rem-archive-3.webp",
      "/assets/rem-archive-4.webp",
      "/assets/rem-archive-5.webp"
    ],
    "resources": [
      {
        "label": "Read the Devpost story",
        "href": "https://devpost.com/software/rem-log"
      },
      {
        "label": "Watch the demo",
        "href": "https://vimeo.com/1182432241?fl=pl&fe=sh"
      }
    ]
  },
  {
    "slug": "iya-spatial-research",
    "title": "Honda Spatial Research",
    "category": "Spatial computing research",
    "year": "2026",
    "tagline": "Exploring how physical products are reviewed in space.",
    "image": "/assets/honda-workshop.webp",
    "alt": "Participants exploring Apple Vision Pro during the Honda spatial research workshop",
    "role": "Spatial Computing Researcher",
    "tools": "visionOS, RealityKit, CloudXR, Omniverse",
    "team": "USC Iovine and Young Academy × Honda Impact Lab",
    "intro": "Spatial computing research with USC Iovine and Young Academy and American Honda, exploring high-fidelity product visualization and industrial design review on Apple Vision Pro.",
    "nda": true,
    "sections": [
      {
        "title": "Research at the intersection of physical and digital.",
        "text": "In collaboration with American Honda, the research explored real-time 3D streaming, interaction fidelity, multi-user design review, and annotation prototypes. My contribution combined spatial research with hands-on prototyping in the visionOS environment.",
        "image": "/assets/honda-passthrough.webp",
        "caption": "A passthrough view from Apple Vision Pro during the research workshop."
      },
      {
        "title": "Further details available on request.",
        "text": "This project is under NDA. Further technical details are not published. Please get in touch to discuss my research and prototyping experience."
      }
    ],
    "platform": "Apple Vision Pro"
  },
  {
    "slug": "wonder-of-you",
    "title": "Wonder of You",
    "category": "Narrative VR experience",
    "year": "2026",
    "tagline": "A familiar room. A memory just out of reach.",
    "image": "/assets/wonder-home.webp",
    "alt": "A sunlit living room from the Wonder of You VR prototype",
    "role": "Solo Developer & VR Narrative Designer",
    "tools": "Unity, C#, XR Interaction Toolkit, OpenXR, Figma, Timeline, Spatial Audio",
    "team": "Tina Jiang",
    "intro": "Wonder of You is a first-person narrative VR project exploring memory, loss, and love through the perspective of a fictional person living with Alzheimer’s disease. Familiar interiors give way to dreamlike spaces, making uncertainty part of the experience.",
    "sections": [
      {
        "title": "Telling a story through what changes.",
        "text": "Everyday objects, phone calls, and environmental details carry the narrative. Contradictions in time and place invite the player to notice what feels different, while the story unfolds through exploration rather than a constant stream of explanation."
      },
      {
        "title": "A clock as a narrative anchor.",
        "text": "The original concept follows a retired engineer repairing a clock given to him by his wife. Its components become entry points into fragmented memories. Phone interactions carry the player between scenes, while voices and silhouettes suggest people whose presence remains uncertain."
      },
      {
        "title": "From home to an uncertain landscape.",
        "text": "The prototype moves between domestic interiors and surreal environments. Changes in scale, atmosphere, sound, and spatial continuity turn the environment into part of the storytelling.",
        "image": "/assets/wonder-dream.webp",
        "caption": "A dreamlike environment captured from the supplied prototype walkthrough."
      },
      {
        "title": "Designing for presence.",
        "text": "The interaction design explores object handling, proximity triggers, spatial prompts, and paced scene transitions on Meta Quest 3S. The accompanying design and technical documents outline how narrative events, audio, and scene state work together."
      }
    ],
    "platform": "Meta Quest 3S",
    "context": "CTAN 504L · Professor Eric Hanson",
    "gallery": [
      "/assets/wonder-archive-1.webp",
      "/assets/wonder-archive-2.webp",
      "/assets/wonder-archive-3.webp",
      "/assets/wonder-archive-4.webp",
      "/assets/wonder-archive-5.webp",
      "/assets/wonder-archive-6.webp",
      "/assets/wonder-archive-7.webp",
      "/assets/wonder-archive-8.webp",
      "/assets/wonder-archive-9.webp",
      "/assets/wonder-archive-10.webp"
    ],
    "resources": [
      {
        "label": "View the project document",
        "href": "https://drive.google.com/file/d/1w7PH02C2z9B9QYofCyKf5t0zoO_VOPma/view?usp=sharing"
      }
    ]
  },
  {
    "slug": "rewind",
    "title": "Rewind",
    "category": "Native iOS product",
    "year": "2026",
    "tagline": "Keep the memories. Make room for more.",
    "image": "",
    "cardImage": "/assets/rewind-card-cream.svg",
    "cardAlt": "Rewind logo on a warm white background",
    "alt": "Rewind logo on a warm white background",
    "role": "Solo Designer & Developer",
    "tools": "SwiftUI, SwiftData, PhotoKit, Vision, AVFoundation",
    "team": "Tina Jiang",
    "intro": "An on-device iOS app that turns photo cleanup into short sessions of rediscovery. I designed and built Rewind around finite decks, reversible decisions, and personal memories. Second place at Reverie Hacks 2026.",
    "link": "https://devpost.com/software/1-ns94yj",
    "linkLabel": "View Rewind on Devpost",
    "resources": [{"label":"View source and brand assets on GitHub","href":"https://github.com/Boxxelf/Rewind"}],
    "sections": [
      {
        "title": "Meet Rewind.",
        "text": "A fresh deck of familiar moments. Keep the good ones, set a few aside, and review what you’re ready to let go.",
        "video": "/assets/rewind-film-v2.mp4",
        "videoWidth": 1920,
        "videoHeight": 1080,
        "videoCaption": "29-second product film · English titles · Music. Delete selections are staged for review before system confirmation."
      },
      {
        "title": "One deck. One chapter.",
        "text": "Each deck contains 20–30 photos, screenshots, or videos. Age-weighted sampling brings older memories back into view. Four swipe directions let people keep, skip, stage for deletion, or defer an item to a Later Stack."
      },
      {
        "title": "Fast gestures. Deliberate decisions.",
        "text": "Directional locking makes swipes predictable. Deletions stay in a reviewable staging bin until the session ends. Deferred items return after a seven-day pause, giving uncertain decisions room to settle.",
        "image": "/assets/rewind-slide-2.webp",
        "caption": "Directional gestures for deciding what to keep, skip, revisit, or delete."
      },
      {
        "title": "Private by design.",
        "text": "SwiftData stores the local decision history, while PhotoKit handles media access. Display-sized thumbnails and limited prefetching keep the deck responsive. Photos remain on the device, with no account or upload pipeline.",
        "image": "/assets/rewind-slide-3.webp",
        "caption": "Explore past memories through the calendar, Chapters, and map."
      }
    ]
  },
  {
    "slug": "minim",
    "title": "MINIM",
    "category": "Product, brand & interaction design",
    "year": "2026",
    "tagline": "How much time passed? How much did you feel?",
    "image": "/assets/minim-calendar.webp",
    "alt": "MINIM daily calendar, time-perception cards, and illustrated card collection",
    "role": "UI/UX Design, Branding & Figma Prototyping",
    "tools": "Figma Design, Figma Slides",
    "team": "Tina Jiang, Psychea Dai, Jyue-An Yao",
    "intro": "A Figma prototype that visualizes the gap between perceived and elapsed time. Created for FigBuild 2026, MINIM uses gentle reflection, collectible cards, and expressive characters to make time perception tangible.",
    "link": "https://www.figma.com/proto/azTVMecMozxoicAvBOuBRq/FigBuild26-Prototype?page-id=0%3A1&node-id=6-2845&p=f&viewport=-398%2C255%2C0.13&t=wLaJA8fdcwSN6eOO-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=109%3A3623&show-proto-sidebar=1",
    "linkLabel": "Try it out",
    "sections": [
      {
        "title": "The moment of realization.",
        "text": "The proposed flow asks people to estimate how long they have been scrolling, then reveals the elapsed time. Neutral wording and a carefully paced reveal help the comparison feel reflective rather than judgmental."
      },
      {
        "title": "Turning a number into something personal.",
        "text": "Each session becomes a daily card with a deviation score and a character. A weekly calendar and a 365-dot year view let people explore patterns in how they experience time."
      },
      {
        "title": "A visual system with a softer voice.",
        "text": "I worked on the interface, branding, character design, and core interaction flows. Organic vector characters and a warm dark palette bring personality to a structure grounded in familiar iOS components. The project was designed and prototyped in Figma."
      }
    ],
    "resources": [
      {
        "label": "View the slide presentation",
        "href": "https://www.figma.com/deck/uQMQuDOselYtKIqGPXZn9c/MINIM-FigmaBuild?node-id=1-42&t=SbwZ4RvRXCDAJISh-1"
      },
      {
        "label": "Read the Devpost story",
        "href": "https://devpost.com/software/minim-sxjw9i"
      }
    ]
  },
  {
    "slug": "readpro",
    "title": "ReadPro",
    "category": "Accessible reading & browser tools",
    "year": "2025",
    "tagline": "A clearer path through a crowded page.",
    "image": "/assets/readpro-1.webp",
    "alt": "ReadPro reading controls alongside a simplified article",
    "role": "Product Designer & Developer",
    "tools": "Figma, JavaScript, HTML / CSS, Chrome Extension APIs",
    "team": "Tina Jiang, Sabrina Jiang, Jacky Guo, Fiona Zhu",
    "platform": "Chrome extension",
    "duration": "3 weeks",
    "intro": "ReadPro is a reading extension designed for people with ADHD and attention challenges. It combines a simpler reading view, adjustable typography, sentence highlighting, and linguistic cues to make long web pages easier to navigate and revisit.",
    "link": "https://boxxelf.github.io/Read-Pro/",
    "linkLabel": "Try ReadPro",
    "resources": [
      {
        "label": "Watch the introduction",
        "href": "https://www.youtube.com/watch?v=9FnC1ZqUmIc"
      },
      {
        "label": "View the presentation",
        "href": "https://www.figma.com/deck/PPtHAffX7Dg5iIQGqia5g2"
      }
    ],
    "gallery": [
      "/assets/readpro-1.webp",
      "/assets/readpro-2.webp"
    ],
    "sections": [
      {
        "title": "Designing around interrupted attention.",
        "text": "Dense layouts, advertising, pop-ups, and continuous scrolling compete with the text itself. Our starting point was a reader who switches context, loses their place, or needs to return to a passage after a break. The product brings the reading task back into focus with fewer competing signals."
      },
      {
        "title": "A reading environment people can adjust.",
        "text": "Sentence highlighting guides attention through a page. Text zoom and custom typography let readers change the visual density. Removing visual noise and converting all-caps text reduce the number of competing treatments within an article.",
        "image": "/assets/readpro-2.webp",
        "caption": "ReadPro’s interactive sample text and reading controls."
      },
      {
        "title": "Language support within the text.",
        "text": "Morphology mode emphasizes prefixes, roots, and suffixes. Phonology mode highlights phonetic patterns. These options pair attention support with linguistic decoding, so readers can choose the cues that suit the task."
      },
      {
        "title": "Capture now. Return later.",
        "text": "The workflow connects focused reading with highlighting and quick review. I contributed product design and implementation in a three-week team project, using the Chrome extension environment to apply the interface directly to web reading."
      }
    ]
  },
  {
    "slug": "thrive",
    "title": "Thrive",
    "category": "Wellness product & behavior design",
    "year": "2025",
    "tagline": "Making room for a small daily win.",
    "image": "/assets/thrive-1.webp",
    "alt": "Thrive wellness app screens and illustrated heart characters",
    "role": "Product Designer & Developer",
    "tools": "Figma, Xcode, SwiftUI, Adobe Illustrator",
    "team": "Tina Jiang, Parissa Teli, Aashwini Samir Vachhani, Joanna Wang, Jyue-An Yao",
    "platform": "Mobile app concept / iOS prototype",
    "intro": "Created in partnership with the American Heart Association, Thrive explores how wellness tools can feel approachable and motivating. The concept translates AHA’s Life’s Essential 8 framework into mini-games, daily missions, and supportive interactions.",
    "resources": [
      {
        "label": "Explore the prototype",
        "href": "https://www.figma.com/proto/esbJPok5bjC9sSQP1UekYO/Thrive-Prototype?page-id=1707%3A11146&node-id=1707-12722&starting-point-node-id=1707%3A12722&t=fqPRUGyvo0WgbQrW-1"
      },
      {
        "label": "Browse the code",
        "href": "https://github.com/Boxxelf/thrive"
      },
      {
        "label": "View the final presentation",
        "href": "https://www.canva.com/design/DAG52jCAdzw/4BRuzFUBze3wIQOnwrXFtw/view?utm_content=DAG52jCAdzw&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h009083c71e"
      },
      {
        "label": "View the early research",
        "href": "https://drive.google.com/file/d/1j3MaQO7QOm_8h_kzph_bFIvlMW0RBJun/view?usp=sharing"
      },
      {
        "label": "View the early pitch",
        "href": "https://www.figma.com/deck/YKG4iIaWij1uZXdItMNfiT/Team-AHAi---IIP-Pitch-Deck?node-id=1-592&t=Sw8jb4xxAyZKORWh-1"
      },
      {
        "label": "Explore the updated build",
        "href": "https://github.com/Boxxelf/thrive-updated.git"
      },
      {
        "label": "Explore the research board",
        "href": "https://www.figma.com/board/UPGdEqzkxxSyvsiF7ogMoX/IIP-Main-Doc?node-id=1092-1320&t=YBhodThlE46i0tKN-1"
      },
      {
        "label": "View the mini-game concepts",
        "href": "https://www.canva.com/design/DAG-ej90dKQ/Hh8fXnWxfzBSQhhB2mVtWg/view?utm_content=DAG-ej90dKQ&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hfdca5a684f"
      }
    ],
    "sections": [
      {
        "title": "The starting question: access and engagement.",
        "text": "We began by asking how AI could help close gaps in health access. Fragmented information, communication barriers, and digital experiences that are difficult to maintain all shaped the brief. The design goal was a product that people could start using with low effort and return to without feeling judged."
      },
      {
        "title": "An early direction: connected health records.",
        "text": "Our first concept paired a Universal Health Record with a patient-and-doctor chatbot. Patient mode guided structured symptom intake; a proposed authenticated clinician mode surfaced a concise history and referral packet. The aim was clearer handoffs across primary care and specialists."
      },
      {
        "title": "Why we changed direction.",
        "text": "A shared medical-record ecosystem would require coordination among hospitals, clinics, pharmacies, and specialists, together with substantial technical and regulatory work. We narrowed the project to a wellness concept that individuals could adopt independently. The research continued to inform our focus on communication, personalization, and access."
      },
      {
        "title": "Translating a framework into daily interactions.",
        "text": "Thrive organizes its game concepts around Life’s Essential 8: eating, activity, tobacco avoidance, sleep, weight, cholesterol, blood sugar, and blood pressure. The prototype explores small missions, an AI assistant, community challenges, and rewards as ways to make the framework easier to engage with."
      },
      {
        "title": "My contribution.",
        "text": "I designed key UI and UX flows, translated the eight framework areas into mini-game concepts, and supported the prototype and app build. Figma carried the interaction design, SwiftUI supported iOS prototyping, and Illustrator supplied visual assets.",
        "image": "/assets/thrive-6.webp",
        "caption": "The mobile concept combines encouragement, activities, and personal progress."
      },
      {
        "title": "What the prototype establishes.",
        "text": "The result is a product direction and set of interactive concepts for supportive habit-building. It brings the initial health-access research into a smaller, more approachable daily experience. Clinical effectiveness and long-term retention remain questions for future evaluation."
      }
    ]
  },
  {
    "slug": "nicoboo",
    "title": "Nicoboo",
    "category": "iOS product & interaction design",
    "year": "Fall 2025",
    "tagline": "A companion for the next smoke-free moment.",
    "image": "/assets/nicoboo-1.webp",
    "alt": "Nicoboo iPhone interface and hand-drawn visual system",
    "role": "Product Designer & iOS Developer",
    "tools": "Figma, SwiftUI, Xcode, Illustrator, Procreate, WidgetKit",
    "team": "Tina Jiang, Sabrina Jiang, Jacky Guo, Yiying Zhu",
    "platform": "iOS / iPhone",
    "intro": "Nicoboo is a quit-smoking companion built around encouragement, craving support, and small milestones. I worked on product design and iOS development, bringing a hand-drawn visual language into an app that feels welcoming to return to throughout an uneven habit-change journey.",
    "resources": [
      {
        "label": "Explore the code",
        "href": "https://github.com/HaoyangGuo1116/Nicoboo.git"
      },
      {
        "label": "Watch the trailer",
        "href": "https://youtube.com/shorts/N8ronnWMBec?feature=share"
      },
      {
        "label": "Read the privacy policy",
        "href": "https://smiling-slayer-ef4.notion.site/Privacy-Policy-2c6e96f22b7a8053a475fe63230b54b9"
      }
    ],
    "gallery": [
      "/assets/nicoboo-1.webp",
      "/assets/nicoboo-2.webp",
      "/assets/nicoboo-3.webp",
      "/assets/nicoboo-4.webp",
      "/assets/nicoboo-5.webp",
      "/assets/nicoboo-6.webp",
      "/assets/nicoboo-7.webp",
      "/assets/nicoboo-8.webp",
      "/assets/nicoboo-9.webp",
      "/assets/nicoboo-10.webp",
      "/assets/nicoboo-11.webp",
      "/assets/nicoboo-12.webp",
      "/assets/nicoboo-13.webp",
      "/assets/nicoboo-14.webp",
      "/assets/nicoboo-15.webp"
    ],
    "sections": [
      {
        "title": "Support during an uneven journey.",
        "text": "The project responds to cessation tools that can feel clinical, punitive, or dominated by statistics. We wanted progress to remain visible without treating a difficult day as the loss of everything that came before. The product centers reassurance, self-kindness, and the next manageable step."
      },
      {
        "title": "A visual language people can return to.",
        "text": "Illustration, restrained typography, and a clear navigation structure shape the experience. The presentation documents the move toward a more consistent hand-drawn identity, with redesigned widgets and milestones that make progress easy to recognize.",
        "image": "/assets/nicoboo-2.webp",
        "caption": "The Figma interface map connects onboarding, navigation, and core flows."
      },
      {
        "title": "Core interactions.",
        "text": "The app combines smoke-free streaks, a progress timeline, quick craving logs, encouragement, achievement badges, and health-progress information. iOS widgets bring reminders and milestones outside the app. Each element is intended to make daily progress tangible."
      },
      {
        "title": "From interface design to an iOS build.",
        "text": "SwiftUI and WidgetKit connected the design to native screens and widgets. The project presentation records platform constraints, typography inconsistencies, and layout issues encountered during implementation, alongside the decisions made to keep the visual system coherent."
      },
      {
        "title": "Release and continued refinement.",
        "text": "The original project record documents the release of version 1.1 on the App Store. Proposed next steps include more flexible profile controls, mood and emotion tracking, richer progress views, and ways to strengthen encouragement over time."
      }
    ]
  },
  {
    "slug": "edge-of-reason",
    "title": "Edge of Reason",
    "category": "Narrative game & world building",
    "year": "2025",
    "tagline": "What remains of humanity after the people are gone?",
    "image": "/assets/edge-of-reason-1.webp",
    "alt": "A snowy environment from the Edge of Reason game prototype",
    "role": "Unity Developer, Game Designer & World Builder",
    "tools": "Unity, C#, ProBuilder, Terrain tools, Blender, Rhino, Git",
    "team": "Tina Jiang, Sabrina Jiang, Psychea Dai",
    "platform": "Unity 3D / Viverse",
    "context": "2025 Viverse Spark Hack",
    "intro": "A story-driven 3D game set in a frozen, post-human future. KAI, an awakened robot, follows a mysterious signal called LUMA through abandoned places and incomplete archives. Exploration, memory reconstruction, and moral choices shape how KAI understands humanity.",
    "link": "https://create.viverse.com/zXZstb8",
    "linkLabel": "Explore the game",
    "resources": [
      {
        "label": "Read the narrative script",
        "href": "https://docs.google.com/document/d/e/2PACX-1vSZpfmqrpTKLBh5nQh6VuXqTt5M0fyXU6hu0YRZymcLAK9Upvme4lhgIo3rgq0Aj1cAR-x1CKG30Feq/pub"
      }
    ],
    "gallery": [
      "/assets/edge-of-reason-1.webp",
      "/assets/edge-of-reason-2.webp",
      "/assets/edge-of-reason-3.webp",
      "/assets/edge-of-reason-4.webp",
      "/assets/edge-of-reason-5.webp",
      "/assets/edge-of-reason-6.webp"
    ],
    "sections": [
      {
        "title": "A world built around absence.",
        "text": "After the Energy Wars and a failed AI Inheritance Program, Earth enters a sixth ice age. Machines continue to operate, but their purpose has become uncertain. KAI’s search for traces of human identity gives the player a reason to move through the ruins."
      },
      {
        "title": "Explore, scan, reconstruct, choose.",
        "text": "The discovery loop starts with scanning environments for echo artifacts. Thermal Memory Reconstruction reveals fragments of history, which lead to decisions about how KAI interprets the past. Progress comes from building an understanding of the world.",
        "image": "/assets/edge-of-reason-2.webp",
        "caption": "Environmental details turn exploration into a search for narrative fragments."
      },
      {
        "title": "Systems that carry the story.",
        "text": "The design pairs memory puzzles with an Emotional Drift Meter, where choices involving logic, empathy, and sacrifice influence KAI’s developing identity. Dialogue between KAI and LUMA keeps intention and truth uncertain, connecting interaction to the story’s possible endings."
      },
      {
        "title": "Three layers of memory.",
        "text": "The world design spans the Frozen City, the buried Noctis Facility, and the Core Vault. Each region moves closer to the AI Inheritance Program and the fragments of human identity it attempted to preserve. Their sequence gives the environment a narrative structure."
      },
      {
        "title": "Building the prototype.",
        "text": "Created for the 2025 Viverse Spark Hack, the prototype combines Unity world building, C# gameplay work, and narrative design. My role covered development, game design, and environments, working with Sabrina Jiang and Psychea Dai."
      }
    ]
  },
  {
    "slug": "neffy",
    "title": "Neffy — ARS Pharma Challenge Sprint",
    "category": "Service design research",
    "year": "Spring 2026",
    "tagline": "Connecting awareness, access, and action on campus.",
    "image": "/assets/neffy-research.webp",
    "alt": "Neffy demonstration device, blue carrying case, and printed materials from the research sprint",
    "role": "Challenge Sprint Researcher",
    "tools": "Research synthesis, service design",
    "team": "USC Iovine and Young Academy × ARS Pharma",
    "intro": "A challenge sprint with ARS Pharma focused on neffy and the campus experience of anaphylaxis preparedness. The research brief considers how students, bystanders, and campus responders can be better connected through awareness, access, and clearer service touchpoints.",
    "sections": [
      {
        "title": "Understanding the campus context.",
        "text": "The sprint frames preparedness as a service design question: how do people recognize available resources, find them when needed, and understand their role in a wider response system? The focus spans student life, campus communication, and the handoffs between people and services."
      },
      {
        "title": "From awareness to a connected service.",
        "text": "The project explores opportunities for education, resource visibility, and coordinated campus support. My role was Challenge Sprint Researcher, contributing to this research-led exploration of the experience around neffy."
      }
    ]
  },
  {
    "slug": "yikai-artist-website",
    "title": "Yi Kai — Artist Website",
    "category": "Web design",
    "year": "2026",
    "tagline": "A life in painting, made for exploration.",
    "image": "/assets/yikai-home.webp",
    "alt": "Yi Kai website opening with paintings arranged in a circular gallery",
    "role": "Web & Interaction Design",
    "platform": "Website / English & Traditional Chinese",
    "intro": "A digital home for Chinese-American contemporary artist Yi Kai. The website brings paintings, exhibition records, critical writing, and personal photographs into one experience, pairing a quiet editorial layout with a rotating artwork gallery, a photo album, and an interactive bookshelf.",
    "gallery": [
      "/assets/yikai-home.webp"
    ],
    "sections": [
      {
        "title": "An entrance through the paintings.",
        "text": "The opening ring of paintings unfolds into a focused artwork browser. Scroll and drag interactions move between works, while the title, dimensions, and series navigation give each painting a clear context. Generous space lets the color and texture of the artwork lead.",
        "video": "/assets/yikai-gallery.mp4",
        "poster": "/assets/yikai-home.webp",
        "videoCaption": "Opening sequence and artwork browsing. Silent screen recording.",
        "image": "/assets/yikai-works.webp",
        "caption": "The focused artwork view keeps series navigation and artwork details within reach."
      },
      {
        "title": "From discovery to the full archive.",
        "text": "A dedicated archive turns the collection into a browsable index of 117 works across six series. Category filters, visible counts, and consistent artwork captions support a more direct route through the collection after the exploratory homepage.",
        "image": "/assets/yikai-archive.webp",
        "caption": "The Works archive groups paintings by series in a clear three-column layout."
      },
      {
        "title": "Keep the history beside the work.",
        "text": "Collections brings together paintings, exhibition certificates, portraits, and archival records. A selected document sits beside the related work and a short explanation; the thumbnail strip provides a way to move through the archive without losing that context.",
        "image": "/assets/yikai-collections.webp",
        "caption": "An exhibition certificate and the related painting share a single archival view."
      },
      {
        "title": "A reading room for the reviews.",
        "text": "Reviews uses the visual language of printed matter: warm paper, layered pages, and large serif headlines. A chronological publication index sits alongside the reading area, connecting original scans with publication names and dates.",
        "image": "/assets/yikai-reviews.webp",
        "caption": "A chronological index accompanies magazine covers and review clippings."
      },
      {
        "title": "Personal memories, familiar objects.",
        "text": "The Memories page opens with a vintage computer and a photo album. Visitors can turn through album spreads or enter a retro desktop-style photo browser. These two ways of exploring give the personal archive a different pace from the painting gallery.",
        "video": "/assets/yikai-memories.mp4",
        "poster": "/assets/yikai-memories.webp",
        "videoCaption": "The photo album, page turns, and retro photo browser. Silent screen recording."
      },
      {
        "title": "A biography arranged as a bookshelf.",
        "text": "About presents a life in painting through seven book-like chapters. Selecting a spine brings a volume forward; opening it reveals a reading view with text and archival imagery. Chapter navigation connects the stories and returns the visitor to the shelf.",
        "video": "/assets/yikai-about.mp4",
        "poster": "/assets/yikai-about.webp",
        "videoCaption": "Selecting a book, opening a chapter, and returning to the shelf. Silent screen recording."
      },
      {
        "title": "Make room for the life around the art.",
        "text": "An editorial feature about the artist’s home extends the site beyond the work itself. Large architectural photographs, spacious text columns, and a prominent title connect the studio, the house, and everyday life. The page preserves the writer and photographer credits alongside the story.",
        "image": "/assets/yikai-home-story.webp",
        "caption": "The home feature pairs a large editorial headline with architecture photography."
      },
      {
        "title": "A consistent frame, different ways to explore.",
        "text": "The visual system carries a warm off-white background, dark typography, and restrained red accents across the site. Serif display type gives editorial pages their character, while clear navigation and an English / Traditional Chinese language switch tie the distinct browsing experiences together.",
        "image": "/assets/yikai-studio.webp",
        "caption": "A pull quote and studio photographs continue the editorial rhythm. Photography in the source page is credited to Luke Johnson."
      }
    ]
  }
];
export const artWorks=
[
  {
    "title": "Echo Chamber of a Top Player (Retired)",
    "image": "/assets/echo-chamber-1.webp",
    "type": "Kinetic installation",
    "exhibition": "Exhibited in Harmony Brings Prosperity, East Gallery, Claremont, CA.",
    "slug": "echo-chamber",
    "year": "2025",
    "medium": "Servo motors, custom wood panels, painted MDF, Arduino microcontrollers, wiring, wall-mounted hardware",
    "dimensions": "8 × 16 ft",
    "intro": "A wall-mounted kinetic installation combining repeated sculptural elements, custom wood panels, and Arduino-controlled servo motors.",
    "gallery": [
      "/assets/echo-chamber-1.webp",
      "/assets/echo-chamber-2.webp",
      "/assets/echo-chamber-3.webp",
      "/assets/echo-chamber-4.webp",
      "/assets/echo-chamber-5.webp",
      "/assets/echo-chamber-6.webp",
      "/assets/echo-chamber-7.webp"
    ]
  },
  {
    "title": "Line Busy",
    "image": "/assets/line-busy-1.webp",
    "type": "Resin-cast sculpture",
    "exhibition": "Exhibited in Slice: A Juried Exhibit of Regional Art, Pence Gallery, Davis, CA.",
    "slug": "line-busy",
    "year": "2025",
    "medium": "Cast resin, vintage telephone handset, embedded electronics, glass stand",
    "dimensions": "10 × 10 × 8 in",
    "intro": "A cast-resin telephone sculpture paired with a vintage handset, embedded electronics, and a glass stand.",
    "gallery": [
      "/assets/line-busy-1.webp",
      "/assets/line-busy-2.webp",
      "/assets/line-busy-3.webp",
      "/assets/line-busy-4.webp",
      "/assets/line-busy-5.webp",
      "/assets/line-busy-6.webp"
    ]
  },
  {
    "title": "Chicken Soup",
    "image": "/assets/chicken-soup-1.webp",
    "type": "Interactive kinetic sculpture",
    "slug": "chicken-soup",
    "year": "2025",
    "medium": "Ultrasonic distance sensor, thermal receipt printer, translucent acrylic, Arduino microcontroller, wiring",
    "dimensions": "6 × 1 ft",
    "intro": "An interactive sculpture that brings an ultrasonic distance sensor and thermal receipt printer into a translucent acrylic structure.",
    "gallery": [
      "/assets/chicken-soup-1.webp",
      "/assets/chicken-soup-2.webp",
      "/assets/chicken-soup-3.webp",
      "/assets/chicken-soup-4.webp",
      "/assets/chicken-soup-5.webp",
      "/assets/chicken-soup-6.webp",
      "/assets/chicken-soup-7.webp"
    ]
  },
  {
    "title": "A Typical NAND",
    "image": "/assets/typical-nand-1.webp",
    "type": "Resin-cast sculpture",
    "exhibition": "Collection of Peggy Phelps & East Galleries, Claremont, CA.",
    "slug": "typical-nand",
    "year": "2024",
    "medium": "3D modeling, plywood, resin, silicone rubber, USB drive, pigments",
    "dimensions": "8 × 3 × 5 in",
    "intro": "A small-scale resin sculpture developed through 3D modeling, mold-making, and casting, bringing digital and physical materials into the same object.",
    "gallery": [
      "/assets/typical-nand-1.webp",
      "/assets/typical-nand-2.webp",
      "/assets/typical-nand-3.webp",
      "/assets/typical-nand-4.webp",
      "/assets/typical-nand-5.webp",
      "/assets/typical-nand-6.webp",
      "/assets/typical-nand-7.webp",
      "/assets/typical-nand-8.webp",
      "/assets/typical-nand-9.webp",
      "/assets/typical-nand-10.webp",
      "/assets/typical-nand-11.webp",
      "/assets/typical-nand-12.webp"
    ]
  },
  {
    "title": "Fuxi, Nuwa, DNA, and the Yin-Yang Cosmos",
    "image": "/assets/fuxi-nuwa-1.webp",
    "type": "Kinetic installation",
    "slug": "fuxi-nuwa",
    "year": "2024",
    "medium": "Arduino, servo and stepper motors, motor drivers, aluminum rail, laser-cut components, spray paint",
    "dimensions": "Top box: 16 × 16 × 16 in; side box: 12 × 12 × 3.5 in",
    "intro": "An Arduino-driven installation whose construction combines motorized movement, aluminum rails, and laser-cut components.",
    "gallery": [
      "/assets/fuxi-nuwa-1.webp",
      "/assets/fuxi-nuwa-2.webp",
      "/assets/fuxi-nuwa-3.webp",
      "/assets/fuxi-nuwa-4.webp",
      "/assets/fuxi-nuwa-5.webp",
      "/assets/fuxi-nuwa-6.webp",
      "/assets/fuxi-nuwa-7.webp",
      "/assets/fuxi-nuwa-8.webp",
      "/assets/fuxi-nuwa-9.webp",
      "/assets/fuxi-nuwa-10.webp",
      "/assets/fuxi-nuwa-11.webp",
      "/assets/fuxi-nuwa-12.webp"
    ],
    "resources": [
      {
        "label": "Watch the installation",
        "href": "https://www.youtube.com/watch?v=jG62GvjZohc"
      }
    ]
  },
  {
    "title": "The Desert Sweet",
    "image": "/assets/desert-sweet-2.webp",
    "type": "Cast resin sculpture",
    "slug": "desert-sweet",
    "year": "2025",
    "medium": "Cast resin, embedded electronics, wood stand",
    "dimensions": "12 × 12 × 25 in",
    "intro": "A cast-resin sculpture combining embedded electronics and a wood stand. The gallery documents the complete work, its material details, and its installation.",
    "gallery": [
      "/assets/desert-sweet-1.webp",
      "/assets/desert-sweet-2.webp",
      "/assets/desert-sweet-3.webp",
      "/assets/desert-sweet-4.webp",
      "/assets/desert-sweet-5.webp",
      "/assets/desert-sweet-6.webp"
    ]
  }
];
