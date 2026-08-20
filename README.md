# Recent Updates
![README updated](https://Twaddler01.github.io/eSim/readme-date.svg)

# About
- eSim is a Christian-themed discover/gather/create simulation game coded in Javscript using the Phaser 3 framework.
- Strictly client-side (Node.js not utilized)
- URL: [Play eSim](https://Twaddler01.github.io/eSim/)

# Work In Progress
- Card updates meed to be debugged to confirm a clean and live add/remove. Generally smooth within same card updates.
- Reworking StageCard class ->
    - StageCard-gather section: Update done. Needs a level bonus status?
    - StageCard-create section: Update done. IDEA: updates to created item quantities from upgrades.
    - StageCard-discover section: Update needed. Only live updates are neccesary for add/remove/unlock cards.

# Future Updates / Ideas
- Add sub tab options within each main tab.
- Add an auto-gather/creator - e.g. "element collector", etc.
- More structural content.
- More dynamic upgrades, including caps for rate/max, etc.
- Game theme(s): Designing game theme around a "Creationism" simulation-type concept, acting as a wise man perceiving God throughout the ages. Starting from the day of creation, to all the way through eternity.
- Organized stages: A "creation stage" will be first. Many more stages (scenes) are planned.
### Creation Stage
- An "In the beginning..." sequence/video when starting a new game.
- Focused on darkness and light elements: black holes, light photons, etc.

# Completed Updates
09-19-2026
- Updated DebugButtons class.
- Updated StageCard: gather and create sectons.

09-18-2026
- Create tab has been updated, still needs the click action.
- Updated Tracker to display each objective unlocks (items/new objectives).

Old
- Card refreshes are now structured to update live (instead of rebuilding) for cards that are added to, modified, or removed from the currently viewed tab.
- Tracker work is done for now.
- Tracker was temporarily on hold until Discover tab was fully updated with improved structure.
- Updated README.md to specifically indicate last readme update date.
- Objectives completed in discover tab will now move to an "archived state" to be displayed differently and will no longer receive amount updates. 
- Added an update to StageCard and StageViewport to dynamically resize cards (live) whenever upgrades or any card size changes are necessary.
- Master discoveries are now parent objectives.
- Added ScrollBox class integration for most scrollable areas.
- Updated all fonts to "Arial" using "addText" global function to keep font family consistent with client browser settings and ensure precise Phaser text alignment/size. A different global font may be used in future updates.