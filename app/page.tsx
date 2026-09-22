import { Exhibition } from '@/components/Exhibition';
import Navigation from '@/components/atelier/Navigation';
import { HeroScene, HonorIndex, GoogleScene, EduScene, NationalScene, GlobalScene, AwardScene, ArchiveScene, AcademicScene, ProjectScenes, EndingScene } from '@/components/atelier/Scenes';
import SceneMotion from '@/components/atelier/SceneMotion';
import Guestbook from '@/components/guestbook/Guestbook';

export default function Home() {
  return <Exhibition><div className="atelier"><Navigation /><main id="main"><HeroScene /><AcademicScene /><HonorIndex /><GoogleScene /><EduScene /><NationalScene /><GlobalScene /><AwardScene /><ArchiveScene /><ProjectScenes /><Guestbook /></main><EndingScene /><SceneMotion /></div></Exhibition>;
}
