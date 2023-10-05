<template>
  <Frame>
    <Page actionBarHidden="true">
      <GridLayout background="#65ADF1" iosOverflowSafeArea="false" @tap="rotateBlock">
        <StackLayout iosOverflowSafeArea="false" col="1" row="1">
          <Label :text="accData" />
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
      </GridLayout>
    </Page>
  </Frame>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted } from "nativescript-vue";
import {
  startAccelerometerUpdates,
  stopAccelerometerUpdates,
} from "@triniwiz/nativescript-accelerometer";
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
  filled: boolean; // THIS IS NOT USED
}

const board = reactive([] as Pixel[][]);
const startPosition = Math.floor(widthCount / 2) + widthCount * 2;
const position = ref(startPosition);
const rotation = ref(0);
const currentBlock = ref(null);
const nextBlock = ref(null);
const accData = ref("");
let playerInterval: any;

const downTap = () => {
  if (moveIsAllowed(currentBlock.value, rotation.value, position.value + widthCount)) {
    position.value += widthCount;
    renderBlock(currentBlock.value, rotation.value, position.value);
  }
};
const rotateBlock = () => {
  let r = rotation.value >= currentBlock.value.length - 1 ? 0 : rotation.value + 1;
  if (moveIsAllowed(currentBlock.value, r, position.value)) {
    rotation.value = r;
    renderBlock(currentBlock.value, rotation.value, position.value);
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
  if (!block || typeof block[rotation] !== "function") return false;

  const indices = block[rotation](position);
  if (!Array.isArray(indices)) return false;

  return indices.every((index) => {
    if (typeof index !== "number") return false;

    const row = Math.floor(index / widthCount);
    const col = index % widthCount;

    return board[row] && board[row][col] && !board[row][col].isBlocked;
  });
};

const RemoveFullLines = () => {
  board.forEach((row) => {
    if (row.every((pixel) => pixel.filled)) {
      board.splice(board.indexOf(row), 1);
    }
  });
};

onMounted(() => {
  startAccelerometerUpdates(
    (data) => {
      const sensitivity = 0.5;

      let x = JSON.parse(JSON.stringify(data.x));
      if (x > sensitivity) {
        x = sensitivity;
      } else if (x < -sensitivity) {
        x = -sensitivity;
      }
      let normalizedX = Math.floor(((x + sensitivity) / (sensitivity * 2)) * widthCount);
      accData.value = `Current position: ${position.value}, X: ${normalizedX}`;
      const tempPosition = position.value - (position.value % widthCount) + normalizedX;
      if (moveIsAllowed(currentBlock.value, rotation.value, tempPosition)) {
        renderBlock(currentBlock.value, rotation.value, tempPosition);
        position.value = tempPosition;
      }
    },
    {
      sensorDelay: "game",
    }
  );

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

    // Move block down if possible
    if (moveIsAllowed(currentBlock.value, rotation.value, position.value + widthCount)) {
      position.value += widthCount;
      renderBlock(currentBlock.value, rotation.value, position.value);
    } else {
      // If not possible and block is at the top, game over
      if (!moveIsAllowed(nextBlock.value, 0, startPosition)) {
        clearInterval(playerInterval);
        freezeBlock(currentBlock.value, rotation.value, position.value);
      } else {
        // If not possible and block is not at the top, freeze block and create new block
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
  stopAccelerometerUpdates();
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
