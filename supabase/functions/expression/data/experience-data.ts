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
        "adapterId": "huining-join",
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
        "maxCharacters": 80,
        "sourceSelectionLimit": 3,
        "outputType": "exhibition-guide",
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
        "showFragmentReward": false,
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
