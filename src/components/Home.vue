<template>
  <Frame>
    <Page actionBarHidden="true">
      <GridLayout background="#65ADF1" @tap="rotateBlock" @swipe="swipe">
        <StackLayout :opacity="isPlaying ? 1: .2" verticalAlignment="center" col="1" row="1">
          <StackLayout
            orientation="horizontal"
            v-for="(row, rowIndex) in board"
            :key="rowIndex"
          >
            <ContentView
              :width="pixelWidth"
              :height="pixelHeight"
              v-for="(pixel, i) in row"
              :key="i + '-' + pixel.isBlock + '-' + pixel.isLocked"
            >
              <SVGView
                :key="i + '-' + pixel.isBlock + '-' + pixel.isLocked"
                v-if="pixel.isLocked || pixel.isBlock"
                :opacity="pixel.isBlock ? 1 : 0.5"
                :src="`~/assets/ns-logo.svg`"
                :width="pixelWidth"
                :height="pixelHeight"
              />
            </ContentView>
          </StackLayout>
        </StackLayout>
        <GridLayout rows="auto" horizontalAlignment="center">
          <Label
            v-if="isPlaying"
            :text="highscore"
            textWrap="true"
            verticalAlignment="center"
            fontWeight="bold"
            textAlignment="center"
            color="white"
            padding="10"
            fontSize="20"
            borderRadius="0 0 20 20"
          />
          <StackLayout v-if="!isPlaying" height="100%" verticalAlignment="center">
            <Label
              v-if="playCount > 0"
              text="Your score"
              textWrap="true"
              verticalAlignment="center"
              textAlignment="center"
              color="white"
            />
            <Label
              :text="playCount > 0 ? highscore : 'Are you ready?'"
              textWrap="true"
              verticalAlignment="center"
              fontWeight="bold"
              textAlignment="center"
              color="white"
              padding="20"
              fontSize="50"
              borderRadius="0 0 20 20"
              :marginBottom="playCount > 0 ? 30 : 80"
            />

            <Label
              v-if="playCount > 0"
              :text="highscoreComment"
              textWrap="true"
              verticalAlignment="center"
              fontWeight="bold"
              textAlignment="center"
              color="white"
              padding="20"
              fontSize="30"
              borderRadius="0 0 20 20"
              marginBottom="50"
            />
            <Button
              padding="20"
              borderRadius="10"
              width="90%"
              fontSize="30"
              fontWeight="bold"
              background="white"
              color="#65ADF1"
              :text="playCount === 0 ? 'Play' : 'Play again'"
              @tap="newGame"
            />
            <Label
              v-if="playCount > 0"
              marginTop="10"
              :text="playCount + (playCount === 1 ? ' game' : ' games') + ' played'"
              textWrap="true"
              verticalAlignment="center"
              textAlignment="center"
              color="white"
              padding="20"
              fontSize="20"
            />
          </StackLayout>
        </GridLayout>
      </GridLayout>
    </Page>
  </Frame>
</template>
<script lang="ts" setup>
import { ref, computed, reactive, onMounted, onUnmounted } from "nativescript-vue";
// import {
//   startAccelerometerUpdates,
//   stopAccelerometerUpdates,
// } from "@triniwiz/nativescript-accelerometer";
import { Screen, SwipeGestureEventData, SwipeDirection } from "@nativescript/core";
import { Haptics, HapticImpactType } from "@nativescript/haptics";
import blockTypes from "../blockTypes";
import throttle from "../ts-throttle";

const widthCount = 12;
const heightCount = 18;
const startPosition = Math.floor(widthCount / 2) + widthCount * 2;
let playerInterval;

const pixelWidth = ref(0);
const pixelHeight = ref(0);
const playCount = ref(0);
const isPlaying = ref(false);
const position = ref(startPosition);
const rotation = ref(0);
const currentBlock = ref(null);
const nextBlock = ref(null);
const highscore = ref(0);
const board = reactive(
  [] as {
    isBlock: boolean;
    isLocked: boolean;
  }[][]
);

const rotateBlock = () => {
  if (!currentBlock.value) return;
  let r = rotation.value >= currentBlock.value.length - 1 ? 0 : rotation.value + 1;
  if (moveIsAllowed(currentBlock.value, r, position.value)) {
    rotation.value = r;
    renderBlock(currentBlock.value, rotation.value, position.value);
  }
};

const swipe = (event: SwipeGestureEventData) => {
  if (event.direction === SwipeDirection.down) {
    // Move the block all the way down
    while (
      moveIsAllowed(currentBlock.value, rotation.value, position.value + widthCount)
    ) {
      position.value += widthCount;
      renderBlock(currentBlock.value, rotation.value, position.value);
    }
  } else if (event.direction === SwipeDirection.left) {
    if (moveIsAllowed(currentBlock.value, rotation.value, position.value - 1)) {
      position.value -= 1;
      renderBlock(currentBlock.value, rotation.value, position.value);
    }
  } else if (event.direction === SwipeDirection.right) {
    if (moveIsAllowed(currentBlock.value, rotation.value, position.value + 1)) {
      position.value += 1;
      renderBlock(currentBlock.value, rotation.value, position.value);
    }
  } else if (event.direction === SwipeDirection.up) {
    rotateBlock();
  }
};

const clearBoard = () => {
  for (let rowIndex = 0; rowIndex < heightCount; rowIndex++) {
    board[rowIndex] = (
      board[rowIndex] || new Array(widthCount).fill({ isLocked: false })
    ).map((cell) => ({ isLocked: cell.isLocked, isBlock: false }));
  }
};

const renderBlock = (block: any, rotation: number, position: number) => {
  if (typeof block?.[rotation] !== "function" || isNaN(position)) return;
  clearBoard();
  block[rotation](position).forEach((index: number) => {
    const row = Math.floor(index / widthCount);
    const col = index % widthCount;
    if (board[row]?.[col]) board[row][col].isBlock = true;
  });
};

const lockBlock = (block: any, rotation: number, position: number) => {
  if (typeof block?.[rotation] !== "function" || isNaN(position)) return;
  clearBoard();
  block[rotation](position).forEach((index: number) => {
    const row = Math.floor(index / widthCount);
    const col = index % widthCount;
    if (board[row]?.[col]) board[row][col].isLocked = true;
  });
};

const throttledHaptic = throttle(() => {
  Haptics.impact(HapticImpactType.HEAVY);
}, 500);

const moveIsAllowed = (block, rotation, position) => {
  if (!block || typeof block[rotation] !== "function") return false;
  const indices = block[rotation](position);
  if (!Array.isArray(indices)) return false;
  return indices.every((index) => {
    if (typeof index !== "number") return false;
    const row = Math.floor(index / widthCount);
    const col = index % widthCount;
    if (!board[row] || !board[row][col]) return false;
    if (board[row][col].isLocked) {
      throttledHaptic();
      return false;
    }
    return true;
  });
};

const removeFullLines = () => {
  const lockedRowIndices: number[] = [];

  // Check rows (excluding the first and last because they are walls) for full rows
  for (let i = 1; i < board.length - 1; i++) {
    if (board[i].every((cell) => cell.isLocked)) {
      lockedRowIndices.push(i);
    }
  }

  if (lockedRowIndices.length) {
    const createEmptyRow = () => {
      return [
        { isBlock: false, isLocked: true },
        ...Array(widthCount - 2).fill({ isBlock: false, isLocked: false }),
        { isBlock: false, isLocked: true },
      ];
    };
    // Remove full rows and add add a empty row at the top
    // after the first row because it's a wall
    for (const index of lockedRowIndices) {
      board.splice(index, 1);
      board.splice(1, 0, createEmptyRow());
    }
  }

  const scoreMap = { 0: 0, 1: 40, 2: 100, 3: 300, 4: 1200 };
  highscore.value += scoreMap[lockedRowIndices.length]; // Assuming you want to store the number of locked rows
};

const highscoreComment = computed(() => {
  // The comments are more fun if you don't read the code below 😅
  // These are made by ChatGPT, so don't take them too seriously
  if (highscore.value < 40)
    return "Did you even play? 😅 Try again!";
  if (highscore.value >= 40 && highscore.value < 500)
    return "I've seen snails move faster... and stack better! 🐌";
  if (highscore.value >= 500 && highscore.value < 1000)
    return "Cute score. You're just warming up, right? 😜";
  if (highscore.value >= 1000 && highscore.value < 2000)
    return "Alright, I see some potential! But don't get cocky. 😉";
  if (highscore.value >= 2000 && highscore.value < 3000)
    return "So close to the big leagues! Push harder! 💪";
  if (highscore.value >= 3000 && highscore.value < 4000)
    return "Impressive! You've got Tetris skills! 🎮";
  if (highscore.value >= 4000)
    return "Absolute legend! 🏆 But... can you beat this score again? 🤔";
});

const newGame = () => {
  isPlaying.value = true;
  highscore.value = 0;
  position.value = startPosition;
  rotation.value = 0;
  currentBlock.value = null;
  nextBlock.value = null;

  if (board.length) board.splice(0, board.length);

  for (let i = 0; i < heightCount; i++) {
    let pixels = [];
    for (let j = 0; j < widthCount; j++) {
      pixels.push({
        isBlock: false,
        // Lock the walls around the board
        isLocked: i === 0 || i === heightCount - 1 || j === 0 || j === widthCount - 1,
      });
    }
    board.push(pixels);
  }
  if (playerInterval) clearInterval(playerInterval);

  playerInterval = setInterval(() => {
    currentBlock.value =
      currentBlock.value ||
      blockTypes(widthCount)[Math.floor(Math.random() * blockTypes(widthCount).length)];
    nextBlock.value = nextBlock.value || blockTypes(widthCount)[6]; //[Math.floor(Math.random() * blockTypes(widthCount).length)];

    // Move block down if possible
    if (moveIsAllowed(currentBlock.value, rotation.value, position.value + widthCount)) {
      position.value += widthCount;
      renderBlock(currentBlock.value, rotation.value, position.value);
    } else {
      // If not possible and block is at the top, game over
      if (!moveIsAllowed(nextBlock.value, 0, startPosition)) {
        clearInterval(playerInterval);
        playerInterval = null;
        lockBlock(currentBlock.value, rotation.value, position.value);
        playCount.value++;
        isPlaying.value = false;
      } else {
        // If not possible and block is not at the top, lock block and create new block
        lockBlock(currentBlock.value, rotation.value, position.value);
        position.value = startPosition;
        rotation.value = 0;

        currentBlock.value = nextBlock.value;
        nextBlock.value = blockTypes(widthCount)[
          Math.floor(Math.random() * blockTypes(widthCount).length)
        ];
        removeFullLines();
      }
    }
  }, 1000);
};

onMounted(() => {
  pixelWidth.value = Math.floor(Screen.mainScreen.widthDIPs) / widthCount;
  pixelHeight.value = pixelWidth.value;

  // const throttledXMovement = throttle((x) => {
  //   const sensitivity = 0.6;
  //   let tempX = JSON.parse(JSON.stringify(x));
  //   if (tempX > sensitivity) {
  //     tempX = sensitivity;
  //   } else if (tempX < -sensitivity) {
  //     tempX = -sensitivity;
  //   }
  //   let normalizedX = Math.floor(
  //     ((tempX + sensitivity) / (sensitivity * 2)) * widthCount
  //   );
  //   const tempPosition = position.value - (position.value % widthCount) + normalizedX;
  //   if (moveIsAllowed(currentBlock.value, rotation.value, tempPosition)) {
  //     renderBlock(currentBlock.value, rotation.value, tempPosition);
  //     position.value = tempPosition;
  //   }
  // }, 100);

  // startAccelerometerUpdates(
  //   (data) => {
  //     // throttledXMovement(data.x); // Use the throttled function
  //   },
  //   {
  //     sensorDelay: "game",
  //   }
  // );
});

onUnmounted(() => {
  // stopAccelerometerUpdates();
  if (playerInterval) clearInterval(playerInterval);
});
</script>
