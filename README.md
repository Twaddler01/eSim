# Recent Updates
![README updated](https://Twaddler01.github.io/eSim/readme-date.svg)

# About
- eSim is a Christian-themed discover/gather/create simulation game coded in Javscript using the Phaser 3 framework.
- Strictly client-side (Node.js not utilized)
- URL: [Play eSim](https://Twaddler01.github.io/eSim/)

# Work In Progress
- Make card refreshes update live (instead of rebuilding) for any cards that are added to, modified, or removed from the currently viewed tab.
- Clean up new discover tab layout and its StageCard relationship.

# Future Updates / Ideas
- Add an auto-gather/creator - e.g. "element collector", etc.
- More structural content.
- More dynamic upgrades, including caps for rate/max, etc.
- Game theme(s): Designing game theme around a "Creationism" simulation-type concept, acting as a wise man perceiving God throughout the ages. Starting from the day of creation, to all the way through eternity.
- Organized stages: A "creation stage" will be first. Many more stages (scenes) are planned.
### Creation Stage
- An "In the beginning..." sequence/video when starting a new game.
- Focused on darkness and light elements: black holes, light photons, etc.

# Completed Updates
- Tracker work is done for now.
- Tracker was temporarily on hold until Discover tab was fully updated with improved structure.
- Updated README.md to specifically indicate last readme update date.
- Objectives completed in discover tab will now move to an "archived state" to be displayed differently and will no longer receive amount updates. 
- Added an update to StageCard and StageViewport to dynamically resize cards (live) whenever upgrades or any card size changes are necessary.
- Master discoveries are now parent objectives.
- Added ScrollBox class integration for most scrollable areas.
- Updated all fonts to "Arial" using "addText" global function to keep font family consistent with client browser settings and ensure precise Phaser text alignment/size. A different global font may be used in future updates.