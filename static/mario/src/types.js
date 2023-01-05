export default class Types {
    // FIXME: clean repeats
    static Blank = 0;
    static Ground = 1;
    static Platform = 1;
    static PlatformBackground = 1;
    static NormalBrick = 1;
    static CoinBox = 2;
    static Coin = 2;
    static PowerUpBox = 3; // flower or mushroom depending on hero state
    static UselessBox = 4;
    static FlagPole = 5;
    static Flag = 6;
    static PipeLeft = 7;
    static PipeRight = 8;
    static Pipe = 9;
    static PipeTopLeft = 9;
    static PipeTopRight = 10;
    static PipeFlower = 10;
    static FlowerBox = 11;
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
        return 1 <= type && type <= 11;
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
