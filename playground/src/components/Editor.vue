<script setup>
import { ref, onMounted, computed } from "vue";
import { useStorage } from "@vueuse/core";
import { Pane, Splitpanes } from "splitpanes";
import prettier from "prettier/standalone";
import parserCSS from "prettier/parser-postcss";

import { transform } from "../../../src/index";

import CodeMirror from "./CodeMirror.vue";

const loading = ref(true);
const input = ref(`p {
  font-size: 1rem;
}
footer {
    background:black;
    & p {
        font-size: 0.75rem;
      }
}`);
const output = computed(() => transform(input.value));
const isPrettify = ref(false);
const panel = ref(null);

const panelSizes = useStorage(
  "nested-css-to-flat-panel-sizes",
  [50, 50],
  localStorage,
  {
    listenToStorageChanges: false,
  }
);

function handleResize(event) {
  panelSizes.value = event.map(({ size }) => size);
}

const formatted = computed(() => {
  if (!isPrettify.value) return output.value || "";
  try {
    return prettier.format(output.value || "", {
      parser: "css",
      plugins: [parserCSS],
    });
  } catch (e) {
    console.error(e);
    return `/* Error on prettifying: ${e.message} */\n${output.value || ""}`;
  }
});

onMounted(() => {
  // prevent init transition
  setTimeout(() => {
    loading.value = false;
  }, 200);
});
</script>

<template>
  <Splitpanes ref="panel" :class="{ loading }" @resize="handleResize">
    <Pane :min="0" :max="100" :size="panelSizes[0]">
      <h2 class="title">Nested CSS</h2>
      <CodeMirror v-model="input" mode="sass" class="scrolls" />
    </Pane>
    <Pane :min="0" :max="100" :size="panelSizes[1]">
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          color: '#9ca3afcc',
          backgroundColor: '#222',
        }"
      >
        <h2 class="title">Output CSS</h2>
        <div flex="" gap-2="" flex-auto="">
          <label
            ><input type="checkbox" v-model="isPrettify" /> Prettify
          </label>
        </div>
      </div>
      <CodeMirror
        v-model="formatted"
        mode="css"
        class="scrolls"
        :read-only="true"
      />
    </Pane>
  </Splitpanes>
</template>

<style>
.splitpanes {
  height: 100%;
}
.splitpanes.loading .splitpanes__pane {
  transition: none !important;
}
.splitpanes__pane {
  height: 100%;
}
.splitpanes .title {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
  padding: 0.5rem;
  color: #9ca3afcc;
  background: #222;
  border-bottom: 1px solid #00000020;
  user-select: none;
}
.splitpanes__splitter {
  width: 5px;
  background: #444;
}
.scrolls {
  height: 100%;
  overflow: auto;
}
</style>
