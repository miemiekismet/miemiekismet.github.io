var auto_recovery;

// Initializer. BEGIN
d3.json("hero.json", function(hero) {
  initialize(hero);

  function initialize(hero) {
    var hero_base = GetHeroBaseNode();
    var hp_text = hero_base.select(".hp_text");
    SetHeroStatus(hero);
    UpdateHp(hero["HP"]);
    var level = d3.select("#hero_level");
    level.html("Level: " + hero["LEVEL"]);
    var money = d3.select("#hero_money");
    money.html("COIN: $" + hero["MONEY"]);
    var atk = d3.select("#hero_atk");
    atk.html("ATK: " + hero["ATK"]);
    var def = d3.select("#hero_def");
    def.html("DEF: " + hero["DEF"]);

    // Start auto recovery by default.
    StartAutoRecovery();
  }
});

d3.json("level.json", function(level) {
  initialize(level);
  function initialize(level) {
    SetStaticData(level);
  }
});

// Initializer. END

// Hero related get / set. BEGIN
// Hero status.
function GetHeroStatus() {
  return d3.select("#hero_status").node.hero_status;
}
function SetHeroStatus(hero_status) {
  d3.select("#hero_status").node.hero_status = hero_status;
}

// Static data. For initialization...
function GetStaticData() {
  return d3.select("#static_data").node.static_data;
}
function SetStaticData(static_data) {
  return d3.select("#static_data").node.static_data = static_data;
}

// Get node.
function GetHeroBaseNode() {
  return d3.select("#hero_base");
}
// Hero related get / set. END

// Update functions: HP, EXP, MONEY. BEGIN.
function UpdateHp(hero_hp) {
  // Update node.
  var hero_base = GetHeroBaseNode();
  var hero_status = GetHeroStatus();
  hero_status["HP"] = hero_hp;
  // Update hp text.
  var hp_text = hero_base.select(".hp_text");
  hp_text.html("HP: " + hero_status["HP"] + "/" + hero_status["MAX_HP"] + "   ");
  // Repaint hp bar.
  var total_length = 100;
  var left_bar = hero_base.select(".left_bar");
  var right_bar = hero_base.select(".right_bar");
  left_bar.style('width', Math.floor(hero_status["HP"] / hero_status["MAX_HP"] * total_length) + 'px');
  right_bar.style('width', (total_length - Math.floor(hero_status["HP"] / hero_status["MAX_HP"] * total_length)) + 'px');
}

function UpdateMaxHp(hero_max_hp) {
  // Update node.
  var hero_base = GetHeroBaseNode();
  var hero_status = GetHeroStatus();
  hero_status["MAX"] += hero_max_hp;
  // Update hp text.
  var hp_text = hero_base.select(".hp_text");
  hp_text.html("HP: " + hero_status["HP"] + "/" + hero_status["MAX_HP"] + "   ");
  // Repaint hp bar.
  var total_length = 100;
  var left_bar = hero_base.select(".left_bar");
  var right_bar = hero_base.select(".right_bar");
  left_bar.style('width', Math.floor(hero_status["HP"] / hero_status["MAX_HP"] * total_length) + 'px');
  right_bar.style('width', (total_length - Math.floor(hero_status["HP"] / hero_status["MAX_HP"] * total_length)) + 'px');
}

function UpdateExp(exp) {
    var hero_base = GetHeroBaseNode();
    var hero_status = GetHeroStatus();
    hero_status["EXP"] += exp;
    var new_exp = hero_status["EXP"];
    var cur_level = hero_status["LEVEL"];

    var static_data = GetStaticData();
    if (static_data[cur_level + 1] && new_exp >= static_data[cur_level + 1]["EXP"]) {
      hero_status["LEVEL"] += 1;
      UpdateAtk(static_data[cur_level]["ATK"]);
      UpdateDef(static_data[cur_level]["DEF"]);
      hero_status["MAX_HP"] += static_data[cur_level]["HP"];
      hero_status["HP"] = hero_status["MAX_HP"];
      UpdateHp(hero_status["HP"]);

      var level = d3.select("#hero_level");
      level.html("Level: " + hero_status["LEVEL"]);
      alert("LEVEL UP");
    }
}

function GetMoney() {
    var hero_status = GetHeroStatus();
    return hero_status["MONEY"];
}

function UpdateMoney(add) {
    var hero_status = GetHeroStatus();
    var money = d3.select("#hero_money");
    hero_status["MONEY"] += add;
    money.html("Coin: $" + hero_status["MONEY"]);
}

function UpdateAtk(add) {
    var hero_status = GetHeroStatus();
    var atk = d3.select("#hero_atk");
    hero_status["ATK"] += add;
    atk.html("ATK: " + hero_status["ATK"]);
}

function UpdateDef(add) {
    var hero_status = GetHeroStatus();
    var def = d3.select("#hero_def");
    hero_status["DEF"] += add;
    def.html("DEF: " + hero_status["DEF"]);
}

function UpdateItem(type, value) {
  switch (type) {
    case "HP": UpdateMaxHp(value); break;
    case "ATK": UpdateAtk(value); break;
    case "DEF": UpdateDef(value); break;
    default: hero_status[type] += value; break;
  }
}
// Update functions: HP, EXP, MONEY. END.

// Fight related functions. BEGIN.
// Main function.
function Fight(monster, callback) {
  ShowFighting();
  var hero_status = GetHeroStatus();
  var hero_hp = hero_status["HP"];
  var hero_atk = hero_status["ATK"];
  var hero_def = hero_status["DEF"];
  var monster_name = monster.name;
  var monster_hp = monster.value;
  var monster_max_hp = monster.value;
  var monster_atk = monster.atk;
  var win = false;

  UpdateMonster(monster_name, monster_max_hp, monster_max_hp);

  // Start fighting.
  var fight_timer = setInterval(function(){
    monster_hp -= hero_atk;
    MonsterLoseHp(hero_atk);
    // Win.
    if (monster_hp <= 0) {
      UpdateHp(hero_hp);
      win = true;
      clearInterval(fight_timer);
      UpdateExp(monster.value);
      UpdateMoney(Math.floor(monster.value / 2));
      monster.beaten = true;
      // Repaint this map, to get correct color of each monster.
      // TODO: Write a better repaint function, instead of reuse transition.
      callback(monster.parent);
      UpdateMonster(monster_name, monster_max_hp, monster_max_hp);
      StopFighting();
      return;
    }
    hero_hp -= (monster_atk - hero_def) > 0 ? (monster_atk - hero_def) : 0;

    // Lose.
    if (hero_hp <= 0) {
      UpdateHp(0);
      clearInterval(fight_timer);
      // Show death message.
      d3.select("#death_alert")
        .style('opacity', 1)
        .transition()
        .duration(2000)
        .style('opacity', 0);
      UpdateMonster(monster_name, monster_max_hp, monster_max_hp);
      StopFighting();
      return;
    }
    UpdateHp(hero_hp);
    UpdateMonster(monster_name, monster_hp, monster_max_hp);
  }, 750);

  function UpdateMonster(name, hp, max_hp) {
    var layer = d3.select("#fighting_layer");
    var left_bar = layer.select(".left_bar");
    var right_bar = layer.select(".right_bar");
    var monster_hp = layer.select(".hp_text");
    monster_hp.html(name + " HP: " + hp);
    var total_length = 200;
    left_bar.style('width', Math.floor(hp / max_hp * total_length) + 'px');
    right_bar.style('width', (total_length - Math.floor(hp / max_hp * total_length)) + 'px');
  }
}

// Experiment function to show monster losing hp via animation.
function MonsterLoseHp(hp) {
  d3.select("#fighting_layer")
    .append("div")
      .attr({
        cx: 100,
        cy: function(d, i){ return 100; },
        r: 20,
        fill: "orange"
      });

}

function ShowFighting() {
  StopAutoRecovery();
  d3.select("#fighting_layer")
    .classed("fighting", true);
}

function StopFighting() {
  StartAutoRecovery();
  d3.select("#fighting_layer")
    .classed("fighting", false);
}

function StartAutoRecovery() {
  auto_recovery = setInterval(function(){
      var hero_status = GetHeroStatus();
      if (hero_status["HP"] < hero_status["MAX_HP"]) {
        hero_status["HP"] += Math.ceil(hero_status["MAX_HP"] / 20);
        UpdateHp(hero_status["HP"]);
      }
    }, 3000);
}

function StopAutoRecovery() {
  clearInterval(auto_recovery);
}
// Fighting related functions. END.

function Purchase(item, callback) {
  if (GetMoney() >= item.value) {
    UpdateMoney(0 - item.value);
    item.value = Math.floor(item.value * 1.5);
    UpdateItem(item["ITEM_TYPE"], item["ITEM_VALUE"])
    // Repaint this map, to get correct price of each item.
    // TODO: Write a better repaint function, instead of reuse transition.
    callback(item.parent);
  }
}