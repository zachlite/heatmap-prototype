const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const alphabet = "abcdefghijklmnopqrstuvwxyz";

function getFakeKey() {
  let key = "";
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * 16) // limit keyspace to 16^3 unique values
    key += alphabet[idx];
  }
  return key;
}

function getFakeCells() {
  let cells = [];
  for (let i = 0; i < 1000; i++) {
    cells.push(Math.max(.8, Math.random()).toPrecision(2));
  }
  return cells;
}

function getFakeKeys() {
  let keys = [];
  for (let i = 0; i < 1000; i++) {
    keys.push(getFakeKey());
  }
  return keys;
}

function get6HourChunk() {
  // 4 samples per hour
  // 4 * 6 = 24 samples
  let buckets = [];
  for (let i = 0; i < 24; i++) {
    const cells = getFakeCells();
    const keys = getFakeKeys();
    keys.sort();
    buckets.push({ timestamp: i, cells, keys });
  }
  return buckets;
}

app.get("/", (req, res) => {
  const buckets = get6HourChunk();
  res.send(buckets);
});

app.listen(2793, () => console.log("listening"));
