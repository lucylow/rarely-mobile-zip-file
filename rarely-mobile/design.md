# RARELY — Mobile Interface Design Plan

## Product direction

RARELY is a calm, premium creative space for self-expression. The user is the main character: Selena Gomez is treated as a creative host, not the subject of a fan feed. The initial build prioritizes the daily mood check-in and the personalized 10-minute Rare Moment, with clear boundaries that the AI feature is a creativity and reflection aid rather than therapy.

The interface assumes portrait orientation and one-handed use. Primary actions sit in the lower half of the screen, touch targets are generous, and the information hierarchy is quiet rather than dense. The visual system uses warm cream, deep plum, soft blush, and a focused coral accent to make the app feel editorial, intimate, and optimistic.

## Screen list

| Screen | Primary content and functionality |
|---|---|
| Home / Rare Moment | Greeting, “How are you feeling today?” prompt, mood chips, and a personalized 10-minute activity card generated from the selected mood. |
| Create | Entry points for Photo, Journal, Music, Collage, and Rare AI. The first iteration can present these as actionable cards with lightweight local interactions. |
| Community | Moderated community circles for creativity, confidence, music, and hobbies. The first iteration shows circle previews and positive prompts without requiring accounts. |
| Rare Studio | Beauty experimentation and routine discovery with scan, discover, try, and save concepts. The first iteration presents routines and saved inspiration as local content. |
| Profile | Personal preferences, saved moments, activity history, and the private “Your Year in You” scrapbook concept. |
| Rare Moment detail | Focused activity flow with a prompt, timer/progress state, save action, and completion feedback. |
| Journal composer | Private text entry for reflections and prompts, with local persistence planned for a later iteration. |
| Rare AI | Conversational prompt surface for brainstorming, journaling, and positive activity ideas. It must be labeled as AI and not presented as a therapist. |

## Main navigation

The bottom tab bar contains **Home**, **Create**, **Community**, **Rare Studio**, and **Profile**. Home is the default landing screen. Each tab uses a clear icon and short label, and the tab bar remains visually quiet so the selected mood action remains the dominant interaction.

## Key user flows

### Select a mood and start a Rare Moment

1. The user opens Home and sees the greeting plus “How are you feeling today?”
2. The user taps a mood chip such as Creative, Tired, or Just vibing.
3. The selected chip changes state with color and haptic feedback.
4. The Rare Moment card updates with a title, short explanation, duration, and activity steps.
5. The user taps **Start moment** and enters the focused detail view.
6. The user can mark the moment complete, save it, or return to Home.

### Start a creative activity

1. The user opens Create.
2. The user chooses Journal, Photo, Music, Collage, or Rare AI.
3. The app opens the corresponding focused flow or a clearly labeled coming-next state if the native capability is not yet implemented.
4. The user can save the idea locally and return to the Create hub.

### Discover a positive community circle

1. The user opens Community.
2. The user scans circle cards by topic and tone.
3. The user taps a circle to read its description and community prompt.
4. The user can save the circle or return to browse another topic.

## Visual system

| Token | Choice | Use |
|---|---|---|
| Background | `#FBF8F3` warm cream | Main screen canvas and calm reading areas |
| Surface | `#FFFFFF` | Cards and elevated content |
| Foreground | `#2B1D2F` deep plum | Primary type and headings |
| Muted | `#7E6F7D` mauve gray | Supporting copy and metadata |
| Primary | `#E96F61` soft coral | Main CTA, selected mood, active tab |
| Secondary accent | `#F5D7CF` blush | Mood backgrounds and gentle emphasis |
| Lavender accent | `#D9CDE7` | Creative and reflective content |
| Sage accent | `#D8E1D5` | Community and impact content |
| Border | `#EDE4E0` | Card outlines and dividers |

Typography should use strong, slightly expressive display headings paired with highly legible system body text. Rounded cards, restrained shadows, and a consistent 16–24 point spacing rhythm should create a first-party iOS feel without looking generic.

## Interaction principles

Every primary button must provide visible press feedback and, on native platforms, light haptics. Mood selection should update immediately. The initial experience should work without login, cloud storage, or external integrations. Any unavailable feature should have a clear path back to a working surface rather than a dead end.
