export default class Types {
    // FIXME: clean repeats
    static Blank = 0;
    static Ground = 1;
    static Platform = 2;
    static NormalBrick = 3;
    static CoinBox = 4;
    static Coin = 5;
    static UselessBox = 6;
    static PowerUpBox = 7; // flower or mushroom depending on hero state
    static PipeLeft = 8;
    static PipeRight = 9;
    static Flag = 10;
    static FlagPole = 11;
    static Vampire = 20;
    static Bear = 21;
    static Troll = 22;
    static Owl = 23;
    static Zombie = 24;
    static Witch = 25;
    static BigFoot = 26;
    static Deer = 27;
    static Donut = 30;
    static Candy = 31;
    static MarioBullet = 40;
    static EnemyBullet = 41;

    static isElement(type) {
        return 1 <= type && type <= 12;
    }

    static isEnemy(type) {
        return 20 <= type && type <= 27;
    }

    static AllEnemies = [
        Types.Vampire,
        Types.Bear,
        Types.Troll,
        Types.Owl,
        Types.Zombie,
        Types.Witch,
        Types.BigFoot,
        Types.Deer,
    ];
}
