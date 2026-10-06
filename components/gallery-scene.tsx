'use client';
import {Canvas,useFrame,useLoader,useThree,ThreeEvent} from '@react-three/fiber';
import {Suspense,useRef,useEffect} from 'react';
import * as THREE from 'three';
const entries=[
{image:'/assets/scent-10.webp',name:'ScentSync',url:'/work/project-one-f5w4d-z9nem-s3jda-eyssk-73f62-tmxz9-9jkyc',p:[-.9,1.25,.2],r:[.04,.18,-.12],size:[2.3,1.65]},
{image:'/assets/art-4.webp',name:'Line Busy',url:'/creative-practice',p:[1.45,1.85,-.7],r:[-.03,-.22,.12],size:[1.35,1.65]},
{image:'/assets/rem-2.webp',name:'REM.log',url:'/work/remlog',p:[1.15,-.45,.5],r:[.03,-.15,.08],size:[2.1,1.35]},
{image:'/assets/stem-current-home.webp',name:'STEM Math Connections Explorer',url:'/work/stem-math-connections-explorer',p:[-1.45,-1.35,.1],r:[-.02,.2,-.1],size:[1.8,1.22]},
{image:'/assets/home-3.webp',name:'Creative Practice',url:'/creative-practice',p:[.6,-2.05,-.45],r:[-.06,-.18,.1],size:[1.15,1.55]}
];
type Props={mode:'space'|'index';progress:React.MutableRefObject<number>;onHover:(name:string)=>void;onNavigate:(url:string)=>void;onReady:()=>void;active:boolean};
function Piece({item,index,mode,progress,onHover,onNavigate}:{item:typeof entries[number];index:number}&Omit<Props,'onReady'|'active'>){
 const mesh=useRef<THREE.Group>(null);const hot=useRef(false);const tex=useLoader(THREE.TextureLoader,item.image);tex.colorSpace=THREE.SRGBColorSpace;const {viewport}=useThree();
 useFrame(({pointer,clock},delta)=>{if(!mesh.current)return;const dt=Math.min(delta,.04);const t=mode==='index'?1:progress.current;const fit=Math.min(viewport.width/5.2,viewport.height/6.2,1.15);const ix=(index%2)*2.25-1.1,iy=1.9-Math.floor(index/2)*1.8;const x=THREE.MathUtils.lerp(item.p[0],ix,t)*fit+pointer.x*.10*(1-t);const y=THREE.MathUtils.lerp(item.p[1],iy,t)*fit+(pointer.y*.09+Math.sin(clock.elapsedTime*.5+index)*.025)*(1-t);const z=THREE.MathUtils.lerp(item.p[2],0,t)+(hot.current?.25:0);mesh.current.position.x=THREE.MathUtils.damp(mesh.current.position.x,x,5,dt);mesh.current.position.y=THREE.MathUtils.damp(mesh.current.position.y,y,5,dt);mesh.current.position.z=THREE.MathUtils.damp(mesh.current.position.z,z,5,dt);mesh.current.rotation.set(THREE.MathUtils.damp(mesh.current.rotation.x,item.r[0]*(1-t)-pointer.y*.06,5,dt),THREE.MathUtils.damp(mesh.current.rotation.y,item.r[1]*(1-t)+pointer.x*.08,5,dt),THREE.MathUtils.damp(mesh.current.rotation.z,item.r[2]*(1-t),5,dt));const sc=fit*(hot.current?1.035:1)*(1-t*.15);mesh.current.scale.setScalar(THREE.MathUtils.damp(mesh.current.scale.x,sc,5,dt));});
 function over(e:ThreeEvent<PointerEvent>){e.stopPropagation();hot.current=true;onHover(item.name)}function out(){hot.current=false;onHover('')}
 return <group ref={mesh} position={item.p as [number,number,number]} onPointerOver={over} onPointerOut={out} onClick={e=>{e.stopPropagation();onNavigate(item.url)}}><mesh position={[0,0,-.035]}><boxGeometry args={[item.size[0]+.025,item.size[1]+.025,.05]}/><meshStandardMaterial color="#dedfd7" roughness={.7}/></mesh><mesh><planeGeometry args={[item.size[0],item.size[1]]}/><meshBasicMaterial map={tex} toneMapped={false}/></mesh></group>
}
function Artifacts(props:Props){useEffect(()=>{props.onReady()},[]);return <><ambientLight intensity={2}/><directionalLight position={[2,4,5]} intensity={3}/>{entries.map((item,index)=><Piece key={item.name} item={item} index={index} {...props}/>)}</>}
export default function GalleryScene(props:Props){return <Canvas camera={{position:[0,0,8],fov:43}} dpr={[1,1.5]} frameloop={props.active?'always':'demand'} gl={{alpha:true,antialias:true,powerPreference:'low-power'}} aria-hidden="true"><Suspense fallback={null}><Artifacts {...props}/></Suspense></Canvas>}
