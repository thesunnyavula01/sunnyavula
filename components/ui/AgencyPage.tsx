import Image from "next/image";
import Link from "next/link";
import { agency } from "@/content/agency";
import { SITE, type Section } from "@/content/sections";
import styles from "./AgencyPage.module.css";

export function AgencyPage({ section }: { section: Section }) {
  return (
    <article className={styles.agency}>
      <header className={styles.hero}>
        <div className={styles.topline}>
          <Link href="/" prefetch={false}>← Back to the desk</Link>
          <a href={SITE.attAgency} aria-label="Visit ATT Agency">AT<sup>2</sup></a>
        </div>
        <p className={styles.kicker}>{section.tagline}</p>
        <h1>ATT<span>Agency</span></h1>
        <div className={styles.heroBottom}>
          <a href="#agency-work">Explore the work ↓</a>
          <div><p>We handle</p><ul>{agency.services.map(service => <li key={service.name}>{service.name}</li>)}</ul></div>
        </div>
      </header>

      <section className={styles.intro} aria-label="About ATT Agency">
        <p>{agency.introduction}</p>
        <p className={styles.motto}>{agency.motto}</p>
      </section>

      <section id="agency-work" className={styles.work} aria-labelledby="agency-work-title">
        <div className={styles.sectionHeading}><p>Featured work</p><h2 id="agency-work-title">Work that earns attention.</h2></div>
        <figure className={styles.campaign}>
          <div className={styles.campaignStage}>
            <span aria-hidden="true">Thriftly</span>
            <video controls playsInline preload="none" poster="/agency/thriftly.jpg" aria-label="Thriftly paid social advertisement">
              <source src="https://attagency.co/_astro/ad.CCzbxDBM.mp4" type="video/mp4" />
              <a href="https://attagency.co/#work">Watch the Thriftly campaign</a>
            </video>
          </div>
          <figcaption><h3>Thriftly</h3><p>Paid social campaign</p></figcaption>
        </figure>
        <div className={styles.projects}>{agency.projects.map(project => (
          <a key={project.name} href={project.href} target="_blank" rel="noopener noreferrer">
            <Image src={project.image} alt={`${project.name} website homepage`} width={1200} height={750} unoptimized sizes="(max-width: 700px) 100vw, 50vw" />
            <div className={styles.caption}><h3>{project.name} ↗</h3><p>{project.description}</p></div>
          </a>
        ))}</div>
      </section>

      <section className={styles.services} aria-labelledby="agency-services-title">
        <div><p className={styles.kicker}>Capabilities</p><h2 id="agency-services-title">One team.<br />The full picture.</h2></div>
        <ul>{agency.services.map(service => <li key={service.name}><h3>{service.name}</h3><p>{service.description}</p></li>)}</ul>
      </section>

      <section className={styles.studio} aria-labelledby="agency-studio-title">
        <div className={styles.monogram} aria-hidden="true">AT<sup>2</sup></div>
        <div><p className={styles.kicker}>Studio</p><h2 id="agency-studio-title">Three founders.<br />One working team.</h2>
          <ul>{agency.founders.map(founder => <li key={founder.name}><a href={founder.href}><h3>{founder.name} ↗</h3><p>{founder.role}</p></a></li>)}</ul>
        </div>
      </section>

      <section className={styles.contact} aria-labelledby="agency-contact-title">
        <div><p className={styles.kicker}>Start a project</p><h2 id="agency-contact-title">Tell us what<br />you need.</h2></div>
        <div><a className={styles.cta} href={`${SITE.attAgency}/#contact`}>Start a project at ATT Agency ↗</a><p>Full service marketing<br />Boulder, Colorado</p></div>
      </section>
    </article>
  );
}
