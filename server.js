// server.js
const express = require("express");
const cors = require("cors");
const path = require("path")
const fortunes = require("./fortune");

const app = express();
const PORT = process.env.PORT || 3000;


// CORS許可
app.use(cors());

// 静的ファイルを配る
app.use(express.static(path.join(__dirname)));

// 動作確認
app.get("/", (req, res) => {
  res.send("サーバー動いてます！");
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const zodiacSigns=[
  "牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座",
  "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"
];

let monthlyRanking = {};

function generateMonthlyRanking() {
  const month = new Date().getMonth() + 1;
  if(!monthlyRanking[month]) {
    monthlyRanking[month] = [...zodiacSigns]
      .sort(() => Math.random() - 0.5)
      .map((sign, index) => ({
        rank: index + 1,
        sign
      }));
  }
  return monthlyRanking[month];
}

app.get("/ranking", (req, res) => {
  const ranking = generateMonthlyRanking();
  res.json(ranking);
});

function getRandomFortune(category, seedKey){
  const items = fortunes[category];
  const seed = Array.from(seedKey).reduce((a, c) => a + c.charCodeAt(0), 0);
  // const randomIndex = Math.floor(Math.random() * items.length);
  const index = seed % items.length;
  return items[index];
}

app.get("/result/:sign", (req, res) => {
  const sign = req.params.sign;

  const ranking = generateMonthlyRanking();
  const zodiacRank = ranking.find(r => r.sign === sign);

  const month = new Date().getMonth() + 1;
  const seedKey = `${month}-${sign}`;

  if (!zodiacRank) {
    return res.status(404).json({ error: "星座が見つかりません" });
  }

  const result = {
    sign,
    rank: zodiacRank.rank,
    general: getRandomFortune("general", seedKey + "-general"),
    love: getRandomFortune("love", seedKey + "-love"),
    money: getRandomFortune("money", seedKey + "-money"),
    work: getRandomFortune("work", seedKey + "-work"),
    color:["赤","青","黄","緑","紫","オレンジ","ピンク","黒","白","水色","茶","金"]
    [seedKey.charCodeAt(0) % 12]  // 月ごとに固定
  };

  res.json(result);
});
