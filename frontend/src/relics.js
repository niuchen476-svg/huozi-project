export const RELICS = [
  {
    id: "document-letters",
    name: "往来书信",
    src: "/assets/relics/document-letters.png",
    use: "meeting",
  },
  {
    id: "handwritten-letter",
    name: "手写信件",
    src: "/assets/relics/handwritten-letter.png",
    use: "meeting",
  },
  {
    id: "victory-paper",
    name: "胜利文书",
    src: "/assets/relics/victory-paper.png",
    use: "reward",
  },
  {
    id: "straw-sandals",
    name: "草鞋",
    src: "/assets/relics/straw-sandals.png",
    use: "march",
  },
  {
    id: "straw-hat",
    name: "斗笠",
    src: "/assets/relics/straw-hat.png",
    use: "march",
  },
  {
    id: "cloth-satchel",
    name: "布挎包",
    src: "/assets/relics/cloth-satchel.png",
    use: "supply",
  },
  {
    id: "utility-bag-gray",
    name: "灰布工具包",
    src: "/assets/relics/utility-bag-gray.png",
    use: "supply",
  },
  {
    id: "canteen-tin",
    name: "水壶饭盒",
    src: "/assets/relics/canteen-tin.png",
    use: "supply",
  },
  {
    id: "kerosene-lamp",
    name: "马灯",
    src: "/assets/relics/kerosene-lamp.png",
    use: "scene",
  },
  {
    id: "bugle",
    name: "军号",
    src: "/assets/relics/bugle.png",
    use: "signal",
  },
  {
    id: "red-star-cap",
    name: "红星帽",
    src: "/assets/relics/red-star-cap.png",
    use: "character",
  },
  {
    id: "uniform-jacket",
    name: "军装",
    src: "/assets/relics/uniform-jacket.png",
    use: "character",
  },
  {
    id: "wool-vest",
    name: "毛背心",
    src: "/assets/relics/wool-vest.png",
    use: "march",
  },
  {
    id: "puttees",
    name: "绑腿",
    src: "/assets/relics/puttees.png",
    use: "march",
  },
  {
    id: "belt",
    name: "皮带",
    src: "/assets/relics/belt.png",
    use: "character",
  },
  {
    id: "bayonet",
    name: "刺刀",
    src: "/assets/relics/bayonet.png",
    use: "battle",
  },
  {
    id: "machete",
    name: "砍刀",
    src: "/assets/relics/machete.png",
    use: "battle",
  },
  {
    id: "rifles",
    name: "步枪",
    src: "/assets/relics/rifles.png",
    use: "battle",
  },
  {
    id: "ammo-clips",
    name: "弹夹",
    src: "/assets/relics/ammo-clips.png",
    use: "battle",
  },
  {
    id: "grenades",
    name: "手榴弹",
    src: "/assets/relics/grenades.png",
    use: "battle",
  },
  {
    id: "banknote-three-yuan",
    name: "三元纸币",
    src: "/assets/relics/banknote-three-yuan.png",
    use: "archive",
  },
  {
    id: "banknote-five-fen",
    name: "五分纸币",
    src: "/assets/relics/banknote-five-fen.png",
    use: "archive",
  },
];

export function getRelicsByUse(use) {
  return RELICS.filter((relic) => relic.use === use);
}
