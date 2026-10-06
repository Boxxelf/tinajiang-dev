'use client';
import {useState} from 'react';
export default function ContactActions(){const [status,setStatus]=useState('Copy email');async function copy(){try{await navigator.clipboard.writeText('yutongj@usc.edu');setStatus('Email copied')}catch{setStatus('Select the address to copy')}}return <div className="contact-actions"><a href="mailto:yutongj@usc.edu">yutongj@usc.edu</a><button onClick={copy} aria-live="polite">{status}</button></div>}
