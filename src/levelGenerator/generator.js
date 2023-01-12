import Types from '../../static/mario/src/types';
import Random from './random';

// Check out: https://www.researchgate.net/publication/220437182_The_2010_Mario_AI_Championship_Level_Generation_Track/download

export default class LevelGenerator {
    height = 15;
    width = 150;
    minX = 5;
    maxX = 147;

    // TODO: some chances should depend on issue state
    CHANCE_BLOCK_POWER_UP = 0.05;
    CHANCE_BLOCK_COIN = 0.3;
    CHANCE_BLOCK_ENEMY = 0.2;
    CHANCE_WINGED = 0.5;
    CHANCE_COIN = 0.2;
    COIN_HEIGHT = 5;
    CHANCE_PLATFORM = 0.1;
    CHANCE_END_PLATFORM = 0.1;
    PLATFORM_HEIGHT = 4;
    CHANCE_ENEMY = 0.15;
    CHANCE_PIPE = 0.1;
    PIPE_MIN_HEIGHT = 2;
    PIPE_HEIGHT = 3.0;
    CHANCE_HILL = 0.1;
    CHANCE_END_HILL = 0.3;
    CHANCE_HILL_ENEMY = 0.3;
    HILL_HEIGHT = 4;
    GAP_LENGTH = 5;
    CHANGE_GAP = 0.1;
    CHANGE_HILL_CHANGE = 0.1;
    GAP_OFFSET = -5;
    GAP_RANGE = 10;
    GROUND_MAX_HEIGHT = 5;

    // constraints
    gapCount = 0;
    turtleCount = 0;
    coinBlockCount = 0;

    constructor(seed, maxGaps = 10, maxTurtles = 7, maxCoinBlocks = 10) {
        this.random = new Random(seed);
        this.maxGaps = maxGaps;
        this.maxTurtles = maxTurtles;
        this.maxCoinBlocks = maxCoinBlocks;
    }

    _addOneEnemy(x, y) {
        // FIXME: check that 2 tiles are available
        let t = Types.AllEnemies[this.random.nextInt(Types.AllEnemies.length)];
        // turtle constraint
        // TODO: add it back with new guys
        // if (t === Types.GreenKoopa || t === Types.RedKoopa)
        //     if (this.turtleCount < this.maxTurtles) this.turtleCount++;
        //     else t = Types.Goomba;

        const winged = this.random.nextFloat() < this.CHANCE_WINGED;
        this.setBlock(x, y, this.getWingedEnemyVersion(t, winged));
    }

    placeBlock(x, y) {
        // choose block type
        if (this.random.nextFloat() < this.CHANCE_BLOCK_POWER_UP) {
            this.setBlock(x, y, Types.PowerUpBox);
        } else if (
            this.random.nextFloat() < this.CHANCE_BLOCK_COIN &&
            this.coinBlockCount < this.maxCoinBlocks
        ) {
            this.setBlock(x, y, Types.CoinBox);
            this.coinBlockCount++;
        } else {
            this.setBlock(x, y, Types.NormalBrick);
        }

        // place enemies
        if (this.random.nextFloat() < this.CHANCE_BLOCK_ENEMY)
            this._addOneEnemy(x, y - 1);
    }

    placePipe(x, y, height) {
        this.setRectangle(x, y - height, 1, height, Types.PipeLeft);
        this.setRectangle(x + 1, y - height, 1, height, Types.PipeRight);
    }

    setGroundHeight(x, y, lastY, nextY) {
        if (x >= this.maxX) y = Math.min(this.height - 2, y);
        this.setRectangle(x, y + 1, 1, this.height - 1 - y, Types.Ground);

        this.setBlock(x, y, Types.Ground);
        if (y < lastY)
            for (let i = y + 1; i <= lastY; i++)
                this.setBlock(x, i, Types.Ground);
        else if (y < nextY)
            for (let i = y + 1; i <= nextY; i++)
                this.setBlock(x, i, Types.Ground);
    }

    clearMap() {
        this.map = new Array(this.width)
            .fill()
            .map(() => new Array(this.height).fill(Types.Blank));
    }

    setBlock(x, y, val) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
        this.map[x][y] = val;
    }

    setRectangle(startX, startY, width, height, val) {
        for (let x = 0; x < width; x++)
            for (let y = 0; y < height; y++)
                this.setBlock(startX + x, startY + y, val);
    }

    getBlock(x, y) {
        return this.map[Math.max(Math.min(x, this.width - 1), 0)][
            Math.max(Math.min(y, this.height - 1), 0)
        ];
    }

    getWingedEnemyVersion(enemy, winged) {
        // No-op for now
        return enemy;
    }

    addFlag() {
        const col = this.map.at(-2);
        let found = false;
        for (let i = col.length - 1; i >= 3; i--)
            if (found || col[i] === Types.Blank) {
                col[i] = Types.FlagPole;
                found = true;
            }
        this.map.at(-3)[3] = Types.Flag;
    }

    addGround() {
        const ground = [];

        // used to place the ground
        let lastY =
            this.GROUND_MAX_HEIGHT +
            Math.floor(
                this.random.nextFloat() *
                    (this.height - 1 - this.GROUND_MAX_HEIGHT),
            );
        let [y, nextY] = [lastY, lastY];
        let justChanged = false;
        let length = 0;
        let landHeight = this.height - 1;

        // place the ground
        for (let x = 0; x < this.width; x++) {
            if (x >= this.maxX) {
                y = this.height - 3;
            } else if (length > this.GAP_LENGTH && y >= this.height) {
                // need more ground
                nextY = landHeight;
                justChanged = true;
                length = 1;
            } else if (
                x > this.minX &&
                this.random.nextFloat() < this.CHANGE_HILL_CHANGE &&
                !justChanged
            ) {
                // adjust ground level
                nextY += Math.floor(
                    this.GAP_OFFSET + this.GAP_RANGE * this.random.nextFloat(),
                );
                nextY = Math.max(Math.min(this.height - 2, nextY), 5);
                justChanged = true;
                length = 1;
            } else if (
                x > this.minX &&
                y < this.height &&
                this.random.nextFloat() < this.CHANGE_GAP &&
                !justChanged &&
                this.gapCount < this.maxGaps
            ) {
                // add a gap
                landHeight = Math.min(this.height - 1, lastY);
                nextY = this.height;
                justChanged = true;
                length = 1;
                this.gapCount++;
            } else {
                length++;
                justChanged = false;
            }

            this.setGroundHeight(x, y, lastY, nextY);
            ground.push(y);
            [lastY, y] = [y, nextY];
        }

        return ground;
    }

    _putPlatformPiece(x, y, h, lastY) {
        if (y === this.height) {
            if (x > 10 && this.random.nextFloat() < this.CHANCE_HILL) {
                y = Math.floor(
                    this.HILL_HEIGHT +
                        this.random.nextFloat() * (h - this.HILL_HEIGHT),
                );
                if (y === lastY - 5) y++;
                this.setBlock(x, y, Types.Platform);
                // for (let i = y + 1; i < h; i++)
                //     this.setBlock(x, i, Types.PlatformBackground);
            }
        } else if (y >= h) {
            // end if hitting a wall
            y = this.height;
        } else if (this.random.nextFloat() < this.CHANCE_END_HILL) {
            this.setBlock(x, y, Types.Platform);
            // for (let i = y + 1; i < h; i++)
            //     this.setBlock(x, i, Types.PlatformBackground);
            y = this.height;
        } else {
            this.setBlock(x, y, Types.Platform);
            // for (let i = y + 1; i < h; i++)
            //     this.setBlock(x, i, Types.PlatformBackground);

            if (this.random.nextFloat() < this.CHANCE_HILL_ENEMY)
                this._addOneEnemy(x, y - 1);
        }
        return y;
    }

    addHills(ground) {
        // non colliding hills
        let y = this.height;
        let lastY = ground[0];
        for (let x = 0, h = ground[x]; x < this.maxX; x++, h = ground[x]) {
            if (h !== this.height) lastY = h;
            else if (y === lastY - 5) y++;
            y = this._putPlatformPiece(x, y, h, lastY);
        }
    }

    addPipes(ground) {
        // pipes
        let lastY = ground[this.minX];
        let lastlastY = ground[this.minX - 1];
        let lastX = 0;
        for (
            let x = this.minX + 1, h = ground[x];
            x < this.maxX;
            x++, h = ground[x]
        ) {
            if (
                this.random.nextFloat() < this.CHANCE_PIPE &&
                h === lastY &&
                lastlastY <= lastY &&
                x > lastX + 1
            ) {
                const height =
                    this.PIPE_MIN_HEIGHT +
                    Math.floor(this.random.nextFloat() * this.PIPE_HEIGHT);
                this.placePipe(x - 1, h, height);
                lastX = x;
            }

            [lastlastY, lastY] = [lastY, h];
        }
    }

    addEnemies(ground) {
        // place enemies
        for (
            let x = this.minX + 1, h = ground[x];
            x < this.maxX;
            x++, h = ground[x]
        )
            if (
                this.random.nextFloat() < this.CHANCE_ENEMY &&
                this.getBlock(x, h - 1) === Types.Blank
            )
                this._addOneEnemy(x, h - 1);
    }

    _firstNonEmpty(ground, col) {
        // find the highest object
        for (let max = 0; max < ground[col]; max++)
            if (this.getBlock(col, max) !== Types.Blank) return max;
        return ground[col];
    }

    // eslint-disable-next-line sonarjs/cognitive-complexity
    addPlatforms(ground) {
        // platforms
        let y = this.height;
        for (let x = 0; x < this.maxX; x++) {
            const max = this._firstNonEmpty(ground, x);
            if (y === this.height) {
                if (
                    x > this.minX &&
                    this.random.nextFloat() < this.CHANCE_PLATFORM
                ) {
                    y = max - this.PLATFORM_HEIGHT;
                    if (y >= 1) this.placeBlock(x, y);
                    else y = this.height;
                }
            } else if (y > max) {
                // end if hitting a wall
                y = this.height;
            } else if (this.random.nextFloat() < this.CHANCE_END_PLATFORM) {
                this.placeBlock(x, y);
                y = this.height;
            } else {
                this.placeBlock(x, y);
            }
        }
    }

    addCoins(ground) {
        // coins
        let y = this.height;
        for (
            let x = this.minX + 1, h = ground[x];
            x < this.maxX;
            x++, h = ground[x]
        ) {
            if (this.random.nextFloat() >= this.CHANCE_COIN) continue;
            y = h - 1 - Math.floor(this.random.nextFloat() * this.COIN_HEIGHT);
            while (
                y > 1 &&
                this.getBlock(x, y + 1) === Types.Blank &&
                this.getBlock(x, y + 2) === Types.Blank
            )
                y--;
            if (this.getBlock(x, y) === Types.Blank)
                this.setBlock(x, y, Types.Coin);
        }
    }

    generateLevel() {
        this.clearMap();

        const ground = this.addGround();
        this.addHills(ground);
        this.addPipes(ground);
        this.addEnemies(ground);
        this.addPlatforms(ground);
        this.addCoins(ground);
        this.addFlag();

        // transpose
        return this.map.reduce(
            (prev, next) =>
                next.map((item, i) => (prev[i] || []).concat(next[i])),
            [],
        );
    }
}
