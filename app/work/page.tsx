import Link from 'next/link';
import {projects} from '@/lib/projects';
import ProjectCard from '@/components/project-card';
export default function Work(){return <main className="inner-page section-wrap"><h1>Selected work</h1><div className="work-grid">{projects.map(p=><ProjectCard key={p.slug} project={p}/>)}</div></main>}
