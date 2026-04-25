import "./Hero.css";

function Hero({ title, subtitle, primaryAction, secondaryAction }) {
  return (
    <section className="hero">
      <div className="hero__content">
        <span className="hero__eyebrow">Busco Profe</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div className="hero__actions">
          {primaryAction}
          {secondaryAction}
        </div>
      </div>

      <div className="hero__card">
        <div className="hero__badge">Portal laboral deportivo</div>
        <h3>
          Conecta instituciones y profes con una experiencia clara, moderna y
          profesional.
        </h3>
      </div>
    </section>
  );
}

export default Hero;
