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

## Creature Quest

The Adventure game on the home screen. Students explore 8 areas, catch 100 faceless pixel creatures, buy items and beat 8 gym leaders. Every attack and capture is a question about this week's words, so it always uses the current list. Progress is saved in each student's browser and carries over from week to week; the **Save code** tab lets a student move their game to another computer.

- `creatures.js`: the 100 creature designs, drawn in code
- `quest.js`: the game
