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
        "sourceIds": [
          "source-huining-hoof-march",
          "source-huining-staged-arrival",
          "source-jiangtaibao-oct22",
          "source-xinglong-oct23"
        ],
        "helpAfterFailures": 2,
        "assistAfterFailures": 3,
        "tutorial": {
          "enabled": true,
          "autoShow": true,
          "title": "会宁会师 · 玩法提示",
          "steps": [
            {
              "title": "先完成马蹄裹布",
              "text": "依次点击四只马蹄，把裹蹄布固定好，完成15至20秒的隐蔽奔袭开场。",
              "anchor": ".huining-hoof-grid"
            },
            {
              "title": "先选队伍，再选节点",
              "text": "进入地图后，先点击一支红军队伍，再点击它应抵达的会师节点；也可以直接拖动。",
              "anchor": ".huining-route-layout"
            },
            {
              "title": "最后复原时间线并组展",
              "text": "按日期排列四个会师节点，然后选择最多三块碎片和一个主题，组成个人数字展台。",
              "anchor": ".huining-timeline-board"
            }
          ]
        }
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
            "activeInGameplay": true,
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
        "prompt": "回望七关史料、一路获得的碎片和自己的选择，你最想把怎样的长征记忆带走？",
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
        },
        "artwork": {
          "enabled": true,
          "provider": "aihubmix",
          "model": "qwen-image-2.0",
          "nameMaxCharacters": 20,
          "fallbackImage": "assets/levels/huining-join/reunion-painting.png"
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
        "sourceIds": [
          "source-luding-strategic-telegram",
          "source-luding-historic-iron-chains"
        ],
        "helpAfterFailures": 2,
        "assistAfterFailures": 3,
        "tutorial": {
          "enabled": true,
          "autoShow": true,
          "title": "飞夺泸定桥 · 玩法提示",
          "steps": [
            {
              "title": "先读铁索照片",
              "text": "开场照片解释桥面险境。点击“开始行动”后，先拖动突击队员完成报名。",
              "anchor": ".bridge-intro-source"
            },
            {
              "title": "点击前进，也能左右躲避",
              "text": "过桥时点击“前进”；攻击箭头向左就点右躲，向右就点左躲，不需要键盘。",
              "anchor": "#bridge-controls"
            },
            {
              "title": "失败可以立即重来",
              "text": "本关强调极限时间中的协作，不会因一次失误中断整体体验。",
              "anchor": "#bridge-caption"
            }
          ]
        }
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
          },
          {
            "id": "source-luding-historic-iron-chains",
            "title": "泸定桥铁索历史照片",
            "type": "历史照片",
            "date": "具体拍摄时间待审核",
            "creator": "具体摄影者待审核",
            "summary": "照片呈现泸定桥铁索结构，为游戏开场理解桥面木板被拆后的危险提供视觉线索。",
            "plainExplanation": "这张照片在游戏开场直接参与判断；具体拍摄时间、摄影者和馆藏仍需项目审核。",
            "sourceName": "项目资料库（具体出处与馆藏待审核）",
            "rightsStatus": "pending",
            "image": "/assets/levels/luding-bridge/reference/historic-iron-chains.jpg",
            "imageAlt": "泸定桥铁索历史照片",
            "imageCaption": "游戏开场使用的铁索历史照片；著录与授权状态待审核。",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": false
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
      "model": "/assets/fragments/models/luding-chain.glb",
      "fallbackImage": "/assets/fragments/fallbacks/luding-chain.webp",
      "legacyVisualId": "iron-chain-fragment",
      "historicalMeaning": "以象征性数字铁索表现泸定桥的险境与突击队打开北上通道的行动。",
      "sourceIds": [
        "source-luding-strategic-telegram",
        "source-luding-historic-iron-chains"
      ],
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
        "sourceIds": [
          "source-ruijin-secret-assembly",
          "source-ruijin-secret-march",
          "source-ruijin-yudu-crossing"
        ],
        "helpAfterFailures": 2,
        "assistAfterFailures": 3,
        "tutorial": {
          "enabled": true,
          "autoShow": true,
          "title": "瑞金出发 · 玩法提示",
          "steps": [
            {
              "title": "先读本幕任务",
              "text": "每一幕左侧会说明历史情境和行动目标，先看清要保护什么、避开什么。",
              "anchor": ".historical-mission__story"
            },
            {
              "title": "直接点击完成操作",
              "text": "点击场景中的物资、隐蔽按钮或渡口接应按钮，不需要键盘也能完成全部行动。",
              "anchor": ".historical-mission__task"
            },
            {
              "title": "史料随时可查",
              "text": "右上角“本关史料”收录了本幕使用的历史依据；关闭抽屉后可继续当前任务。",
              "anchor": ".level-source-drawer__launcher"
            }
          ]
        }
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
            "activeInGameplay": false,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          },
          {
            "id": "source-ruijin-secret-assembly",
            "title": "《为什么30万人能保守一个秘密》",
            "type": "专题史料文章",
            "date": "1934年10月",
            "creator": "中央纪委国家监委网站",
            "summary": "文章以中央红军秘密集结和转移为线索，说明大规模行动中的群众守密与组织协同。",
            "plainExplanation": "游戏第一幕据此呈现机要、通信和医疗物资在秘密集结中的作用。",
            "sourceName": "中央纪委国家监委网站",
            "sourceUrl": "https://www.bjsupervision.gov.cn/ywyl/201712/t20171207_46251.html",
            "rightsStatus": "pending",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": false
          },
          {
            "id": "source-ruijin-secret-march",
            "title": "《长征源头话薪传》",
            "type": "专题史料文章",
            "date": "1934年10月",
            "creator": "中央纪委国家监委网站",
            "summary": "文章回顾中央红军在群众掩护下向于都秘密集结、隐蔽转移的历史过程。",
            "plainExplanation": "游戏第二幕据此设置夜间行军、及时隐蔽和避免暴露集结方向。",
            "sourceName": "中央纪委国家监委网站",
            "sourceUrl": "https://m.ccdi.gov.cn/content/f0/46/12025.html",
            "rightsStatus": "pending",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": false
          },
          {
            "id": "source-ruijin-yudu-crossing",
            "title": "《于都河畔：万里长征从这里出发》",
            "type": "地方史料文章",
            "date": "1934年10月17日至20日",
            "creator": "于都县人民政府",
            "summary": "资料记述中央红军主力从于都多个渡口陆续渡河、开始战略转移的过程。",
            "plainExplanation": "游戏第三幕据此呈现渡口联络、分批接应和四天四夜渡河。",
            "sourceName": "于都县人民政府",
            "sourceUrl": "https://www.yudu.gov.cn/yudu/ydrw/202102/3f856d547c974b18afb023350581f9b0.shtml",
            "rightsStatus": "pending",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": false
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
      "name": "夜行马灯",
      "model": "/assets/fragments/models/ruijin-lantern.glb",
      "fallbackImage": "/assets/fragments/fallbacks/ruijin-lantern.webp",
      "legacyVisualId": "departure-map-fragment",
      "historicalMeaning": "以象征性数字马灯表现夜间集结、守密与从中央苏区出发。",
      "sourceIds": [
        "source-ruijin-action-schedule",
        "source-ruijin-yudu-crossing"
      ],
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
        "sourceIds": [
          "source-sidu-military-telegrams",
          "source-sidu-route-first",
          "source-sidu-route-second",
          "source-sidu-route-third",
          "source-sidu-route-fourth"
        ],
        "helpAfterFailures": 2,
        "assistAfterFailures": 3,
        "tutorial": {
          "enabled": true,
          "autoShow": true,
          "title": "四渡赤水 · 玩法提示",
          "steps": [
            {
              "title": "路线会连续改变",
              "text": "四次渡河按真实时间顺序展开；每一小关先读左侧日期、地点和行动目的。",
              "anchor": ".level-panel"
            },
            {
              "title": "拖动红军标志",
              "text": "把红军标志拖到地图上闪烁的渡口。放错会回到起点，可以马上重新判断。",
              "anchor": "#marker"
            },
            {
              "title": "不要把往返理解成犹豫",
              "text": "右上角军委电报帮助理解：路线改变是在敌情变化中重新争取主动。",
              "anchor": ".level-source-drawer__launcher"
            }
          ]
        }
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
          },
          {
            "id": "source-sidu-route-first",
            "title": "一渡赤水河路线图",
            "type": "历史路线研究图示",
            "date": "图示时段：1935年1月19日至2月19日",
            "creator": "编绘者待审核",
            "summary": "路线图并列标示红军行动方向、敌军部署与川滇黔交界地区的主要节点，帮助理解第一次渡河所处的整体战局。",
            "plainExplanation": "先看红色行动路线，再对照蓝色敌军调动：渡河不是孤立动作，而是摆脱围堵、寻找新行动空间的一环。",
            "sourceName": "用户提供的四渡赤水路线图组（具体编绘、出版与收藏信息待审核）",
            "rightsStatus": "pending",
            "image": "/assets/levels/sidu-chishui/sources/sidu-route-01.png",
            "imageAlt": "一渡赤水河路线图，标示红军行动路线与敌军部署",
            "imageCaption": "图中时间为该图标注的战局范围，不等同于单次渡河动作持续时间；具体编绘信息待审核。",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          },
          {
            "id": "source-sidu-route-second",
            "title": "二渡赤水河路线图",
            "type": "历史路线研究图示",
            "date": "图示时段：1935年2月18日至3月11日",
            "creator": "编绘者待审核",
            "summary": "路线图呈现二渡前后红军往返赤水河、重新进入黔北以及敌军跟随调整的空间关系。",
            "plainExplanation": "路线看似折返，实际是在敌情变化中寻找薄弱处，并重新争取行动主动。",
            "sourceName": "用户提供的四渡赤水路线图组（具体编绘、出版与收藏信息待审核）",
            "rightsStatus": "pending",
            "image": "/assets/levels/sidu-chishui/sources/sidu-route-02.png",
            "imageAlt": "二渡赤水河路线图，标示红军与敌军行动方向",
            "imageCaption": "建议放大后结合右上角图例阅读红军行动方向与敌军调动；具体编绘信息待审核。",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          },
          {
            "id": "source-sidu-route-third",
            "title": "三渡赤水河路线图",
            "type": "历史路线研究图示",
            "date": "图示时段：1935年3月11日至19日",
            "creator": "编绘者待审核",
            "summary": "路线图突出三渡阶段红军在遵义、仁怀、茅台周边的行动与敌军兵力分布，用于观察短时间内的方向变化。",
            "plainExplanation": "第三次渡河继续调动追兵，使对手难以判断红军下一步真正的行动方向。",
            "sourceName": "用户提供的四渡赤水路线图组（具体编绘、出版与收藏信息待审核）",
            "rightsStatus": "pending",
            "image": "/assets/levels/sidu-chishui/sources/sidu-route-03.png",
            "imageAlt": "三渡赤水河路线图，标示遵义至赤水河流域的行动路线",
            "imageCaption": "图中红、蓝路线分别表现不同部队的行动与调动关系；具体编绘信息待审核。",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          },
          {
            "id": "source-sidu-route-fourth",
            "title": "四渡赤水路线图",
            "type": "历史路线研究图示",
            "date": "图示时段：1935年3月20日至4月9日",
            "creator": "编绘者待审核",
            "summary": "总图呈现第四次渡河及后续南下机动的主要方向，是理解四次路线变化如何连成完整战略行动的收束材料。",
            "plainExplanation": "把它与前三张图连起来看，才能理解反复渡河并非重复，而是连续改变对手判断、创造转移空间。",
            "sourceName": "用户提供的四渡赤水路线图组（具体编绘、出版与收藏信息待审核）",
            "rightsStatus": "pending",
            "image": "/assets/levels/sidu-chishui/sources/sidu-route-04.png",
            "imageAlt": "四渡赤水路线图，标示第四次渡河及后续行动方向",
            "imageCaption": "当前图片清晰度较低，保留原图用于路线组完整展示，后续应替换为同版高清图。",
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
      "name": "行军罗盘",
      "model": "/assets/fragments/models/sidu-compass.glb",
      "fallbackImage": "/assets/fragments/fallbacks/sidu-compass.webp",
      "legacyVisualId": "chishui-maneuver-fragment",
      "historicalMeaning": "以象征性数字罗盘表现四次渡河中的路线调整与机动作战。",
      "sourceIds": [
        "source-sidu-military-telegrams"
      ],
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
        "sourceIds": [
          "source-snow-grassland-manuscript",
          "source-snow-xiong-qiwen-letter"
        ],
        "helpAfterFailures": 2,
        "assistAfterFailures": 3,
        "tutorial": {
          "enabled": true,
          "autoShow": true,
          "title": "雪山草地 · 玩法提示",
          "steps": [
            {
              "title": "先看情境，再做选择",
              "text": "每个场景会说明极端环境中的具体困难；点击物品或答案完成取舍。",
              "anchor": "#qTask"
            },
            {
              "title": "遇到家书要读材料",
              "text": "熊启文家书环节不是常识题，要根据家书内容判断最能体现队伍精神的一项。",
              "anchor": ".archive-letter-stage"
            },
            {
              "title": "点击操作贯穿全关",
              "text": "多选题确认、单选题作答和敲击暗号都可直接点击，不依赖键盘。",
              "anchor": "#interact"
            }
          ]
        }
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
          },
          {
            "id": "source-snow-xiong-qiwen-letter",
            "title": "熊启文致父母及幺叔的信",
            "type": "红军战士家书",
            "date": "1935年3月19日",
            "creator": "熊启文",
            "summary": "红四方面军第九军战士熊启文在家书中牵挂亲人，也写到红军官兵平等和革命信念。",
            "plainExplanation": "这封家书直接出现在游戏判断环节，让玩家从一个具体人的文字理解队伍关系和精神信念。",
            "sourceName": "中国国家博物馆长征主题馆藏专题",
            "sourceUrl": "https://www.chnmuseum.cn/portals/0/web/zt/20160922longmarch/",
            "rightsStatus": "pending",
            "image": "/embedded/snow-grassland/assets/xiong-qiwen-letter-1935.jpg",
            "imageAlt": "熊启文于1935年3月19日写给父母及幺叔的家书",
            "imageCaption": "熊启文致父母及幺叔的信，1935年3月19日，纸本；馆藏信息据中国国家博物馆专题页。",
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
      "name": "信念红星",
      "model": "/assets/fragments/models/snow-star.glb",
      "fallbackImage": "/assets/fragments/fallbacks/snow-star.webp",
      "legacyVisualId": "snow-grass-fragment",
      "historicalMeaning": "以象征性数字红星表现雪山草地极端环境中的坚持与互助；后续可替换为人物事件相关模型。",
      "sourceIds": [
        "source-snow-grassland-manuscript",
        "source-snow-xiong-qiwen-letter"
      ],
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
        "sourceIds": [
          "source-xiangjiang-operation-map",
          "source-xiangjiang-breakthrough-report",
          "source-xiangjiang-guangxi-history"
        ],
        "helpAfterFailures": 2,
        "assistAfterFailures": 3,
        "tutorial": {
          "enabled": true,
          "autoShow": true,
          "title": "湘江血战 · 玩法提示",
          "steps": [
            {
              "title": "看目标，也看危险",
              "text": "每一幕先读任务说明；敌机、炮火和救护呼叫出现时，画面会给出明显提示。",
              "anchor": ".historical-mission__story"
            },
            {
              "title": "点击完成抢修与调度",
              "text": "点击浮桥节点、选择安全通道或响应救护目标；操作失误后可以立即重试。",
              "anchor": ".historical-mission__task"
            },
            {
              "title": "理解突破的代价",
              "text": "每幕结束会出现史实节点与史料依据，它们不是考试答案，而是解释你刚才行动的历史背景。",
              "anchor": ".historical-mission__source"
            }
          ]
        }
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
          },
          {
            "id": "source-xiangjiang-breakthrough-report",
            "title": "《湘江突围：长征中最为惨烈的战役》",
            "type": "专题史料文章",
            "date": "1934年11月27日至12月1日",
            "creator": "新华社（中央网信办转载）",
            "summary": "资料回顾湘江战役的渡江、阻击与惨重损失，说明浮桥和渡口为何成为行动关键。",
            "plainExplanation": "游戏第一幕据此设置敌机轰炸间隙中的浮桥抢修。",
            "sourceName": "中央网信办转载新华社",
            "sourceUrl": "https://www.cac.gov.cn/2016-08/19/c_1119421570.htm",
            "rightsStatus": "pending",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": false
          },
          {
            "id": "source-xiangjiang-guangxi-history",
            "title": "《红军长征过广西》",
            "type": "党史专题文章",
            "date": "1934年11月至12月",
            "creator": "中共中央党史和文献研究院",
            "summary": "资料梳理红军长征经过广西及湘江战役中的渡江、阻击和伤员救护等历史过程。",
            "plainExplanation": "游戏第二、三幕据此呈现阻击部队争取渡江窗口，以及担架队转移伤员。",
            "sourceName": "中共中央党史和文献研究院",
            "sourceUrl": "https://www.dswxyjy.org.cn/n1/2026/0702/c244516-40752274.html",
            "rightsStatus": "pending",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": false
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
      "name": "渡江军号",
      "model": "/assets/fragments/models/xiangjiang-bugle.glb",
      "fallbackImage": "/assets/fragments/fallbacks/xiangjiang-bugle.webp",
      "legacyVisualId": "river-crossing-fragment",
      "historicalMeaning": "以象征性数字军号表现湘江战场上的号令、抢渡与队伍协同。",
      "sourceIds": [
        "source-xiangjiang-operation-map",
        "source-xiangjiang-breakthrough-report"
      ],
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
        "sourceIds": [
          "source-zunyi-record-summary",
          "source-zunyi-chenyun-manuscript",
          "source-zunyi-leadership-adjustment"
        ],
        "helpAfterFailures": 2,
        "assistAfterFailures": 3,
        "tutorial": {
          "enabled": true,
          "autoShow": true,
          "title": "遵义转折 · 玩法提示",
          "steps": [
            {
              "title": "你是会议小记录员",
              "text": "先跟随画面了解危机，再从发言中找出会议真正要解决的问题。",
              "anchor": ".zunyi-room"
            },
            {
              "title": "选择重点并收好史料",
              "text": "每次发言选择一个记录重点；判断正确后，把出现的史料卡收进记录夹。",
              "anchor": ".zunyi-record-game"
            },
            {
              "title": "区分原件与整理卡",
              "text": "右上角抽屉会标明哪些是手稿或决议影印件，哪些是项目制作的历史事实整理卡。",
              "anchor": ".level-source-drawer__launcher"
            }
          ]
        }
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
            "activeInGameplay": false,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          },
          {
            "id": "source-zunyi-record-summary",
            "title": "《关于反对敌人五次“围剿”的总结的决议》",
            "type": "决议文献影印件",
            "date": "1935年2月",
            "creator": "中共中央政治局",
            "summary": "决议总结第五次反“围剿”和长征初期失利的教训，成为游戏中判断“为什么必须总结失败”的材料。",
            "originalExcerpt": "党在揭发了这种错误之后，不是削弱而是加强了。",
            "plainExplanation": "发现和说明错误，是为了重新凝聚队伍并找到更符合实际的办法。",
            "sourceName": "中央档案馆藏相关决议文献（具体著录待项目审核）",
            "rightsStatus": "pending",
            "image": "/assets/levels/zunyi-turn/source/zunyi-record-summary-cover.jpg",
            "imageAlt": "关于反对敌人五次围剿的总结的决议封面影印图",
            "imageCaption": "游戏内使用的决议文献影印图；正式展陈前需复核题名、日期与馆藏著录。",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          },
          {
            "id": "source-zunyi-chenyun-manuscript",
            "title": "《（乙）遵义政治局扩大会议》（陈云手稿）",
            "type": "会议记录手稿",
            "date": "1935年",
            "creator": "陈云",
            "summary": "手稿记录会议对第五次反“围剿”和西征中军事指挥经验教训的检阅。",
            "originalExcerpt": "检阅在反对五次‘围剿’中与西征中军事指挥上的经验与教训。",
            "plainExplanation": "这份材料帮助玩家把会议讨论与当时最紧迫的军事指挥问题联系起来。",
            "sourceName": "中央档案馆藏《（乙）遵义政治局扩大会议》手稿（著录待复核）",
            "rightsStatus": "pending",
            "image": "/assets/levels/zunyi-turn/meeting-manuscript.png",
            "imageAlt": "陈云关于遵义政治局扩大会议的手稿影印图",
            "imageCaption": "游戏内会议记录环节使用的手稿影印图；授权状态待审核。",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": true
          },
          {
            "id": "source-zunyi-leadership-adjustment",
            "title": "遵义会议后的重要组织调整",
            "type": "历史事实整理卡",
            "date": "1935年1月后",
            "creator": "项目史料整理",
            "summary": "整理卡说明会议增选毛泽东为中央政治局常委，并推动军事指挥领导工作的调整。",
            "plainExplanation": "这是根据相关史实制作的教学解释卡，不是历史原件；用于帮助玩家理解组织和指挥方式的调整。",
            "sourceName": "根据遵义会议相关史实整理（引用依据待史实审核补全）",
            "rightsStatus": "pending",
            "image": "/assets/levels/zunyi-turn/zunyi-leadership-adjustment-detail.jpg",
            "imageAlt": "遵义会议后重要组织调整的教学整理图",
            "imageCaption": "项目制作的历史事实整理卡，不作为原始文献使用。",
            "activeInGameplay": true,
            "visibleInSourceDrawer": true,
            "availableForAiExpression": false
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
      "name": "会议钢笔",
      "model": "/assets/fragments/models/zunyi-pen.glb",
      "fallbackImage": "/assets/fragments/fallbacks/zunyi-pen.webp",
      "legacyVisualId": "direction-fragment",
      "historicalMeaning": "以象征性数字钢笔表现会议记录、总结问题与重新作出战略判断。",
      "sourceIds": [
        "source-zunyi-record-summary",
        "source-zunyi-chenyun-manuscript"
      ],
      "narrationAudioId": null,
      "hotspots": []
    }
  }
};
