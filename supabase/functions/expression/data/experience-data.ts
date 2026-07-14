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
        "outputLabel": "AI根据玩家选择生成",
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
        "items": []
      },
      "expression": {
        "enabled": false,
        "estimatedSeconds": 0,
        "prompt": "",
        "inputMode": "choice-plus-short-text",
        "maxCharacters": 40,
        "sourceSelectionLimit": 1,
        "outputType": "action-telegram",
        "outputLabel": "AI根据玩家选择生成",
        "fallbackTemplates": [],
        "ai": {
          "enabled": false,
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
        "items": []
      },
      "expression": {
        "enabled": false,
        "estimatedSeconds": 0,
        "prompt": "",
        "inputMode": "choice-plus-short-text",
        "maxCharacters": 40,
        "sourceSelectionLimit": 1,
        "outputType": "departure-note",
        "outputLabel": "AI根据玩家选择生成",
        "fallbackTemplates": [],
        "ai": {
          "enabled": false,
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
        "items": []
      },
      "expression": {
        "enabled": false,
        "estimatedSeconds": 0,
        "prompt": "",
        "inputMode": "choice-plus-short-text",
        "maxCharacters": 40,
        "sourceSelectionLimit": 1,
        "outputType": "route-reflection",
        "outputLabel": "AI根据玩家选择生成",
        "fallbackTemplates": [],
        "ai": {
          "enabled": false,
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
        "items": []
      },
      "expression": {
        "enabled": false,
        "estimatedSeconds": 0,
        "prompt": "",
        "inputMode": "choice-plus-short-text",
        "maxCharacters": 40,
        "sourceSelectionLimit": 1,
        "outputType": "memory-card",
        "outputLabel": "AI根据玩家选择生成",
        "fallbackTemplates": [],
        "ai": {
          "enabled": false,
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
        "items": []
      },
      "expression": {
        "enabled": false,
        "estimatedSeconds": 0,
        "prompt": "",
        "inputMode": "choice-plus-short-text",
        "maxCharacters": 40,
        "sourceSelectionLimit": 1,
        "outputType": "exhibit-caption",
        "outputLabel": "AI根据玩家选择生成",
        "fallbackTemplates": [],
        "ai": {
          "enabled": false,
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
        "items": []
      },
      "expression": {
        "enabled": false,
        "estimatedSeconds": 0,
        "prompt": "",
        "inputMode": "choice-plus-short-text",
        "maxCharacters": 40,
        "sourceSelectionLimit": 1,
        "outputType": "meeting-summary",
        "outputLabel": "AI根据玩家选择生成",
        "fallbackTemplates": [],
        "ai": {
          "enabled": false,
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
