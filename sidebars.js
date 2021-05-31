module.exports = {
  "mainSidebar": [
    {
      "type": "category",
      "label": "Getting Started",
      "items": [
        "start/intro",
        "start/installation",
        "start/first-function"
      ] 
    },
    {
      "type": "category",
      "label": "Features",
      "collapsed": false,
      "items": [
        "features/commands",
        "features/functions",
        "features/selectors",
        "features/objectives",
        "features/variables",
        "features/coordinates",
        "features/nbt",
        {
          "type": "category",
          "label": "Resources",
          "collapsed": false,
          "items": [
            "features/resources/advancements",
            "features/resources/loot_tables",
            "features/resources/predicates",
            "features/resources/recipes",
          ]
        }
      ]
    }
  ]
};
