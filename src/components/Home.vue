<template>
  <Frame>
    <Page actionBarHidden="true">
      <GridLayout background="#65ADF1" iosOverflowSafeArea="false">
        <StackLayout iosOverflowSafeArea="false" col="1" row="1">
          <StackLayout
            iosOverflowSafeArea="false"
            orientation="horizontal"
            v-for="(row, rowIndex) in board"
            :key="rowIndex"
          >
            <StackLayout
              iosOverflowSafeArea="false"
              v-for="pixel in row"
              :key="pixel.i + '-' + pixel.j"
              :class="{
                'tetris-pixel-blocked': pixel.isBlocked,
                'tetris-pixel-filled': pixel.filled,
              }"
              :width="pixelWidth"
              :height="pixelHeight"
              borderWidth=".1"
              borderColor="black"
            ></StackLayout>
          </StackLayout>
        </StackLayout>
        <GridLayout rows="*,2*,*" columns="*,*">
  <Button colSpan="2" @tap="upTap" />
  <Button row="1" col="0" @tap="leftTap" />
  <Button row="1" col="1" @tap="rightTap" />
  <Button colSpan="2" row="2" @tap="downTap" />
</GridLayout>
      </GridLayout>
    </Page>
  </Frame>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted } from "nativescript-vue";
import { Screen } from "@nativescript/core";
import blockTypes from "../blockTypes";
const widthCount = 10;
const heightCount = 20;

const pixelWidth = ref(10);
const pixelHeight = ref(10);

interface Pixel {
  i: number;
  j: number;
  isBlocked: boolean;
  filled: boolean;
}

const board = reactive([] as Pixel[][]);
const currentScore = ref<number>(0);
const startPosition = Math.floor(widthCount / 2) + widthCount * 2;
let position = ref(startPosition);
let rotation = ref(0);
let currentBlock = ref(null);
let nextBlock = ref(null);

let playerInterval: any;

const downTap = () => {
  if (moveIsAllowed(currentBlock.value, rotation.value, position.value + widthCount)) {
    position.value += widthCount;
    renderBlock(currentBlock.value, rotation.value, position.value);
  }
};
const upTap = () => {
  let r = rotation.value >= currentBlock.value.length - 1 ? 0 : rotation.value + 1;
  if (moveIsAllowed(currentBlock.value, r, position.value)) {
    rotation.value = r;
    renderBlock(currentBlock.value, rotation.value, position.value);
  }
};
const leftTap = () => {
  console.log(rotation.value);
  if (moveIsAllowed(currentBlock.value, rotation.value, position.value - 1)) {
    renderBlock(currentBlock.value, rotation.value, --position.value);
  }
};
const rightTap = () => {
  if (moveIsAllowed(currentBlock.value, rotation.value, position.value + 1)) {
    renderBlock(currentBlock.value, rotation.value, ++position.value);
  }
};

const clearBoard = () => {
  board.forEach((row) => {
    row.forEach((pixel) => {
      pixel.filled = false;
    });
  });
};

const renderBlock = (block: any, rotation: number, position: number) => {
  clearBoard();
  block[rotation](position).forEach((index) => {
    const row = Math.floor(index / widthCount);
    const col = index % widthCount;
    board[row][col].filled = true;
  });
};

const freezeBlock = (block, rotation, position) => {
  clearBoard();
  block[rotation](position).forEach((index) => {
    const row = Math.floor(index / widthCount);
    const col = index % widthCount;
    board[row][col].isBlocked = true;
  });
};

const moveIsAllowed = (block, rotation, position) => {
  return block[rotation](position).every((index) => {
    const row = Math.floor(index / widthCount);
    const col = index % widthCount;
    return !board[row][col].isBlocked;
  });
};

const SetScore = () => {
  // let gameNode = document.querySelector(".tetris-game");
  // gameNode.removeChild(document.querySelector(".tetris-score"));
  // let scoreNode = document.createElement("div");
  // scoreNode.className = "tetris-score";
  // scoreNode.innerHTML = currentScore;
  // gameNode.appendChild(scoreNode);
};

const RemoveFullLines = () => {
  // TODO PORT THE COMMENTED OUT CODE BELOW
  // let pixelNodes = document.querySelectorAll(".tetris-pixel");
  // let numberOfLinesRemoved = 0;
  // for (var i = height - 2; i > 0; i--) {
  //   let positionAtRowStart = i * width + 1;
  //   let positionAtRowEnd = positionAtRowStart + width - 2;
  //   let fullPixel = [positionAtRowStart - 1, positionAtRowEnd];
  //   for (var j = positionAtRowStart; j < positionAtRowEnd; j++) {
  //     let node = pixelNodes[j];
  //     if (!hasClass(node, "pixel-stop")) break;
  //     fullPixel.push(j);
  //   }
  //   if (fullPixel.length === width) {
  //     fullPixel.forEach((p) => {
  //       let node = pixelNodes[p];
  //       node.parentNode.removeChild(node);
  //     });
  //     numberOfLinesRemoved++;
  //   }
  // }
  // currentScore += { 0: 0, 1: 40, 2: 100, 3: 300, 4: 1200 }[numberOfLinesRemoved];
  // SetScore();

  for (var i = heightCount - 2; i > 0; i--) {
    let positionAtRowStart = i * widthCount + 1;
    let positionAtRowEnd = positionAtRowStart + widthCount - 2;
    let fullPixel = [positionAtRowStart - 1, positionAtRowEnd];
    for (
      var pixelIndex = positionAtRowStart;
      pixelIndex < positionAtRowEnd;
      pixelIndex++
    ) {
      let pixel = board[i][pixelIndex];
      // if (pixel.isBlocked) break;
      // fullPixel.push(j);
    }
    if (fullPixel.length === widthCount) {
      // fullPixel.forEach((p) => {
      //   let node = pixelNodes[p];
      //   node.parentNode.removeChild(node);
      // });
      // numberOfLinesRemoved++;
    }
  }
};

onMounted(() => {
  let unsafeAreaHeight = 100;
  pixelWidth.value = Math.floor(Screen.mainScreen.widthDIPs) / widthCount;
  pixelHeight.value =
    Math.floor(Screen.mainScreen.heightDIPs - unsafeAreaHeight) / heightCount;
  playerInterval = setInterval(() => {
    currentBlock.value =
      currentBlock.value ||
      blockTypes(widthCount)[Math.floor(Math.random() * blockTypes(widthCount).length)];
    nextBlock.value =
      nextBlock.value ||
      blockTypes(widthCount)[Math.floor(Math.random() * blockTypes(widthCount).length)];
    if (moveIsAllowed(currentBlock.value, rotation.value, position.value + widthCount)) {
      position.value += widthCount;
      renderBlock(currentBlock.value, rotation.value, position.value);
    } else {
      if (!moveIsAllowed(nextBlock.value, 0, startPosition)) {
        clearInterval(playerInterval);
        freezeBlock(currentBlock.value, rotation.value, position.value);
      } else {
        freezeBlock(currentBlock.value, rotation.value, position.value);
        position.value = startPosition;
        rotation.value = 0;
        currentBlock.value = nextBlock.value;
        nextBlock.value = blockTypes(widthCount)[
          Math.floor(Math.random() * blockTypes(widthCount).length)
        ];
        RemoveFullLines();
      }
    }
  }, 1000);
  for (let i = 0; i < heightCount; i++) {
    let pixels = [] as Pixel[];
    for (let j = 0; j < widthCount; j++) {
      pixels.push({
        i,
        j,
        isBlocked: i === 0 || i === heightCount - 1 || j === 0 || j === widthCount - 1,
        filled: false,
      } as Pixel);
    }
    board.push(pixels);
  }
});

onUnmounted(() => {
  console.log("unmounted");
  clearInterval(playerInterval);
});
</script>

<style>
.tetris-pixel-blocked {
  background: white;
}

.tetris-pixel-filled {
  background: white;
}
</style>
