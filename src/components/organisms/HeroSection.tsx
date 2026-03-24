import { useState } from 'react'
import { Button } from '../atoms/Button'
import reactLogo from '../../assets/react.svg'
import viteLogo from '../../assets/vite.svg'
import heroImg from '../../assets/hero.png'

export const HeroSection: React.FC = () => {
  const [count, setCount] = useState(0)

  return (
    <section className="hero-section" id="center">
      <div className="hero-section__content">
        <img 
          src={heroImg} 
          className="hero-section__image hero-section__image--main" 
          width="170" 
          height="179" 
          alt="" 
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
        <h1 className="hero-section__title">Get started</h1>
        <p className="hero-section__description">
          Edit <code className="hero-section__code">src/App.tsx</code> and save to test <code className="hero-section__code">HMR</code>
        </p>
      </div>
      <Button
        className="hero-section__button"
        onClick={() => setCount((c) => c + 1)}
      >
        Count is {count}
      </Button>
    </section>
  )
}
