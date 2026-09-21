import { Exhibition } from '@/components/Exhibition';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AcademicStats from '@/components/AcademicStats';
import CybersecuritySection from '@/components/CybersecuritySection';
import CveSection from '@/components/CveSection';
import GoogleCertification from '@/components/GoogleCertification';
import EduSrcSection from '@/components/EduSrcSection';
import Projects from '@/components/Projects';
import CompetitionSection from '@/components/CompetitionSection';
import SocialImpact from '@/components/SocialImpact';
import HonorGallery from '@/components/HonorGallery';
import Timeline from '@/components/Timeline';
import Footer from '@/components/Footer';
import MotionSystem from '@/components/MotionSystem';
import Guestbook from '@/components/guestbook/Guestbook';

export default function Home(){return <Exhibition><Navbar/><main id="main"><Hero/><AcademicStats/><CybersecuritySection/><CveSection/><GoogleCertification/><EduSrcSection/><Projects/><CompetitionSection/><SocialImpact/><HonorGallery/><Timeline/><Guestbook/></main><Footer/><MotionSystem/></Exhibition>;}
