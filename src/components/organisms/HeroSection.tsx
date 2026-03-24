import reactLogo from '../../assets/react.svg'
import viteLogo from '../../assets/vite.svg'
import heroImg from '../../assets/hero.png'

export const HeroSection: React.FC = () => {
  return (
    <section className="hero-section" id="center">
      <div className="hero-section__content">
        <img 
          src={heroImg} 
          className="hero-section__image hero-section__image--main" 
          width="170" 
          height="179" 
          alt="Golden Tool Logo" 
        />
        <img 
          src={reactLogo} 
          className="hero-section__image hero-section__image--framework" 
          alt="React logo" 
        />
        <img 
          src={viteLogo} 
          className="hero-section__image hero-section__image--vite" 
          alt="Vite logo" 
        />
      </div>
      <div className="hero-section__text">
        <h1 className="hero-section__title">Welcome to Golden Tool</h1>
        <p className="hero-section__description">
          Your complete solution for transmission management
        </p>
      </div>
    </section>
  )
}