# Plinth — l'iPhone que ton agent de code remplit

**Bientôt disponible** · iPhone · gratuit

Site : https://connected-mate.github.io/plinth/ · English: https://connected-mate.github.io/plinth/en/

Plinth est une app iPhone qui tourne un petit serveur MCP sur ton Wi‑Fi. Ton agent de code (Claude Code, Codex, Cursor…) s'y appaire avec un code à 6 chiffres, puis y dépose notes, listes, mini-apps, widgets, Live Activities et notifications. Pas de serveur, pas de compte.

- Guide d'installation pour les agents : [AGENT-SETUP.md](AGENT-SETUP.md)
- Un souci ? [Ouvre une issue](https://github.com/Connected-Mate/plinth/issues).

Ce dépôt contient le site et les futurs téléchargements. Le code de l'application n'est pas public. © Connected Mate, tous droits réservés.

## Site

Statique, sans framework, publié par GitHub Pages depuis `docs/`. Tous les textes FR + EN vivent dans `site/build.py` :

```sh
python3 site/build.py      # régénère docs/index.html, docs/en/, 404, sitemap, manifest
```

Le film de présentation se refait avec `video/` (voir `video/README.md`). Images OG : `site/render.html`.

## Crédits
- Police d'affichage « Plinth Display » : Archivo Black / Black Italic, © The Archivo Project Authors, SIL Open Font License 1.1 (`docs/assets/fonts/OFL.txt`).
- Logos des agents : données Simple Icons (CC0). Les marques appartiennent à leurs propriétaires ; usage descriptif uniquement (« fonctionne avec »), aucun partenariat.
- Fonds (papier, artisan, tissu, tapis de coupe, verre liquide) : fournis par Alex pour Plinth. Versions web générées par `site/backgrounds.py` (AVIF/WebP ≤ 250 Ko, chargés seulement quand on les choisit).
- Vidéo rendue avec `@napi-rs/canvas` et `ffmpeg-static`.
