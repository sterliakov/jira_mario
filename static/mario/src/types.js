export default class Types {
    // FIXME: clean repeats
    static Blank = 0;
    static Ground = 1;
    static Platform = 2;
    static PlatformBackground = 50; // FIXME: remove it?
    static NormalBrick = 3;
    static CoinBox = 4;
    static Coin = 5;
    static UselessBox = 6;
    static PowerUpBox = 7; // flower or mushroom depending on hero state
    static PipeLeft = 8;
    static PipeRight = 9;
    static Flag = 10;
    static FlagPole = 11;
    // static Pipe = 9;
    // static PipeTopLeft = 9;
    // static PipeTopRight = 10;
    // static PipeFlower = 10;
    static FlowerBox = 12; // fake?
    static Enemy = 20;
    static Goomba = 20;
    static GreenKoopa = 20;
    static RedKoopa = 20;
    static Spiky = 20;
    static Mushroom = 30;
    static Flower = 31;
    static Bullet = 40;
    static BulletBill = 50; // FIXME: not used at all

    static isElement(type) {
        return 1 <= type && type <= 12;
    }

    static isEnemy(type) {
        return type === Types.Enemy;
    }

    static AllEnemies = [
        Types.Goomba,
        Types.GreenKoopa,
        Types.RedKoopa,
        Types.Spiky,
    ];
}
