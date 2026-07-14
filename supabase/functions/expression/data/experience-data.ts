export const EXPERIENCES: Record<string, any> = {
  "huining-join": {
    "schemaVersion": 2,
    "levelId": "huining-join",
    "duration": {
      "targetSeconds": 120,
      "minSeconds": 60,
      "maxSeconds": 180
    },
    "sourceDrawer": {
      "enabled": true,
      "title": "本关史料",
      "position": "top-right",
      "maxItems": 12
    },
    "phases": {
      "briefing": {
        "enabled": true,
        "estimatedSeconds": 10,
        "title": "三路终会合",
        "question": "会师为什么既是长征胜利的标志，也是新的起点？"
      },
      "gameplay": {
        "enabled": true,
        "estimatedSeconds": 70,
        "adapterId": "huining-join",
        "helpAfterFailures": 2,
        "assistAfterFailures": 3
      },
      "sources": {
        "enabled": true,
        "estimatedSeconds": 8,
        "items": [
          {
            "id": "source-huining-hoof-march",
            "title": "马蹄裹布奔袭西津门",
            "type": "会师旧址历史说明",
            "date": "1936年9月底至10月2日",
            "creator": "会宁县人民政府",
            "summary": "红十五军团直属骑兵团隐蔽急进并控制会宁城，为后续部队会合打开通道。",
            "originalExcerpt": "骑兵用布裹住马蹄，白天隐蔽、夜间行军。",
            "plainExplanation": "会师首先需要安全通道。马蹄裹布不是装饰细节，而是隐蔽行军的一种具体办法。",
            "sourceName": "会宁县人民政府《会师楼》",
            "sourceUrl": "https://www.huining.gov.cn/mlhn/hncsmp/art/2023/art_53e4c1728bcf4052a0cd018ca0aeabf8.html",
            "rightsStatus": "pending",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          },
          {
            "id": "source-huining-staged-arrival",
            "title": "会宁一线分批接应",
            "type": "地方志与会师记录",
            "date": "1936年10月7日至10日",
            "creator": "会宁县人民政府",
            "summary": "红一方面军在会宁、青江驿和界石铺一线接应红四方面军部队分批到达。",
            "originalExcerpt": "一般指战员情绪很高。",
            "plainExplanation": "10月9日的正式会合与10月10日的文庙联欢是相邻但不同的历史节点。",
            "sourceName": "会宁县人民政府《会宁县志》相关记载",
            "sourceUrl": "https://www.huining.gov.cn/mlhn/lsyg/art/2020/art_bf93be81d0f84c1a97b718f73a769286.html",
            "rightsStatus": "pending",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          },
          {
            "id": "source-jiangtaibao-oct22",
            "title": "10月22日将台堡会师",
            "type": "国防教育史料",
            "date": "1936年10月22日",
            "creator": "中华人民共和国国防部",
            "summary": "红二方面军总部与红二军团在将台堡同红一方面军会合。",
            "originalExcerpt": "红一、红二方面军在将台堡会师。",
            "plainExplanation": "将台堡今属宁夏西吉，时间和地点都要与会宁10月9日的节点分开辨认。",
            "sourceName": "国防部《我们胜利会师了！》",
            "sourceUrl": "https://www.mod.gov.cn/gfbw/gfjy_index/zyhd/4848435.html",
            "rightsStatus": "pending",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          },
          {
            "id": "source-xinglong-oct23",
            "title": "10月23日兴隆镇会合",
            "type": "新华社党史报道",
            "date": "1936年10月23日",
            "creator": "新华社",
            "summary": "红六军团在兴隆镇同红一方面军会合，接续完成三大主力的会师进程。",
            "originalExcerpt": "红六军团在兴隆镇同红一方面军会合。",
            "plainExplanation": "这个节点比将台堡晚一天，说明会师是跨越多日、多地的连续过程。",
            "sourceName": "中央网信办转载新华社《三军大会师》",
            "sourceUrl": "https://www.cac.gov.cn/2016-08/22/c_1119432029.htm",
            "rightsStatus": "pending",
            "activeInGameplay": false,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          },
          {
            "id": "source-huining-campaign-plan",
            "title": "《通庄静会战役计划》原件",
            "type": "战役计划影印件",
            "date": "1936年9月28日",
            "creator": "朱德、张国焘签发（飞书资料标注）",
            "summary": "会师前夕形成的战役计划展示了部队在通渭、庄浪、静宁、会宁一带的行动部署，为理解会师为何发生在这一战略区域提供材料。",
            "plainExplanation": "三大主力会合并非偶然相遇，而是在敌军围堵和北上部署中逐步形成的战略结果。",
            "sourceName": "飞书文档《长征资源库》资料整理（具体馆藏著录待审核）",
            "sourceUrl": "https://acnq2colhyxd.feishu.cn/docx/BZojduheyohb5ax5BrPcS1kcnmc",
            "rightsStatus": "pending",
            "image": "/assets/levels/huining-join/sources/huining-campaign-plan-feishu.png",
            "imageAlt": "通庄静会战役计划文书原件照片",
            "imageCaption": "飞书资料标注：1936年9月28日《通庄静会战役计划》原件；馆藏与授权状态待审核。",
            "activeInGameplay": false,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          }
        ]
      },
      "expression": {
        "enabled": true,
        "estimatedSeconds": 25,
        "prompt": "从马蹄裹布、会师时间线、你选择的历史碎片和史料出发，为自己的数字展台留下一段讲解。",
        "inputMode": "choice-plus-short-text",
        "maxCharacters": 80,
        "sourceSelectionLimit": 3,
        "outputType": "exhibition-guide",
        "outputLabel": "AI整理成展台讲解",
        "suggestions": [
          {
            "id": "many-routes-one-goal",
            "label": "不同道路汇向同一目标"
          },
          {
            "id": "unity-after-hardship",
            "label": "艰难之后重新会合"
          },
          {
            "id": "arrival-new-start",
            "label": "抵达也是新的出发"
          }
        ],
        "fallbackTemplates": [
          {
            "title": "从抵达到会合",
            "text": "我看到的长征，不只是一条漫长路线，更是许多队伍在艰难选择之后重新汇聚、共同出发。"
          },
          {
            "title": "会师之后",
            "text": "这些碎片记录了不同的考验。它们在会宁汇成同一个答案：抵达不是结束，团结起来才能走向新的任务。"
          }
        ],
        "ai": {
          "enabled": true,
          "provider": "mimo",
          "maxOutputCharacters": 160
        }
      },
      "completion": {
        "enabled": true,
        "estimatedSeconds": 8,
        "reviewTitle": "我的长征数字展台",
        "showFragmentReward": false,
        "showShowcaseEntry": true,
        "returnTarget": "#/map"
      }
    },
    "audio": {
      "ambience": [
        {
          "id": "huining-autumn-square",
          "src": null,
          "label": "秋风、旗帜与远处人群声",
          "status": "prototype"
        }
      ],
      "narration": [
        {
          "id": "huining-briefing",
          "src": null,
          "transcript": "1936年10月，骑兵用布裹住马蹄，隐蔽奔袭打开会宁通道。请还原三路队伍跨越多日、多地的会师进程，再用一路获得的碎片搭建属于你的长征展台。",
          "status": "script-ready"
        }
      ],
      "effects": [
        {
          "id": "huining-hoof-wrap",
          "src": null,
          "label": "马蹄裹布"
        },
        {
          "id": "huining-route-lock",
          "src": null,
          "label": "路线接入"
        },
        {
          "id": "huining-timeline-place",
          "src": null,
          "label": "时间节点归位"
        },
        {
          "id": "huining-fragment-place",
          "src": null,
          "label": "碎片落位"
        },
        {
          "id": "huining-showcase-complete",
          "src": null,
          "label": "展台完成"
        }
      ],
      "completionMusic": null
    },
    "fragment": null
  },
  "luding-bridge": {
    "schemaVersion": 2,
    "levelId": "luding-bridge",
    "duration": {
      "targetSeconds": 120,
      "minSeconds": 60,
      "maxSeconds": 180
    },
    "sourceDrawer": {
      "enabled": true,
      "title": "本关史料",
      "position": "top-right",
      "maxItems": 12
    },
    "phases": {
      "briefing": {
        "enabled": false,
        "estimatedSeconds": 15,
        "title": "",
        "question": ""
      },
      "gameplay": {
        "enabled": true,
        "estimatedSeconds": 90,
        "adapterId": "luding-bridge",
        "helpAfterFailures": 2,
        "assistAfterFailures": 3
      },
      "sources": {
        "enabled": true,
        "estimatedSeconds": 0,
        "items": [
          {
            "id": "source-luding-strategic-telegram",
            "title": "《控制泸定桥渡河点取得战略胜利的部署》",
            "type": "万万火急军事电报影印件",
            "date": "1935年5月26日",
            "creator": "朱德签发",
            "summary": "电报把控制泸定桥渡河点作为取得战略主动的重要部署，为关卡中的抢时间、夺通道提供历史依据。",
            "plainExplanation": "泸定桥的价值不只在桥本身，它还是部队能否迅速渡过大渡河、摆脱围堵的关键通道。",
            "sourceName": "飞书文档《长征资源库》资料整理（具体馆藏著录待审核）",
            "sourceUrl": "https://acnq2colhyxd.feishu.cn/docx/BZojduheyohb5ax5BrPcS1kcnmc",
            "rightsStatus": "pending",
            "image": "/assets/levels/luding-bridge/sources/luding-strategic-telegram-feishu.jpg",
            "imageAlt": "控制泸定桥渡河点部署电报原件影印图",
            "imageCaption": "飞书资料标注：1935年5月26日朱德签发的泸定桥渡河点部署电报；馆藏与授权状态待审核。",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          }
        ]
      },
      "expression": {
        "enabled": true,
        "estimatedSeconds": 25,
        "prompt": "请用一封短电报，报告你在极限时间里完成了什么、最想记住什么。",
        "inputMode": "choice-plus-short-text",
        "maxCharacters": 60,
        "sourceSelectionLimit": 1,
        "outputType": "action-telegram",
        "outputLabel": "AI整理成行动电报",
        "suggestions": [
          {
            "id": "race-against-time",
            "label": "和时间赛跑"
          },
          {
            "id": "cross-under-fire",
            "label": "在危险中打开通道"
          },
          {
            "id": "team-cooperation",
            "label": "突击与支援共同完成"
          }
        ],
        "fallbackTemplates": [
          {
            "title": "行动电报",
            "text": "通道已经打开。真正需要报告的，不只是抵达，更是队伍在极限时间里彼此支援、继续向前。"
          },
          {
            "title": "来自桥头的报告",
            "text": "我们争取到的不只是几分钟，而是整支队伍继续前进的机会。"
          }
        ],
        "ai": {
          "enabled": true,
          "provider": "mimo",
          "maxOutputCharacters": 140
        }
      },
      "completion": {
        "enabled": true,
        "estimatedSeconds": 15,
        "reviewTitle": "",
        "showFragmentReward": true,
        "showShowcaseEntry": true,
        "returnTarget": "#/map"
      }
    },
    "audio": {
      "ambience": [],
      "narration": [],
      "effects": [],
      "completionMusic": null
    },
    "fragment": {
      "id": "iron-chain-fragment",
      "name": "铁索碎片",
      "model": null,
      "fallbackImage": "/assets/fragments/fragment-luding-chain.png",
      "legacyVisualId": "iron-chain-fragment",
      "historicalMeaning": "",
      "sourceIds": [],
      "narrationAudioId": null,
      "hotspots": []
    }
  },
  "ruijin-departure": {
    "schemaVersion": 2,
    "levelId": "ruijin-departure",
    "duration": {
      "targetSeconds": 120,
      "minSeconds": 60,
      "maxSeconds": 180
    },
    "sourceDrawer": {
      "enabled": true,
      "title": "本关史料",
      "position": "top-right",
      "maxItems": 12
    },
    "phases": {
      "briefing": {
        "enabled": false,
        "estimatedSeconds": 15,
        "title": "",
        "question": ""
      },
      "gameplay": {
        "enabled": true,
        "estimatedSeconds": 90,
        "adapterId": "ruijin-departure",
        "helpAfterFailures": 2,
        "assistAfterFailures": 3
      },
      "sources": {
        "enabled": true,
        "estimatedSeconds": 0,
        "items": [
          {
            "id": "source-ruijin-action-schedule",
            "title": "《野战军十月十日至二十日行动日程表》",
            "type": "行动日程手稿影印件",
            "date": "1934年10月9日",
            "creator": "革命军事委员会",
            "summary": "表格按日期记录中央红军战略转移初期的行动安排，让“从瑞金出发”落到连续、具体的行军部署中。",
            "plainExplanation": "离开中央苏区并不是一次简单启程，而是需要按时间、路线和部队协同组织的军事行动。",
            "sourceName": "飞书文档《长征资源库》资料整理（具体馆藏著录待审核）",
            "sourceUrl": "https://acnq2colhyxd.feishu.cn/docx/BZojduheyohb5ax5BrPcS1kcnmc",
            "rightsStatus": "pending",
            "image": "/assets/levels/ruijin-departure/sources/ruijin-action-schedule-feishu.jpg",
            "imageAlt": "野战军十月十日至二十日行动日程表手稿影印图",
            "imageCaption": "飞书资料标注：1934年10月9日行动日程表原始手稿；题名、馆藏与授权状态待项目审核。",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          }
        ]
      },
      "expression": {
        "enabled": true,
        "estimatedSeconds": 25,
        "prompt": "离开熟悉的根据地时，你最想为这次出发留下一句什么？",
        "inputMode": "choice-plus-short-text",
        "maxCharacters": 60,
        "sourceSelectionLimit": 1,
        "outputType": "departure-note",
        "outputLabel": "AI整理成出发札记",
        "suggestions": [
          {
            "id": "carry-necessities",
            "label": "带上真正需要的东西"
          },
          {
            "id": "leave-home",
            "label": "告别熟悉的家园"
          },
          {
            "id": "protect-team",
            "label": "为队伍保存力量"
          }
        ],
        "fallbackTemplates": [
          {
            "title": "出发前的一句话",
            "text": "我带走的不只是行装，也是一份必须继续走下去的责任。"
          },
          {
            "title": "离开瑞金",
            "text": "出发意味着告别，也意味着为了保存力量，主动走向一条未知的路。"
          }
        ],
        "ai": {
          "enabled": true,
          "provider": "mimo",
          "maxOutputCharacters": 160
        }
      },
      "completion": {
        "enabled": true,
        "estimatedSeconds": 15,
        "reviewTitle": "",
        "showFragmentReward": true,
        "showShowcaseEntry": true,
        "returnTarget": "#/map"
      }
    },
    "audio": {
      "ambience": [],
      "narration": [],
      "effects": [],
      "completionMusic": null
    },
    "fragment": {
      "id": "departure-map-fragment",
      "name": "出发碎片",
      "model": null,
      "fallbackImage": null,
      "legacyVisualId": "departure-map-fragment",
      "historicalMeaning": "",
      "sourceIds": [],
      "narrationAudioId": null,
      "hotspots": []
    }
  },
  "sidu-chishui": {
    "schemaVersion": 2,
    "levelId": "sidu-chishui",
    "duration": {
      "targetSeconds": 120,
      "minSeconds": 60,
      "maxSeconds": 180
    },
    "sourceDrawer": {
      "enabled": true,
      "title": "本关史料",
      "position": "top-right",
      "maxItems": 12
    },
    "phases": {
      "briefing": {
        "enabled": false,
        "estimatedSeconds": 15,
        "title": "",
        "question": ""
      },
      "gameplay": {
        "enabled": true,
        "estimatedSeconds": 90,
        "adapterId": "sidu-chishui",
        "helpAfterFailures": 2,
        "assistAfterFailures": 3
      },
      "sources": {
        "enabled": true,
        "estimatedSeconds": 0,
        "items": [
          {
            "id": "source-sidu-military-telegrams",
            "title": "四渡赤水相关军委电报原件",
            "type": "军事电报影印件",
            "date": "1935年1月至3月",
            "creator": "红军总部相关机关",
            "summary": "多份电报并置呈现命令随战局连续发出和调整的形态，是理解四渡赤水机动指挥的重要材料。",
            "plainExplanation": "四渡赤水不是按一张固定路线图执行到底，而是在敌情、时间和空间变化中不断调整行动。",
            "sourceName": "飞书文档《长征资源库》资料整理（具体电报题名与日期待审核）",
            "sourceUrl": "https://acnq2colhyxd.feishu.cn/docx/BZojduheyohb5ax5BrPcS1kcnmc",
            "rightsStatus": "pending",
            "image": "/assets/levels/sidu-chishui/sources/sidu-military-telegram-feishu.jpg",
            "imageAlt": "四渡赤水相关多份军委电报原件影印图",
            "imageCaption": "飞书资料标注为四渡赤水相关军委电报原件；具体题名、日期与馆藏待审核。",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          }
        ]
      },
      "expression": {
        "enabled": true,
        "estimatedSeconds": 25,
        "prompt": "四次改变路线之后，你怎样理解“主动”并不等于一直向前？",
        "inputMode": "choice-plus-short-text",
        "maxCharacters": 60,
        "sourceSelectionLimit": 1,
        "outputType": "route-reflection",
        "outputLabel": "AI整理成路线思考",
        "suggestions": [
          {
            "id": "change-is-active",
            "label": "改变方向也是主动"
          },
          {
            "id": "mislead-pursuit",
            "label": "让追兵判断失误"
          },
          {
            "id": "create-opportunity",
            "label": "在运动中创造机会"
          }
        ],
        "fallbackTemplates": [
          {
            "title": "路线不是直线",
            "text": "我发现，主动不是只朝一个方向冲，而是根据局面改变路线，为队伍重新创造机会。"
          },
          {
            "title": "四次渡河之后",
            "text": "地图上的往返并非犹豫，它让追击者难以判断，也让队伍获得新的空间。"
          }
        ],
        "ai": {
          "enabled": true,
          "provider": "mimo",
          "maxOutputCharacters": 160
        }
      },
      "completion": {
        "enabled": true,
        "estimatedSeconds": 15,
        "reviewTitle": "",
        "showFragmentReward": true,
        "showShowcaseEntry": true,
        "returnTarget": "#/map"
      }
    },
    "audio": {
      "ambience": [],
      "narration": [],
      "effects": [],
      "completionMusic": null
    },
    "fragment": {
      "id": "chishui-maneuver-fragment",
      "name": "赤水碎片",
      "model": null,
      "fallbackImage": null,
      "legacyVisualId": "chishui-maneuver-fragment",
      "historicalMeaning": "",
      "sourceIds": [],
      "narrationAudioId": null,
      "hotspots": []
    }
  },
  "snow-grassland": {
    "schemaVersion": 2,
    "levelId": "snow-grassland",
    "duration": {
      "targetSeconds": 120,
      "minSeconds": 60,
      "maxSeconds": 180
    },
    "sourceDrawer": {
      "enabled": true,
      "title": "本关史料",
      "position": "top-right",
      "maxItems": 12
    },
    "phases": {
      "briefing": {
        "enabled": false,
        "estimatedSeconds": 15,
        "title": "",
        "question": ""
      },
      "gameplay": {
        "enabled": true,
        "estimatedSeconds": 90,
        "adapterId": "snow-grassland",
        "helpAfterFailures": 2,
        "assistAfterFailures": 3
      },
      "sources": {
        "enabled": true,
        "estimatedSeconds": 0,
        "items": [
          {
            "id": "source-snow-grassland-manuscript",
            "title": "雪山草地亲历者手稿影印件",
            "type": "长征亲历手稿",
            "date": "1935年至1936年间形成，具体日期待审核",
            "creator": "具体作者待史实审核",
            "summary": "亲历者手稿把宏大的雪山草地叙事还原为个人所见、所感与生存选择，为后续加入具体人物故事提供一手材料入口。",
            "plainExplanation": "极端环境中的历史不是抽象困难，而是一个个具体的人怎样保存体力、互相帮助并继续前进。",
            "sourceName": "飞书文档《长征资源库》资料整理（具体题名、作者与馆藏待审核）",
            "sourceUrl": "https://acnq2colhyxd.feishu.cn/docx/BZojduheyohb5ax5BrPcS1kcnmc",
            "rightsStatus": "pending",
            "image": "/assets/levels/snow-grassland/sources/snow-grassland-manuscript-feishu.png",
            "imageAlt": "雪山草地长征亲历者手写记录影印图",
            "imageCaption": "飞书资料中的长征亲历手稿；具体题名、作者、形成日期与馆藏待审核。",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          }
        ]
      },
      "expression": {
        "enabled": true,
        "estimatedSeconds": 25,
        "prompt": "从一个具体的人、一件具体的事出发，你想把怎样的雪山草地记忆留下来？",
        "inputMode": "choice-plus-short-text",
        "maxCharacters": 60,
        "sourceSelectionLimit": 1,
        "outputType": "memory-card",
        "outputLabel": "AI整理成长征记忆卡",
        "suggestions": [
          {
            "id": "specific-person",
            "label": "记住一个具体的人"
          },
          {
            "id": "share-supplies",
            "label": "在匮乏中彼此照顾"
          },
          {
            "id": "hard-choice",
            "label": "记住艰难的取舍"
          }
        ],
        "fallbackTemplates": [
          {
            "title": "雪地里的一件小事",
            "text": "宏大的路程也由具体的人和选择组成。我想记住困境中仍愿意照顾同伴的那一刻。"
          },
          {
            "title": "留下这段记忆",
            "text": "雪山草地不只是艰苦两个字，它也是人在匮乏中作出取舍、彼此支撑的具体故事。"
          }
        ],
        "ai": {
          "enabled": true,
          "provider": "mimo",
          "maxOutputCharacters": 160
        }
      },
      "completion": {
        "enabled": true,
        "estimatedSeconds": 15,
        "reviewTitle": "",
        "showFragmentReward": true,
        "showShowcaseEntry": true,
        "returnTarget": "#/map"
      }
    },
    "audio": {
      "ambience": [],
      "narration": [],
      "effects": [],
      "completionMusic": null
    },
    "fragment": {
      "id": "snow-grass-fragment",
      "name": "雪草碎片",
      "model": null,
      "fallbackImage": null,
      "legacyVisualId": "snow-grass-fragment",
      "historicalMeaning": "",
      "sourceIds": [],
      "narrationAudioId": null,
      "hotspots": []
    }
  },
  "xiangjiang-battle": {
    "schemaVersion": 2,
    "levelId": "xiangjiang-battle",
    "duration": {
      "targetSeconds": 120,
      "minSeconds": 60,
      "maxSeconds": 180
    },
    "sourceDrawer": {
      "enabled": true,
      "title": "本关史料",
      "position": "top-right",
      "maxItems": 12
    },
    "phases": {
      "briefing": {
        "enabled": false,
        "estimatedSeconds": 15,
        "title": "",
        "question": ""
      },
      "gameplay": {
        "enabled": true,
        "estimatedSeconds": 90,
        "adapterId": "xiangjiang-battle",
        "helpAfterFailures": 2,
        "assistAfterFailures": 3
      },
      "sources": {
        "enabled": true,
        "estimatedSeconds": 0,
        "items": [
          {
            "id": "source-xiangjiang-operation-map",
            "title": "全州、兴安方向作战部署图",
            "type": "作战部署图影印件",
            "date": "1934年11月25日前后",
            "creator": "红军总部相关作战机关",
            "summary": "手绘部署图呈现全州、兴安一带的道路、地域与行动方向，为理解湘江战役中的渡江窗口和阻击压力提供空间线索。",
            "plainExplanation": "地图上的路线和位置关系说明，突破湘江不仅取决于勇气，也取决于部队能否在有限时间内协同通过。",
            "sourceName": "飞书文档《长征资源库》资料整理（具体题名与馆藏待审核）",
            "sourceUrl": "https://acnq2colhyxd.feishu.cn/docx/BZojduheyohb5ax5BrPcS1kcnmc",
            "rightsStatus": "pending",
            "image": "/assets/levels/xiangjiang-battle/sources/xiangjiang-operation-map-feishu.jpg",
            "imageAlt": "湘江战役全州兴安方向手绘作战部署图",
            "imageCaption": "飞书资料标注：1934年11月25日前后全州、兴安方向作战部署材料；具体题名与馆藏待审核。",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          }
        ]
      },
      "expression": {
        "enabled": true,
        "estimatedSeconds": 25,
        "prompt": "如果这段经历成为博物馆里的一件展品，你会怎样说明突破背后的代价？",
        "inputMode": "choice-plus-short-text",
        "maxCharacters": 60,
        "sourceSelectionLimit": 1,
        "outputType": "exhibit-caption",
        "outputLabel": "AI整理成展品说明",
        "suggestions": [
          {
            "id": "time-cost",
            "label": "抢时间也要付出代价"
          },
          {
            "id": "covering-force",
            "label": "有人留下掩护队伍"
          },
          {
            "id": "not-easy-victory",
            "label": "突破不等于轻松胜利"
          }
        ],
        "fallbackTemplates": [
          {
            "title": "渡江之后",
            "text": "这件展品提醒我，突破封锁线不是轻松的胜利，而是许多人用行动换来的继续前进。"
          },
          {
            "title": "被时间追赶的人",
            "text": "路线图上的一条线，背后是抢时间、守阵地和承受损失的真实选择。"
          }
        ],
        "ai": {
          "enabled": true,
          "provider": "mimo",
          "maxOutputCharacters": 160
        }
      },
      "completion": {
        "enabled": true,
        "estimatedSeconds": 15,
        "reviewTitle": "",
        "showFragmentReward": true,
        "showShowcaseEntry": true,
        "returnTarget": "#/map"
      }
    },
    "audio": {
      "ambience": [],
      "narration": [],
      "effects": [],
      "completionMusic": null
    },
    "fragment": {
      "id": "river-crossing-fragment",
      "name": "渡江碎片",
      "model": null,
      "fallbackImage": null,
      "legacyVisualId": "river-crossing-fragment",
      "historicalMeaning": "",
      "sourceIds": [],
      "narrationAudioId": null,
      "hotspots": []
    }
  },
  "zunyi-turn": {
    "schemaVersion": 2,
    "levelId": "zunyi-turn",
    "duration": {
      "targetSeconds": 120,
      "minSeconds": 60,
      "maxSeconds": 180
    },
    "sourceDrawer": {
      "enabled": true,
      "title": "本关史料",
      "position": "top-right",
      "maxItems": 12
    },
    "phases": {
      "briefing": {
        "enabled": false,
        "estimatedSeconds": 15,
        "title": "",
        "question": ""
      },
      "gameplay": {
        "enabled": true,
        "estimatedSeconds": 90,
        "adapterId": "zunyi-turn",
        "helpAfterFailures": 2,
        "assistAfterFailures": 3
      },
      "sources": {
        "enabled": true,
        "estimatedSeconds": 0,
        "items": [
          {
            "id": "source-zunyi-related-manuscript",
            "title": "遵义会议相关手稿影印件",
            "type": "会议史料手稿",
            "date": "1935年1月前后",
            "creator": "具体作者待史实审核",
            "summary": "手写材料保留了会议相关记录形成时的原始形态，可用于区分后来的历史叙述与当时留下的文字材料。",
            "plainExplanation": "理解遵义转折，既要看会议作出的判断，也要关注这些判断怎样被记录、整理和保存下来。",
            "sourceName": "飞书文档《长征资源库》资料整理（具体题名、作者与馆藏待审核）",
            "sourceUrl": "https://acnq2colhyxd.feishu.cn/docx/BZojduheyohb5ax5BrPcS1kcnmc",
            "rightsStatus": "pending",
            "image": "/assets/levels/zunyi-turn/sources/zunyi-manuscript-feishu.jpg",
            "imageAlt": "遵义会议相关手写史料影印图",
            "imageCaption": "飞书资料中的遵义会议相关手稿；在正式展陈前需核对具体题名、作者、日期和馆藏。",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          }
        ]
      },
      "expression": {
        "enabled": true,
        "estimatedSeconds": 25,
        "prompt": "作为会议记录员，你会怎样写下这次讨论真正改变了什么？",
        "inputMode": "choice-plus-short-text",
        "maxCharacters": 60,
        "sourceSelectionLimit": 1,
        "outputType": "meeting-summary",
        "outputLabel": "AI整理成会议记录",
        "suggestions": [
          {
            "id": "review-command",
            "label": "先总结错误指挥"
          },
          {
            "id": "change-direction",
            "label": "重新判断前进方向"
          },
          {
            "id": "take-initiative",
            "label": "把主动权拿回来"
          }
        ],
        "fallbackTemplates": [
          {
            "title": "记录纸上的转折",
            "text": "我记录下的，不只是一次意见变化，而是在危急时刻重新总结问题、寻找正确方向。"
          },
          {
            "title": "会议之后",
            "text": "转折并非一句口号，它来自对失败的复盘，也来自重新作出判断的勇气。"
          }
        ],
        "ai": {
          "enabled": true,
          "provider": "mimo",
          "maxOutputCharacters": 160
        }
      },
      "completion": {
        "enabled": true,
        "estimatedSeconds": 15,
        "reviewTitle": "",
        "showFragmentReward": true,
        "showShowcaseEntry": true,
        "returnTarget": "#/map"
      }
    },
    "audio": {
      "ambience": [],
      "narration": [],
      "effects": [],
      "completionMusic": null
    },
    "fragment": {
      "id": "direction-fragment",
      "name": "方向碎片",
      "model": null,
      "fallbackImage": "/assets/fragments/fragment-zunyi-direction.png",
      "legacyVisualId": "direction-fragment",
      "historicalMeaning": "",
      "sourceIds": [],
      "narrationAudioId": null,
      "hotspots": []
    }
  }
};
