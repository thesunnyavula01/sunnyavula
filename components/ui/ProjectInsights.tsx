import type { CSSProperties } from "react";
import type { ProjectInsight } from "@/content/sections";
import styles from "./ProjectInsights.module.css";

export function ProjectInsights({
  projects,
  accent,
}: {
  projects: ProjectInsight[];
  accent: string;
}) {
  return (
    <div className={styles.projects} style={{ "--project-accent": accent } as CSSProperties}>
      {projects.map((project) => (
        <details key={project.name} className={styles.project}>
          <summary className={styles.summary}>
            <span className={styles.name}>{project.name}</span>
            <span className={styles.category}>{project.category}</span>
            <span className={styles.description}>{project.summary}</span>
            <span className={styles.toggle} aria-hidden="true">+</span>
          </summary>
          <div className={styles.insight}>
            <p>{project.insight}</p>
            <a href={project.link.href} target="_blank" rel="noopener noreferrer">
              {project.link.label} <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </details>
      ))}
    </div>
  );
}
