export const LEVELS: Record<string, { scenario: string; significance?: string }> = {
  "huining-join": {
    "levelId": "huining-join",
    "title": "会宁会师",
    "scenario": "TODO：待史料确认后填写情境压力描述（敌情/地形/时间窗口/物资状况）。",
    "playerQuestion": "TODO：待填写本关推断问题。",
    "cards": [],
    "_note": "结构参照 backend/src/data/levels/luding-bridge/cards.json 这一范式样本，史料到位后按同样字段补充 scenario / playerQuestion / cards。本关额外用于生成结尾数字展厅总结，可在 _note 之外自行加字段。"
  },
  "luding-bridge": {
    "levelId": "luding-bridge",
    "title": "飞夺泸定桥",
    "date": "1935-05-29",
    "location": "四川甘孜泸定县大渡河泸定铁索桥",
    "unit": "红一方面军红一军团2师4团（团长黄开湘、政委杨成武）",
    "scenario": "红军巧渡金沙江后，蒋介石调集大军围堵，扬言要让红军重蹈太平军石达开全军覆没的覆辙。红军先头部队在安顺场仅找到3条小船，数万红军渡河至少要一个月，追兵将至。中央军委下令兵分两路沿大渡河两岸北上，火速夺取泸定桥。5月28日接到紧急命令：必须29日清晨拿下泸定桥，剩余路程240里，限时不到24小时。泸定桥全长103.67米，由13根碗口粗铁索构成，战斗前敌军已拆掉全部桥面木板，只剩悬空铁索，对岸桥头碉堡重兵把守。",
    "playerQuestion": "面对仅剩不到24小时、桥板已被拆除、对岸重兵设防的处境，你认为红军应该如何决策？写下你的推断与理由。",
    "cards": [
      {
        "id": "luding-bridge-01",
        "title": "泸定桥桥体与拆除情况",
        "rawText": "泸定桥始建于清代康熙年间，全长103.67米，由13根碗口粗铁索构成，桥面铺木板；战斗前敌军拆掉全部木板，只剩悬空铁索，对岸桥头碉堡重兵把守。",
        "translation": "桥面木板已被敌军全部拆除，只剩下悬空的13根铁索可供通行，对岸桥头有碉堡防守。",
        "image": "/assets/levels/luding-bridge/card-01-bridge-real.png",
        "keyPoints": [
          "桥板拆除程度",
          "桥体结构"
        ]
      },
      {
        "id": "luding-bridge-02",
        "title": "24小时急行军240里",
        "rawText": "5月28日接到紧急命令：必须29日清晨拿下泸定桥，剩余路程240里，限时不到24小时。山路泥泞、天降暴雨，战士饿着肚子、全身湿透，一刻不停行军；夜里敌军举火把赶路，红军也点燃火把，和敌人隔河并行，敌人丝毫没认出；后半夜大雨浇灭火把，敌军就地宿营休息，红军摸黑冒雨持续前进；5月29日清晨6点，红四团神兵天降抵达泸定桥西岸。",
        "translation": "红四团在不到24小时内急行军240里，利用夜色和暴雨隐蔽行踪，抢在敌军增援之前抵达西岸。",
        "image": "/assets/levels/luding-bridge/card-02-march.png",
        "keyPoints": [
          "时间窗口极限",
          "行军隐蔽性"
        ]
      },
      {
        "id": "luding-bridge-03",
        "title": "22勇士突击队编成",
        "rawText": "战前布置：挑选22名勇士组成突击队，装备短枪、马刀、手榴弹；三连战士跟在后方，一边冲锋一边铺木板。全团6挺重机枪集中火力压制东岸敌人碉堡。总攻打响（下午4点）：数十把军号同时吹响，枪声、喊杀声震彻山谷。勇士们无任何遮挡，徒手抓冰冷铁索向前攀爬，子弹不断打在铁链上，多名战士中弹坠入湍急的大渡河，无人后退。",
        "translation": "22人突击队轻装强攻铁索，后方三连边冲边铺桥板，全团6挺重机枪火力掩护，下午4点发起总攻。",
        "image": "/assets/levels/luding-bridge/card-03-assault.png",
        "keyPoints": [
          "22勇士人数与编成",
          "火力掩护部署"
        ]
      },
      {
        "id": "luding-bridge-04",
        "title": "夺桥战斗结果",
        "rawText": "冲到东桥头时，敌人点燃煤油、木板燃起大火封锁桥头。连长廖大珠带头冲进烈火，勇士紧随其后，穿过火墙与敌人近身肉搏。两小时激战结束，红军占领泸定城，打通北上通道；22名勇士4人壮烈牺牲，18人成功登岸。",
        "translation": "东桥头燃起大火封锁，廖大珠带队冲火肉搏，激战两小时后夺下泸定城，22人中4人牺牲、18人登岸。",
        "image": "/assets/levels/luding-bridge/card-04-outcome.png",
        "keyPoints": [
          "伤亡结果",
          "战斗结局"
        ]
      }
    ],
    "significance": "彻底粉碎蒋介石把红军消灭在大渡河的计划，打通中央红军北上川陕甘根据地的关键通道，是长征转危为安的决定性战斗。毛主席《七律·长征》中「大渡桥横铁索寒」专门记录这场战斗。22勇士不畏牺牲的精神成为长征精神的标志性代表。（此字段用于关卡结尾/数字展厅讲解文案生成，不参与推断验证）",
    "_note": "本关卡为范式样本，字段结构已定稿：scenario/playerQuestion 描述情境压力，cards 是可供verification 比对的证据，significance 是结尾展厅用的旁白素材。其余关卡按此结构补充。"
  },
  "ruijin-departure": {
    "levelId": "ruijin-departure",
    "title": "瑞金出发",
    "date": "1934-10",
    "location": "江西瑞金、于都一带中央苏区",
    "scenario": "1934年10月，第五次反“围剿”失利后，中央苏区被层层碉堡与封锁线挤压，红军主力在原地继续作战的空间越来越小。为了保存力量、寻求新的战略机动，中央红军主力和中央机关从瑞金、于都等地集结出发，跨过于都河，开始后来被称为长征的战略转移。出发不是浪漫远行，而是在敌军压迫、道路封锁、物资紧缺、群众送别的复杂处境中做出的艰难选择。",
    "playerQuestion": "如果你站在1934年10月的中央苏区，面对封锁线、物资压力和部队保存问题，你怎样理解“必须出发”？写下你的判断与理由。",
    "significance": "瑞金出发标志着中央红军长征的开始。它把一场局部根据地保卫战转化为漫长的战略转移，也让“为什么必须走”成为理解长征起点的关键问题。"
  },
  "sidu-chishui": {
    "levelId": "sidu-chishui",
    "title": "四渡赤水",
    "scenario": "TODO：待史料确认后填写情境压力描述（敌情/地形/时间窗口/物资状况）。",
    "playerQuestion": "TODO：待填写本关推断问题。",
    "cards": [],
    "_note": "结构参照 backend/src/data/levels/luding-bridge/cards.json 这一范式样本，史料到位后按同样字段补充 scenario / playerQuestion / cards。"
  },
  "snow-grassland": {
    "levelId": "snow-grassland",
    "title": "雪山草地",
    "scenario": "TODO：待史料确认后填写情境压力描述（敌情/地形/时间窗口/物资状况）。",
    "playerQuestion": "TODO：待填写本关推断问题。",
    "cards": [],
    "_note": "结构参照 backend/src/data/levels/luding-bridge/cards.json 这一范式样本，史料到位后按同样字段补充 scenario / playerQuestion / cards。"
  },
  "xiangjiang-battle": {
    "levelId": "xiangjiang-battle",
    "title": "湘江血战",
    "date": "1934-11-25 至 1934-12-01",
    "location": "广西全州、兴安、灌阳一带湘江渡口",
    "scenario": "1934年11月底，中央红军在突破前三道封锁线后进入湘江地区。国民党军企图把红军压在湘江以东合围，红军必须在有限时间内抢占渡口、架设通路、掩护中央纵队和大部队渡江。江面、滩头、山口同时承受炮火与追击，许多部队为掩护主力付出巨大牺牲。湘江血战之后，中央红军由出发时的八万六千余人锐减到三万余人左右，惨烈代价成为长征初期最沉重的一课。",
    "playerQuestion": "面对湘江封锁、渡口争夺和巨大减员，你认为这场战斗的代价应该怎样理解？写下你的判断与理由。",
    "significance": "湘江血战是中央红军长征初期损失最惨重的战役之一。它以极大的牺牲换得主力突破封锁，也把“代价有多大、为什么要改变指挥方式”推到所有人面前。"
  },
  "zunyi-turn": {
    "levelId": "zunyi-turn",
    "title": "遵义转折",
    "scenario": "TODO：待史料确认后填写情境压力描述（敌情/地形/时间窗口/物资状况）。",
    "playerQuestion": "TODO：待填写本关推断问题。",
    "cards": [],
    "_note": "结构参照 backend/src/data/levels/luding-bridge/cards.json 这一范式样本，史料到位后按同样字段补充 scenario / playerQuestion / cards。"
  }
};
