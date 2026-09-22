# Sponsor Studio smoke test

The local Expo web preview loaded `http://localhost:8081/sponsor-studio` successfully. The initial screen rendered the offline/mock network banner, query preview, full-demo control, pipeline timeline, and all seven sponsor cards.

The full-demo control responded on the second click and entered its loading state. The async run was still in progress at the last browser observation; no bundle or route error was observed.

The full pipeline completed and rendered all expected outputs: five completed timeline stages, Perfect Corp visual, four ranked products, name.com identity, Nutrient style book, Foxit review workflow, Doctavian structured report, and the judge-ready story. The browser console contained only React Native development warnings (`pointerEvents` deprecation and web fallback for native animation), with no app-owned exception.
