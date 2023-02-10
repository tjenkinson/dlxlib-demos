import { AvailableDemo } from "types";
import { Thumbnail as SudokuThumbnail } from "demos/sudoku/thumbnail"
import { Thumbnail as PentominoesThumbnail } from "demos/pentominoes/thumbnail"
import { Thumbnail as NQueensThumbnail } from "demos/n-queens/thumbnail"
import { Thumbnail as TetraSticksThumbnail } from "demos/tetrasticks/thumbnail"
import { Thumbnail as AztecDiamondThumbnail } from "demos/aztec-diamond/thumbnail"
import { Thumbnail as RippleEffectThumbnail } from "demos/ripple-effect/thumbnail"
import { Thumbnail as FlowFreeThumbnail } from "demos/flow-free/thumbnail"
import { Thumbnail as KakuroThumbnail } from "demos/kakuro/thumbnail"
import { Thumbnail as NonogramThumbnail } from "demos/nonogram/thumbnail"
import { Thumbnail as CrosswordThumbnail } from "demos/crossword/thumbnail"
import { Thumbnail as PlaceholderThumbnail } from "demos/placeholder/thumbnail"

const demoNames = [
  "Sudoku",
  "Pentominoes",
  "Draughtboard Puzzle",
  "N Queens",
  "TetraSticks",
  "Aztec Diamond",
  "Ripple Effect",
  "Flow Free",
  "Kakuro",
  "Nonogram",
  "Crossword"
]

const thumbnailMap = new Map<string, React.FC>([
  ["sudoku", SudokuThumbnail],
  ["pentominoes", PentominoesThumbnail],
  ["n-queens", NQueensThumbnail],
  ["tetrasticks", TetraSticksThumbnail],
  ["aztec-diamond", AztecDiamondThumbnail],
  ["ripple-effect", RippleEffectThumbnail],
  ["flow-free", FlowFreeThumbnail],
  ["kakuro", KakuroThumbnail],
  ["nonogram", NonogramThumbnail],
  ["crossword", CrosswordThumbnail]
])

const hideBorderMap = new Map<string, boolean>([
  ["pentominoes", true],
  ["flow-free", true],
  ["tetrasticks", true],
  ["aztec-diamond", true]
])

const makeShortName = (name: string): string => name.toLowerCase().replace(/\s/g, "-")

export const availableDemos: AvailableDemo[] = demoNames
  .map(name => {
    const shortName = makeShortName(name)
    const hideBorder = hideBorderMap.get(shortName) ?? false
    return {
      name,
      shortName,
      Thumbnail: thumbnailMap.get(shortName) ?? PlaceholderThumbnail,
      hideBorder
    }
  })

export const lookupAvailableDemoByShortName = (shortName: string) => {
  return availableDemos.find(availableDemo => availableDemo.shortName === shortName)
}
