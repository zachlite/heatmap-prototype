const CanvasHeight = 4096;
const CanvasWidth = 768;
const bucketWidth = 32; // 24 * 32 = 768. convenient math
const COLD = {r: 0, g: 0, b: 0} // black

function setCell(pixels, sampleIdx, keyIdx, color) {
  const startIndex = keyIdx * CanvasWidth * 4 + sampleIdx * bucketWidth * 4;
  const endIndex = startIndex + bucketWidth * 4 - 1;

  for (let pidx = startIndex; pidx <= endIndex; pidx += 4) {
    pixels[pidx] = color.r * 255; // red
    pixels[pidx + 1] = color.g * 255; // green
    pixels[pidx + 2] = color.b * 255; // blue
    pixels[pidx + 3] = 255; // alpha
  }
}

function draw(ctx, samples, keyspace) {
  // const nBuckets = 1000;
  const nSamples = 24; // 6 hours
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // for each sample
  for (let i = 0; i < nSamples; i++) {
    // for each key in the keyspace
    let keyIdx = 0;
    let bucketIdx = 0;
    for (let key of keyspace) {

      if (samples[i].keys.has(key)) {
        // draw with qps
        const brightness = parseFloat(samples[i].cells[bucketIdx]);
        setCell(pixels, i, keyIdx, {r: 1, g: 0, b: 0});
        bucketIdx++;
      } else {
        setCell(pixels, i, keyIdx, COLD);
      }
      keyIdx++;
    }
  }

  ctx.putImageData(imageData, 0, 0);

}



// implement ability to show heat for ranges not contained in a sample
// for every sample received, update the set of all keys
// when rendering a sample, refer to the set of all keys to know if a bucket should be cold

window.onload = async () => {
  const canvas = document.getElementById("canvas");
  canvas.width = CanvasWidth;
  canvas.height = CanvasHeight;

  const ctx = canvas.getContext("2d");

  const samples = await fetch("http://localhost:2793").then((res) =>
    res.json()
  );

  const keytimestart = performance.now()
  const keyspace = new Set();
  for (const sample of samples) {
    for (const key of sample.keys) {
      keyspace.add(key);
    }

    // convert list of keys into a dictionary for later O(1) lookups.
    sample.keys = new Set(sample.keys);
  }

  console.log(keyspace)
  console.log(performance.now() - keytimestart)

  const start = performance.now();

  for (let i = 0; i < 56; i++)  {
    // console.log("drawing")
    draw(ctx, samples, keyspace);
  }

  
  console.log(performance.now() - start);
};
