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
      "maxItems": 8
    },
    "phases": {
      "briefing": {
        "enabled": true,
        "estimatedSeconds": 12,
        "title": "三路终会合",
        "question": "会师为什么既是长征胜利的标志，也是新的起点？"
      },
      "gameplay": {
        "enabled": true,
        "estimatedSeconds": 60,
        "adapterId": "huining-join",
        "helpAfterFailures": 2,
        "assistAfterFailures": 3
      },
      "sources": {
        "enabled": true,
        "estimatedSeconds": 10,
        "items": [
          {
            "id": "source-huining-oct2-order",
            "title": "关于攻占会宁城及战果的电报",
            "type": "军事电报",
            "date": "1936年10月2日",
            "creator": "彭德怀",
            "summary": "报告红军独立支队攻占会宁城，为后续会师创造条件。",
            "originalExcerpt": "会宁城被我独立支队攻占。",
            "plainExplanation": "会师并非偶然相遇，攻占与控制会宁是经过部署的战略行动。",
            "sourceName": "《会宁县志》附录，转引《白银市志》",
            "sourceUrl": "https://www.huining.gov.cn/mlhn/lsyg/art/2020/art_bf93be81d0f84c1a97b718f73a769286.html",
            "rightsStatus": "pending",
            "activeInGameplay": false,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          },
          {
            "id": "source-huining-oct10-report",
            "title": "关于一、四方面军会合情况的电报",
            "type": "军事电报",
            "date": "1936年10月10日",
            "creator": "子昆",
            "summary": "记录一、四方面军在会宁会合后的现场情绪及燃料困难。",
            "originalExcerpt": "一般指战员情绪很高。",
            "plainExplanation": "电报既呈现胜利会合的振奋，也保留了部队仍需继续解决现实困难的细节。",
            "sourceName": "《会宁县志》附录，转引《白银市志》",
            "sourceUrl": "https://www.huining.gov.cn/mlhn/lsyg/art/2020/art_bf93be81d0f84c1a97b718f73a769286.html",
            "rightsStatus": "pending",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          },
          {
            "id": "source-huining-site-timeline",
            "title": "会宁会师旧址与联欢会址",
            "type": "旧址照片与历史说明",
            "date": "1936年10月9日至10日",
            "creator": "新华网",
            "summary": "会宁会师旧址由会师楼、会师塔、联欢会址等部分组成。",
            "originalExcerpt": "红一、四方面军在会宁县城举行庆祝会师联欢会。",
            "plainExplanation": "会宁是红一、红四方面军会合及举行联欢活动的重要历史现场。",
            "sourceName": "新华网《甘肃会宁：红军会师 中国安宁》",
            "sourceUrl": "https://www.xinhuanet.com/politics/2016-07/25/c_129174163.htm",
            "rightsStatus": "pending",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          },
          {
            "id": "source-jiangtaibao-oct22",
            "title": "将台堡最后会师时间线",
            "type": "党史研究与旧址记录",
            "date": "1936年10月22日",
            "creator": "中国甘肃网",
            "summary": "记录红一、红二方面军在将台堡会师，构成长征胜利会师过程的重要节点。",
            "originalExcerpt": "红一、红二方面军在将台堡会师。",
            "plainExplanation": "三大主力会师不是同一天在同一地点完成，而是由会宁、将台堡等节点共同构成。",
            "sourceName": "中国甘肃网《将台堡：红军长征最后会师地》",
            "sourceUrl": "https://gansu.gscn.com.cn/system/2020/07/19/012425103.shtml",
            "rightsStatus": "pending",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          },
          {
            "id": "source-huining-party-register",
            "title": "红军党员登记表",
            "type": "革命文物",
            "date": "1936年10月",
            "creator": "红军政治机关",
            "summary": "红军撤离会宁时留下的党员登记表后被当地群众保存，现为重要革命文物。",
            "originalExcerpt": "一张登记表连接起部队行军与群众守护。",
            "plainExplanation": "宏大的会师历史也由具体的人、纸张和民间记忆共同保存。",
            "sourceName": "中华人民共和国国防部《会宁会师 长征胜利》",
            "sourceUrl": "https://www.mod.gov.cn/gfbw/tp_214132/tsjs/4878949.html",
            "rightsStatus": "pending",
            "activeInGameplay": false,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          }
        ]
      },
      "expression": {
        "enabled": true,
        "estimatedSeconds": 35,
        "prompt": "从你完成的会师路线、选择的历史碎片和史料出发，为自己的数字展台留下一段讲解。",
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
        "estimatedSeconds": 13,
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
          "transcript": "1936年10月，几条历经艰难的行军路线终于在西北汇聚。请把三路队伍送到正确的会师节点，再用一路获得的碎片搭建属于你的长征展台。",
          "status": "script-ready"
        }
      ],
      "effects": [
        {
          "id": "huining-route-lock",
          "src": null,
          "label": "路线接入"
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
      "enabled": false,
      "title": "本关史料",
      "position": "top-right",
      "maxItems": 8
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
        "enabled": false,
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
      "enabled": false,
      "title": "本关史料",
      "position": "top-right",
      "maxItems": 8
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
        "enabled": false,
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
      "enabled": false,
      "title": "本关史料",
      "position": "top-right",
      "maxItems": 8
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
        "enabled": false,
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
      "enabled": false,
      "title": "本关史料",
      "position": "top-right",
      "maxItems": 8
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
        "enabled": false,
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
      "enabled": false,
      "title": "本关史料",
      "position": "top-right",
      "maxItems": 8
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
        "enabled": false,
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
      "enabled": false,
      "title": "本关史料",
      "position": "top-right",
      "maxItems": 8
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
        "enabled": false,
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
