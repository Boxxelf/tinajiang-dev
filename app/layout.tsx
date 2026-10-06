import type {Metadata} from 'next';
import './globals.css';
import {Header,Footer} from '@/components/site-shell';
export const metadata:Metadata={title:'Tina Jiang | Product Designer & Creative Technologist',description:'Thoughtful experiences across screens, data, and space. Explore Tina Jiang’s product design, spatial computing, and creative practice.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body><a className="skip-link" href="#main-content">Skip to content</a><Header/><div id="main-content">{children}</div><Footer/></body></html>}
