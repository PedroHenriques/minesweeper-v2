[![Build Status](https://travis-ci.org/PedroHenriques/minesweeper-v2.svg?branch=master)](https://travis-ci.org/PedroHenriques/minesweeper-v2)

# MineSweeper

Play the classic game of Minesweeper directly on your browser.
[Click here to play](http://www.pedrojhenriques.com/games/minesweeper-v2/ "Play Now!")

## How to play

Your goal is to reveal all the tiles that don't have a mine.
Revealed tiles that are adjacent to mines will have a number. This number indicates how many mines are in adjacent tiles.

- left mouse button: reveals a tile
- right mouse button: adds/removes a flag from a tile, preventing it from being revealed
- left + right mouse buttons (on a revealed tile): reveales all adjacent tiles, only if enough flags are placed. This function prevents acidental mine hits.

## Future Updates

- add more game modes, each introducing twists to the classic formula
- add a backend allowing for saving a game in progress, leaderboards, etc.

## Other Versions

- A version created using only React is available at [https://github.com/PedroHenriques/minesweeper](https://github.com/PedroHenriques/minesweeper).