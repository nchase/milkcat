var game = new Phaser.Game(1200, 600, Phaser.AUTO, '', {
  preload: preload,
  create: create,
  update: update
});

var catGroup, cat, milkGroup, milk;
var cursors;
var gameOver;
var timerText;
var paused;
var countDown = 10;
var tick = +new Date();

function preload() {
  game.load.image('cat', 'cat.gif');
  game.load.image('milk', 'milk.png');
}

function create() {
  catGroup = game.add.group();
  cat = catGroup.create(540, 440, 'cat');
  cat.scale.x = 0.5;
  cat.scale.y = 0.5;
  milkGroup = game.add.group();
  milk = milkGroup.create(0, 0, 'milk');
  milkEmitter = game.add.emitter(400, 200, 300)
  milkEmitter.makeParticles('milk');
  milkEmitter.gravity = 2000;
  milkEmitter.maxParticleScale = 0.05;
  milkEmitter.minParticleScale = 0.25;
  timerText = game.add.text(1170, 0, countDown);


  gameOver = new Phaser.Signal()
  gameOver.add(endGame);

  setTimeout(function() {
    milk.anchor.x = 0.5;
    milk.anchor.y = 0.5;
    milk.body.maxVelocity.x = 150;
    milk.body.maxVelocity.y = 150;
    milk.body.collideWorldBounds = true;
    cat.body.collideWorldBounds = true;
    cat.body.width = cat.body.sourceWidth - 100;
    cat.body.height = cat.body.sourceHeight - 40;
    timerText.fill = '#ffffff';
  }, 100);

  game.physics.arcade.enable([milk, cat, milkEmitter]);
  keys = cursors = game.input.keyboard.createCursorKeys();
  keys.space = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
}

function update() {
  if (paused) {
    moveTarget(cat, paused);
    return false;
  }

  var nextTick = +new Date;

  if (nextTick - tick >= 1000) {
    countDown = countDown - 1;
    tick = nextTick;
  }

  handleTimer(countDown);
  handleMove(milk);
  handleCollision(milkEmitter, cat);
  moveTarget(cat);
}

var animateMove = _.throttle(function animateMove(obj) {
  if (!obj.rotation) {
    return obj.rotation = 0.025;
  }

  obj.rotation = obj.rotation * -1;
}, 150);

var animatePour = _.throttle(function animatePour(obj) {
  obj.rotation = 1;

  obj.pouring = true;

  milkEmitter.x = obj.x + (obj.width / 2);
  milkEmitter.y = obj.y;

  milkEmitter.start(true, 0, 100, 4);

  setTimeout(function() {
    obj.rotation = 0;
    obj.pouring = false;
  }, 500);
}, 2000);

function handleMove(obj) {
  if (obj.pouring === true) {
    return false;
  }

  obj.body.velocity.x = 0;
  obj.body.velocity.y = 0;

  if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) {
    animateMove(obj);
  }

  if (cursors.left.isDown) {
    obj.body.velocity.x -= 150;
  }

  if (cursors.right.isDown) {
    obj.body.velocity.x += 150;
  }

  if (cursors.up.isDown) {
    obj.body.velocity.y -= 150;
  }

  if (cursors.down.isDown) {
    obj.body.velocity.y += 150;
  }

  if (keys.space.isDown && !obj.pouring) {
    animatePour(obj);
  }
}


function handleCollision(obj1, obj2) {
  game.physics.arcade.collide(obj1, obj2, function(){

    //

    gameOver.dispatch();
  });
}

var moveTarget = _.throttle(function moveTarget(obj, paused) {
   if (paused) {
     return obj.body.velocity.x = 0;
   }

   if (!obj.body.velocity.x) {
       obj.body.velocity.x = -500;
   }

   if (obj.x === 0 || obj.x === 540) {
     obj.body.velocity.x = obj.body.velocity.x * -1 * _.random(1, 4);
   }
}, 150);


function handleTimer(timerVal) {
  timerText.setText(timerVal)

  if (timerVal <= 0) {
    gameOver.dispatch('Game Over');
  }
}

function endGame(displayText) {
  if (!displayText) {
    displayText = 'You Win';
  }
  paused = true;

  var text = game.add.text(game.world.centerX, game.world.centerY, displayText);
  text.fill = '#ffffff';
};
