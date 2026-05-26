# Architecture — Stephcom Factory

## Objectif

Construire une base commune capable de produire et structurer plusieurs projets : Astro Premium, Naturo Vitalité, générateur de sites, PDF premium, contenus SEO, automatisations.

## Principes

- Un seul socle.
- Des modules métier séparés.
- Agents transversaux.
- Chemins relatifs.
- Mac + Windows.
- SQLite local au départ.
- API payantes utilisées seulement quand elles ont une valeur commerciale.

## Couches

1. Core : agents, workflows, templates, qualité, providers.
2. Modules : Astro, Naturo, PDF, questionnaires, knowledge base.
3. Workspace : projets concrets.
4. App : future interface locale.
