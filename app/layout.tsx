import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Baloney Detector | Think a little deeper',description:'Examine claims, spot weak reasoning, and learn to ask better questions.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>;}
