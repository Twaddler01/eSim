# Recent Updates
![README updated](https://Twaddler01.github.io/eSim/readme-date.svg)

# About
- eSim is a Christian-themed discover/gather/create simulation game coded in Javscript using the Phaser 3 framework.
- Strictly client-side (Node.js not utilized)
- URL: [Play eSim](https://Twaddler01.github.io/eSim/)

# Work In Progress
- Auto gather runs but needs work, along with "upgrades" sub tab.
- Need tab titles at top of viewport to better show user navigation.

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
08-24-2026
- Added basic auto gather functionality (WIP).
- Cleaned up StageUI and intregrated data functions.

08-22-2026
- Added sub tab options within main tabs.
- Fill color sat for thr current tab/sub tab selection.

08-21-2026
- UPDATE: DEBUG variable was added a while back in config.js to be automatically set to false (staying true/enabled on local) for GitHub pages to disable most debugging tools for better user experience. In other words, most debugging features won't be published -- only baaic error catching as per next note below.
- Fixed a case-sensitive issue with debug.js module showing as Debug.js on remote, resulting in an ES module error. Added basic error catching even outside of DEBUG variable (from Github pages workflow) to hopefully catch these errors in the future (in console.js).
- Finished reworking StageCard class ->
    - StageCard-gather section: Update done. Needs a level bonus status?
    - StageCard-create section: Update done. IDEA: updates to created item quantities from upgrades.
    - StageCard-discover section: Update done.
- Live updates and sorting. Direction is keeping it mostly live unless tabs change.

08-20-2026
- Card updates debugged to confirm a clean and live lock/unlock. Generally smooth with updates only.

08-19-2026
- Updated DebugButtons class.
- Updated StageCard: gather and create sectons.

08-18-2026
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