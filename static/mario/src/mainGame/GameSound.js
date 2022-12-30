export default class GameSound {
    sounds = {
        coin: new Audio('sounds/coin.wav'),
        powerUpAppear: new Audio('sounds/power-up-appear.wav'),
        powerUp: new Audio('sounds/power-up.wav'),
        marioDie: new Audio('sounds/mario-die.wav'),
        killEnemy: new Audio('sounds/kill-enemy.wav'),
        stageClear: new Audio('sounds/stage-clear.wav'),
        bullet: new Audio('sounds/bullet.wav'),
        powerDown: new Audio('sounds/power-down.wav'),
        jump: new Audio('sounds/jump.wav'),
    };

    play(element) {
        const sound = this.sounds[element];
        sound.pause();
        sound.currentTime = 0;
        sound.play();
    }
}
