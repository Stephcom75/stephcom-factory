# Plan de récupération — ancien index.html

## Objectif

Recycler l'ancien cockpit Stephcom / AI PERSO sans conserver les mauvaises pratiques.

## À conserver

- Direction artistique cyber.
- Layout cockpit.
- Chat central.
- Sélecteur d'agents.
- Mémoire / archives.
- Import/export local.
- Thèmes visuels.
- Assistant de setup.
- Configuration API comme idée, mais pas côté frontend.

## À corriger

- Encodage cassé.
- Ancien branding.
- Fichier unique trop lourd.
- Appels API côté navigateur.
- Absence de backend.
- Absence de SQLite.
- Absence de composants React.

## À supprimer

- Toute vraie clé API.
- Tout secret visible.
- Uploads non sécurisés.
- Fonctions gadgets non prioritaires.

## Transformation

index_original.html → analyse → extraction design/fonctions → React/Vite → backend Node → .env → SQLite.
