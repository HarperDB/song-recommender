<script setup>
import "./assets/base.css";

import { reactive, ref } from "vue";
import axios from "axios";

const isSetup = ref(true);
const song1 = ref("");
const song2 = ref("");
const song3 = ref("");
const songs = ref([false, false, false]);
const recommendations = reactive({ recommendations: [] });

async function songSearch(input, callback) {
  if (input.length < 4) return callback([]);
  const { data } = await axios({
    method: "get",
    url: "http://localhost:9936/song-recommender/songs",
    params: {
      q: input,
    },
  });
  const results = data
    .slice(0, 250)
    .map((d) => ({ index: d.index, value: `${d.song} by ${d.artist}` }));
  callback(results);
}

function handleSelect(v, i) {
  songs.value[i] = v.index;
}

async function recommend() {
  const { data } = await axios({
    method: "post",
    url: "http://localhost:9936/song-recommender/recommend",
    data: {
      songIdxs: songs.value,
    },
  });
  console.log("data", data);
  recommendations.recommendations = data;
  console.log("recommendations", recommendations);
}
</script>

<template>
  <main>
    <header class="header">
      <img
        alt="HarperDB logo"
        class="logo"
        src="./assets/harperdb.png"
        width="125"
        height="125"
      />

      <h1>HarperDB Song Recommender</h1>
    </header>
    <section class="primary">
      <div v-if="!isSetup" class="message">
        <p>To begin, click the setup button to populate the database.</p>
        <el-button type="primary">Setup</el-button>
      </div>
      <div v-if="isSetup" class="message">
        <p>
          Select three songs that you like, and then click the recommend button
          to see other songs that you may enjoy reading.
        </p>
        <div class="input-container">
          <el-autocomplete
            v-model="song1"
            :fetch-suggestions="songSearch"
            :trigger-on-focus="false"
            class="inline-input w-50"
            placeholder="Song 1"
            @select="handleSelect($event, 0)"
          />
          <el-autocomplete
            v-model="song2"
            :fetch-suggestions="songSearch"
            :trigger-on-focus="false"
            class="inline-input w-50"
            placeholder="Song 2"
            @select="handleSelect($event, 1)"
          />
          <el-autocomplete
            v-model="song3"
            :fetch-suggestions="songSearch"
            :trigger-on-focus="false"
            class="inline-input w-50"
            placeholder="Song 3"
            @select="handleSelect($event, 2)"
          />
        </div>
        <div style="margin-top: 25px; display: flex; justify-content: center">
          <el-button type="primary" @click="recommend" style="width: 50%"
            >Recommend</el-button
          >
        </div>
        <div style="overflow-y: auto; height: 200px">
          <div
            v-for="recommendation in recommendations.recommendations"
            :key="recommendation.isbn"
          >
            <p>{{ recommendation.song }} by {{ recommendation.artist }}</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style lang="scss" scoped>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;

  font-weight: normal;
}

header {
  display: flex;
  line-height: 1.5;
  align-items: center;
  padding-left: 25px;
  h1 {
    font-size: 18px;
    font-weight: bold;
    margin-left: 15px;
  }
  border-bottom: 1px solid black;
}

main {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  min-height: 100vh;
}

section.primary {
  flex-grow: 1;
  display: flex;
  justify-content: center;
}

.message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  p {
    font-size: 16px;
    font-weight: bold;
    margin: 15px;
  }
}
.input-container {
  width: 100%;
  display: flex;
  justify-content: space-around;
  margin: 50px 0;
  // input
}

a,
.green {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
  transition: 0.4s;
}
</style>
