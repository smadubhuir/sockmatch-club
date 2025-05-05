// lib/mobilenet.js
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

let model;

export async function loadMobilenet() {
  if (!model) {
    model = await mobilenet.load();
  }
  return model;
}

export async function getEmbeddingFromFile(file) {
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageBitmap, 0, 0, 224, 224);

  const imageTensor = tf.browser.fromPixels(canvas);
  const model = await loadMobilenet();
  const embedding = model.infer(imageTensor.expandDims(0), true);
  const array = await embedding.flatten().array();

  tf.dispose([imageTensor, embedding]);
  return array;
}

