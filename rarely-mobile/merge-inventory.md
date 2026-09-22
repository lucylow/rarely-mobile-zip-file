# RARELY Archive Merge Inventory

This merge treats the current Manus project as the canonical destination and `rarely-mobile-OLD-IDK.zip` as a comparison source. Dependencies, caches, generated artifacts, and archive workspace files were not copied.

| Archive area | Classification | Decision |
|---|---|---|
| `app/ux/*` | REJECT-DUPLICATE | Alternate-path implementations of behavior already maintained under `lib/ux/*`; not copied. |
| Shared app screens | KEEP-MANUS / MERGE-BOTH | The canonical screens remain authoritative; no wholesale replacement was performed. |
| `server/routers.ts` | KEEP-MANUS | The canonical server contains the more complete AI procedures and output validation. |
| `package.json` and lockfile | KEEP-MANUS | No archive-only dependency was required. |
| Theme and Expo configuration | KEEP-MANUS | The canonical Expo 54 and RARELY theme configuration remain in place. |
| Privacy, guards, haptics, local storage, personalization, and monetization helpers | KEEP-MANUS | Hash comparison confirmed the archive copies are identical for the inspected shared modules. |
| Sponsor system and Sponsor Studio | KEEP-MANUS | The existing sponsor adapters, mock assets, orchestration, route, and Create entry point are preserved. |
| Archive screens absent from the canonical app | PORT-CURSOR-FEATURE | None identified after source inventory; the archive contains no additional route that is not already represented. |
| Archive-only source value | REJECT-OBSOLETE | No genuinely unique, compatible Cursor behavior was found that would improve the current canonical implementation without duplication. |

## Result

The newest final RARELY version remains the canonical Manus application with its sponsor integration, privacy-safe AI recovery, local-first storage, and current reliability improvements intact. The archive comparison did not justify copying the older `app/ux` tree or replacing any current screen, server route, dependency, theme, or storage implementation.
