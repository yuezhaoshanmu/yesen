import { Exhibition } from '@/components/Exhibition';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AchievementOverview from '@/components/AchievementOverview';
import CybersecuritySection from '@/components/CybersecuritySection';
import CveSection from '@/components/CveSection';
import GoogleCertification from '@/components/GoogleCertification';
import EduSrcSection from '@/components/EduSrcSection';
import Projects from '@/components/Projects';
import CompetitionSection from '@/components/CompetitionSection';
import OtherHonors from '@/components/OtherHonors';
import Footer from '@/components/Footer';
import MotionSystem from '@/components/MotionSystem';
import Guestbook from '@/components/guestbook/Guestbook';

export default function Home(){return <Exhibition><Navbar/><main id="main"><Hero/><AchievementOverview/><GoogleCertification/><EduSrcSection/><CybersecuritySection/><CveSection/><CompetitionSection/><OtherHonors/><Projects/><Guestbook/></main><Footer/><MotionSystem/></Exhibition>;}
