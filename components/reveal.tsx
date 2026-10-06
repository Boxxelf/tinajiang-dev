'use client';
import {useEffect,useRef,ReactNode} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
export default function Reveal({children,className=''}:{children:ReactNode;className?:string}){const root=useRef<HTMLDivElement>(null);useEffect(()=>{gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();mm.add('(prefers-reduced-motion: no-preference)',()=>{const ctx=gsap.context(()=>{gsap.fromTo(root.current,{y:28,opacity:0},{y:0,opacity:1,duration:.8,ease:'power3.out',scrollTrigger:{trigger:root.current,start:'top 94%',once:true}})},root);return()=>ctx.revert()});return()=>mm.revert()},[]);return <div ref={root} className={className}>{children}</div>}
