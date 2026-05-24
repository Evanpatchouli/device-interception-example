import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const data = require("../data/cs2-acclerate.json");

function calculateAverage(data) {
  // 计算每个对象的 time / speed 值
  const ratios = data.map(item => item.speed / item.time);

  // 去掉最高和最低的值
  const maxRatio = Math.max(...ratios);
  const minRatio = Math.min(...ratios);
  const filteredRatios = ratios.filter(ratio => ratio !== maxRatio && ratio !== minRatio);

  // 计算剩余值的平均值
  const sum = filteredRatios.reduce((acc, ratio) => acc + ratio, 0);
  const average = sum / filteredRatios.length;

  return average;
}


console.log(calculateAverage(data));
