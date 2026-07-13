import { ZUNYI_ASSETS } from "../../../cinematicAssets.js";


export const STEPS = [
  {
    id: "intro",
    title: "进入会议室",
    prompt: "先听清楚这场会议为什么必须召开。",
  },
  {
    id: "rewrite",
    title: "会场记录",
    prompt: "新的遵义会议游戏逻辑待接入。",
  },
  {
    id: "crisis",
    title: "一、整理当前局面",
    prompt: "点击一张桌上的史料，再点击右侧记录纸上的对应栏目。",
  },
  {
    id: "cause",
    title: "二、判断问题根源",
    prompt: "把真正的原因和干扰项分开。会议不是在否定战士，而是在重新判断指挥和打法。",
  },
  {
    id: "plan",
    title: "三、选择新的方向",
    prompt: "在两种方案里选出能让红军重新争取主动的一种。",
  },
  {
    id: "decision",
    title: "四、完成会议记录",
    prompt: "按逻辑顺序整理会议决定。",
  },
  {
    id: "route",
    title: "转折验证",
    prompt: "看会议后的路线怎样从被动转向主动。",
  },
];

export const CRISIS_CARDS = [
  {
    id: "xiangjiang-loss",
    label: "湘江战役损失惨重",
    type: "crisis",
    kind: "report",
    hint: "这是危机事实：队伍已经到了非常危险的关头。",
  },
  {
    id: "number-drop",
    label: "队伍从 8.6 万人减少到约 3 万人",
    type: "crisis",
    kind: "report",
    hint: "这是危机事实：人数锐减说明原来的打法不能再照旧。",
  },
  {
    id: "enemy-chase",
    label: "敌军继续围追堵截",
    type: "crisis",
    kind: "map",
    hint: "这是危机事实：外部压力仍在逼近。",
  },
  {
    id: "zunyi-rest",
    label: "攻占遵义，获得短暂休整",
    type: "chance",
    kind: "telegram",
    hint: "这是暂时机会：终于能坐下来认真解决问题。",
  },
];

export const CAUSE_CARDS = [
  {
    id: "rigid-battle",
    label: "死板阵地战",
    type: "cause",
    kind: "record",
    hint: "这是主要原因：打法太死板，容易被敌人牵着走。",
  },
  {
    id: "passive",
    label: "长期被动挨打",
    type: "cause",
    kind: "map",
    hint: "这是主要原因：红军需要重新争取主动。",
  },
  {
    id: "wrong-command",
    label: "错误军事指挥",
    type: "cause",
    kind: "telegram",
    hint: "这是主要原因：会议集中批评的就是错误军事指挥。",
  },
  {
    id: "not-brave",
    label: "战士不勇敢",
    type: "distractor",
    kind: "note",
    hint: "这是干扰项。湘江战役中红军苦战五昼夜，问题不是战士不勇敢。",
  },
  {
    id: "bad-weather",
    label: "天气不好",
    type: "distractor",
    kind: "note",
    hint: "这是干扰项。天气会增加困难，但会议重点讨论的是指挥和打法。",
  },
];

export const DECISION_CARDS = [
  { id: "criticize", label: "批评错误军事路线", detail: "先指出为什么原来的打法让红军陷入被动。" },
  { id: "leadership", label: "调整军事领导", detail: "再让新的判断进入核心指挥。" },
  { id: "north", label: "红军继续北上", detail: "最后把新的方向落实到接下来的路线。" },
];

export const DECISION_ORDER = ["criticize", "leadership", "north"];
export const ROUTE_POINTS = ["遵义会议", "四渡赤水", "巧渡金沙江", "飞夺泸定桥"];
export const ZUNYI_FRAGMENT = {
  id: "zunyi-direction",
  title: "方向碎片",
  mark: "转折",
  image: "/assets/fragments/fragment-zunyi-direction.png",
  text: "你记录下了遵义会议的关键判断。它会放进档案袋，和后面“四渡赤水”“飞夺泸定桥”的路线线索连在一起，说明红军怎样一步步重新争取主动。",
  gallery: [
    {
      image: "/assets/levels/zunyi-turn/site-exterior.jpg",
      zoomImage: "/assets/levels/zunyi-turn/site-exterior.jpg",
      title: "会址外景",
    },
    {
      image: "/assets/levels/zunyi-turn/meeting-room-map.jpg",
      zoomImage: "/assets/levels/zunyi-turn/meeting-room-map.jpg",
      title: "会场线索",
    },
    {
      image: "/assets/levels/zunyi-turn/handwriting-closeup.jpg",
      zoomImage: "/assets/levels/zunyi-turn/handwriting-closeup.jpg",
      title: "记录细节",
    },
  ],
};
export const MEETING_RECORDS = [
  {
    id: "lesson",
    speaker: "会场发言一",
    line: "红军损失很大，不能只怪敌人强。我们要认真总结，前面的指挥和打法哪里出了问题。",
    answer: "总结失败教训",
    choices: ["总结失败教训", "天气道路困难", "只记录敌人强大"],
    written: "记录一：会议认真总结第五次反“围剿”失败和长征初期受挫的教训。",
    wrongFeedback: "这句发言不是在说天气，也不是只说敌人强。它最重要的是：先把失败教训总结清楚。",
    sourceCard: {
      title: "《关于反对敌人五次围剿的总结》的决议",
      text: "这份《决议》重点总结第五次反“围剿”和长征初期的失败教训，指出错误不是为了削弱团结，而是为了把问题讲清楚、把队伍重新凝聚起来。",
      image: "/assets/levels/zunyi-turn/source/zunyi-record-summary-cover.jpg",
      zoomImage: "/assets/levels/zunyi-turn/source/zunyi-record-summary-pages.jpg",
      sourceName: "《关于反对敌人五次围剿的总结》的决议",
      excerpt: "党在揭发了这种错误之后，不是削弱而是加强了。",
      credit: "中央档案馆藏遵义会议相关决议文献",
      note: "这份《决议》篇幅很长，核心是总结错误军事指挥带来的损失，并强调揭发错误是为了加强党和红军的团结。",
    },
  },
  {
    id: "command",
    speaker: "会场发言二",
    line: "如果指挥脱离实际，打法太死板，红军就会一直被敌人牵着走。",
    answer: "军事指挥问题",
    choices: ["战士不够勇敢", "军事指挥问题", "粮食不够充足"],
    written: "记录二：会议重点讨论当时最紧迫的军事指挥和作战方法问题。",
    wrongFeedback: "这句发言不是批评战士，也不是只讲物资。它指向的是当时最紧迫的军事指挥问题。",
    sourceCard: {
      title: "军事指挥和作战方法",
      text: "遵义会议集中讨论当时最紧迫的军事问题，批评脱离实际的指挥和死板打法。",
      image: "/assets/levels/zunyi-turn/meeting-manuscript.png",
      sourceName: "《（乙）遵义政治局扩大会议》（陈云手稿）",
      excerpt: "检阅在反对五次‘围剿’中与西征中军事指挥上的经验与教训。",
      credit: "中央档案馆藏《（乙）遵义政治局扩大会议》手稿",
      note: "这说明遵义会议不是简单开会，而是在认真总结军事指挥上的经验和教训。",
    },
  },
  {
    id: "direction",
    speaker: "会场发言三",
    line: "这次会议增选毛泽东同志为中央政治局常委，让他参加中央军事指挥的领导工作。红军要用更灵活的办法，重新争取主动。",
    answer: "调整领导，争取主动",
    choices: ["继续原来打法", "原地长期休整", "调整领导，争取主动"],
    written: "记录三：会议增选毛泽东同志为中央政治局常委，推动红军调整领导和指挥方式，重新争取主动。",
    wrongFeedback: "会议不是要继续原来的打法，也不是原地停下来。关键是调整领导和指挥方式，重新争取主动。",
    sourceCard: {
      title: "重要组织调整",
      text: "会议增选毛泽东同志为中央政治局常委，并让他参加中央军事指挥的领导工作，红军开始重新争取主动。",
      image: "/assets/levels/zunyi-turn/zunyi-leadership-adjustment-detail.jpg",
      zoomImage: "/assets/levels/zunyi-turn/zunyi-leadership-adjustment-thumb.jpg",
      sourceName: "遵义会议后的重要组织调整",
      excerpt: "增选毛泽东同志为中央政治局常委，并让他参加中央军事指挥的领导工作。",
      credit: "根据遵义会议相关史实整理",
      note: "这条史实要表达的是领导和军事指挥方式的调整。对小记录员来说，重点不是背人名，而是理解红军为什么能重新争取主动。",
    },
  },
];
export const REWRITE_SCENES = [
  {
    id: "arrival-crisis",
    label: "第一幕 1/3",
    title: "为什么必须开这次会？",
    text: "长征刚开始时，中央红军连续遭到敌人围追堵截。特别是湘江战役后，队伍损失很大，大家都意识到：如果继续照旧走下去，红军会越来越危险。",
    image: ZUNYI_ASSETS.cinematic.exteriorNight,
  },
  {
    id: "arrival-question",
    label: "第一幕 2/3",
    title: "问题出在哪里？",
    text: "当时最需要弄清楚的，不是谁勇不勇敢，而是前面的军事指挥和打法有没有问题。红军需要停下来认真讨论：为什么会被动，下一步怎样才能争取主动。",
    image: ZUNYI_ASSETS.cinematic.exteriorNight,
  },
  {
    id: "arrival-chance",
    label: "第一幕 3/3",
    title: "遵义给了短暂机会",
    text: "1935 年 1 月，红军攻占贵州遵义，终于获得短暂休整。于是，中共中央在这里召开政治局扩大会议，重新总结经验，调整方向。这就是遵义会议召开的重要背景。",
    image: ZUNYI_ASSETS.cinematic.exteriorNight,
  },
  {
    id: "doorway-crisis",
    label: "第二幕 1/3",
    title: "会议即将开始",
    text: "你来到会场门口，屋里的人神色凝重。第五次反“围剿”失利后，中央红军被迫开始长征；湘江战役又让队伍遭受严重损失，敌人的围追堵截还没有停止。",
    image: ZUNYI_ASSETS.cinematic.doorwayEntry,
  },
  {
    id: "doorway-turning-point",
    label: "第二幕 2/3",
    title: "已经到了关键关头",
    text: "大家担忧的不只是一路行军的艰苦，更是党和红军接下来该往哪里走、怎样摆脱被动。如果再不能认真总结错误、调整方向，前途命运都会面临更大的危险。",
    image: ZUNYI_ASSETS.cinematic.doorwayEntry,
  },
  {
    id: "doorway-recorder",
    label: "第二幕 3/3",
    title: "记录员，请准备好",
    text: "作为这场会议的小记录员，你要仔细听清每一次发言：哪些是在总结失败教训，哪些是在讨论军事指挥和组织调整。把这些记准确，才能理解遵义会议为什么是生死攸关的转折点。",
    image: ZUNYI_ASSETS.cinematic.doorwayEntry,
  },
  {
    id: "desk",
    label: "第三幕",
    title: "坐到会议桌前",
    text: "纸笔已经摆好，发言声在屋里低低响起。请把每一句话里最重要的意思写进会议记录纸。",
    image: ZUNYI_ASSETS.cinematic.recorderDesk,
    game: "record",
  },
];

