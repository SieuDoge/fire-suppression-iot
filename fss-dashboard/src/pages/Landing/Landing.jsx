import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/landing/Navbar'
import Hero from '../../components/landing/Hero'
import Features from '../../components/landing/Features'
import HowItWorks from '../../components/landing/HowItWorks'
import Specs from '../../components/landing/Specs'
import CTA from '../../components/landing/CTA'
import Footer from '../../components/landing/Footer'
import AuthModal from '../../components/landing/AuthModal'
import useScrollReveal from '../../hooks/useScrollReveal'
import '../../styles/landing.css'

/**
 * Landing — trang giới thiệu công khai của FSS·CTRL.
 * Quản lý state của modal đăng nhập/đăng ký và điều hướng sang /dashboard.
 */
export default function Landing() {
  const pageRef = useRef(null)
  const navigate = useNavigate()
  const [modal, setModal] = useState(null) // 'login' | 'signup' | null

  useScrollReveal(pageRef)

  const goToDashboard = () => navigate('/dashboard')

  return (
    <div className="landing-page" ref={pageRef}>
      <Navbar onLogin={() => setModal('login')} onSignup={() => setModal('signup')} />
      <Hero onSignup={() => setModal('signup')} />
      <Features />
      <HowItWorks />
      <Specs />
      <CTA onLogin={() => setModal('login')} onSignup={() => setModal('signup')} />
      <Footer />

      <AuthModal
        type={modal}
        onClose={() => setModal(null)}
        onSwitch={(to) => setModal(to)}
        onSubmit={goToDashboard}
      />
    </div>
  )
}
