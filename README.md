# Word Workshop

Vocabulary practice games for 3rd and 4th grade. Students open the site, pick their grade once, and play with this week's words.

## Changing the weekly words

Each grade has its own words file:

- [words/3rd-grade.txt](words/3rd-grade.txt)
- [words/4th-grade.txt](words/4th-grade.txt)

The easiest way: open the site, click **Teacher**, upload the PDF, then follow the steps on that screen (copy, open the file on GitHub, paste, Commit changes).

Or edit the file directly on GitHub: one word per line, written as `word - meaning`. The `Title:` line is the list name students see. Students get the new words a few minutes after you commit.

## Files

- `index.html`, `app.css`, `app.js`: the site
- `words/`: the weekly word lists

## Creature Quest 2

The Adventure game on the home screen. Students sail to the Glimmer Isles: 8 new towns (each with its own layout), 100 new creatures and 8 new gym leaders. The creatures are magical objects (pots, lanterns, kites, crystals, gears and more), never animals or people, so none of them have faces. It has its own save, so the first game's save is never touched; players who played the first game get a welcome gift of coins and Super Orbs.

- `creatures2.js`: the 100 creature designs, drawn in code
- `quest2.js`: the game
- `art/cq2/`: optional pictures for the creatures. List a checked, face-free picture in `art/cq2/manifest.js` and the game uses it instead of the code drawing.

## Creature Quest Classic

The first game, still on the home screen under Creature Quest 2. Students explore 8 areas, catch 100 faceless pixel creatures, buy items and beat 8 gym leaders. Every attack and capture is a question about this week's words, so it always uses the current list. Progress is saved in each student's browser and carries over from week to week; the **Save code** tab lets a student move their game to another computer.

- `creatures.js`: the 100 creature designs, drawn in code
- `quest.js`: the game
