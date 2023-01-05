import Types from '../../static/mario/src/types';
import Random from './random';

// FIXME: refactor to fit complexity limits
/* eslint-disable sonarjs/cognitive-complexity */
export default class LevelGenerator {
    ODDS_STRAIGHT = 0;
    ODDS_HILL_STRAIGHT = 1;
    ODDS_TUBES = 2;
    ODDS_JUMP = 3;

    totalOdds = 0;

    height = 15;
    width = 150;

    constructor(seed, type, difficulty) {
        this.random = new Random(seed);
        this.type = type ?? this.random.nextInt(3);
        this.difficulty = difficulty ?? this.random.nextInt(5);
        this.clearMap();
    }

    clearMap() {
        this.odds = [0, 0, 0, 0];
        this.map = new Array(this.width)
            .fill()
            .map(() => new Array(this.height).fill(Types.Blank));
    }

    setBlock(x, y, val) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
        this.map[x][y] = val;
    }

    getBlock(x, y) {
        return this.map[Math.max(Math.min(x, this.width - 1), 0)][
            Math.max(Math.min(y, this.height - 1), 0)
        ];
    }

    buildZone(x, maxLength) {
        const t = this.random.nextInt(this.totalOdds);
        let type = 0; // indexMin(odds)
        for (let i = 0; i < this.odds.length; i++)
            if (this.odds[i] <= t) type = i;

        switch (type) {
            case this.ODDS_STRAIGHT:
                return this.buildStraight(x, maxLength, false);
            case this.ODDS_HILL_STRAIGHT:
                return this.buildHillStraight(x, maxLength);
            case this.ODDS_TUBES:
                return this.buildTubes(x, maxLength);
            case this.ODDS_JUMP:
                return this.buildJump(x, maxLength);
            default:
                return 0;
        }
    }

    buildJump(xo, maxLength) {
        const js = this.random.nextInt(4) + 2;
        const jl = this.random.nextInt(2) + 2;
        const length = js * 2 + jl;

        let hasStairs = this.random.nextInt(3) === 0;

        const floor = this.height - 1 - this.random.nextInt(4);
        for (let x = xo; x < xo + length; x++) {
            if (x >= xo + js && x <= xo + length - js - 1) continue;

            for (let y = 0; y < this.height; y++)
                if (
                    y >= floor ||
                    (hasStairs &&
                        ((x < xo + js && y >= floor - (x - xo) + 1) ||
                            y >= floor - (xo + length - x) + 2))
                )
                    this.setBlock(x, y, Types.Ground);
        }

        return length;
    }

    buildHillStraight(xo, maxLength) {
        const length = Math.min(this.random.nextInt(10) + 10, maxLength);

        const floor = this.height - 1 - this.random.nextInt(4);
        for (let x = xo; x < xo + length; x++)
            for (let y = floor; y < this.height; y++)
                this.setBlock(x, y, Types.Ground);

        this.addEnemyLine(xo + 1, xo + length - 1, floor - 1);

        let h = floor;
        let keepGoing = true;

        let occupied = new Array(length).fill(false);
        while (keepGoing) {
            h = h - 2 - this.random.nextInt(3);
            if (h <= 0) break;

            const l = this.random.nextInt(5) + 3;
            const xxo = this.random.nextInt(length - l - 2) + xo + 1;

            if (
                occupied[xxo - xo] ||
                occupied[xxo - xo + l] ||
                occupied[xxo - xo - 1] ||
                occupied[xxo - xo + l + 1]
            )
                break;

            occupied[xxo - xo] = true;
            occupied[xxo - xo + l] = true;
            this.addEnemyLine(xxo, xxo + l, h - 1);
            if (this.random.nextInt(4) === 0) {
                this.decorate(xxo - 1, xxo + l + 1, h);
                keepGoing = false;
            }
            for (let x = xxo; x < xxo + l; x++)
                for (let y = h; y < floor; y++) {
                    if (this.getBlock(x, y) !== Types.Empty) continue;
                    let yy = y === h ? 8 : 9;
                    if (yy === 8) this.setBlock(x, y, Types.Platform);
                    else this.setBlock(x, y, Types.PlatformBackground);
                }
        }

        return length;
    }

    getWingedEnemyVersion(enemy, winged) {
        // No-op for now
        return enemy;
    }

    addEnemyLine(x0, x1, y) {
        let numSkipped = 0;
        for (let x = x0; x < x1; x++) {
            if (this.random.nextInt(35) >= this.difficulty + numSkipped) {
                numSkipped++;
                continue;
            }

            let type =
                this.difficulty < 1
                    ? 0
                    : this.difficulty < 3
                    ? 1 + this.random.nextInt(Types.AllEnemies.length - 1)
                    : this.random.nextInt(Types.AllEnemies.length);
            this.setBlock(
                x,
                y,
                this.getWingedEnemyVersion(
                    Types.AllEnemies[type],
                    this.random.nextInt(35) < this.difficulty,
                ),
            );
        }
    }

    buildTubes(xo, maxLength) {
        const length = Math.min(this.random.nextInt(10) + 5, maxLength);

        let floor = this.height - 1 - this.random.nextInt(4);
        let xTube = xo + 1 + this.random.nextInt(4);
        let tubeHeight = floor - this.random.nextInt(2) - 2;
        for (let x = xo; x < xo + length; x++) {
            if (x >= xTube) {
                xTube += 3 + this.random.nextInt(4);
                tubeHeight = floor - this.random.nextInt(2) - 2;
            }
            if (xTube >= xo + length - 2) xTube += 10;

            let tubeType =
                x === xTube && this.random.nextInt(11) < this.difficulty + 1
                    ? Types.PipeFlower
                    : Types.Pipe;

            if (x === xTube || x === xTube + 1)
                for (let y = tubeHeight; y < floor; y++)
                    this.setBlock(x, y, tubeType);

            for (let y = floor; y < this.height; y++)
                this.setBlock(x, y, Types.Ground);
        }

        return length;
    }

    buildStraight(xo, maxLength, safe) {
        let length = Math.min(
            safe ? 10 + this.random.nextInt(5) : this.random.nextInt(10) + 2,
            maxLength,
        );

        const floor = this.height - 1 - this.random.nextInt(4);
        for (let x = xo; x < xo + length; x++)
            for (let y = floor; y < this.height; y++)
                this.setBlock(x, y, Types.Ground);

        if (!safe && length > 5) this.decorate(xo, xo + length, floor);
        return length;
    }

    decorate(x0, x1, floor) {
        if (floor < 1) return;

        let rocks = true;
        this.addEnemyLine(x0 + 1, x1 - 1, floor - 1);

        let s = this.random.nextInt(4);
        let e = this.random.nextInt(4);

        if (floor - 3 > 0 && x1 - 1 - e - (x0 + 1 + s) > 1)
            for (let x = x0 + 1 + s; x < x1 - 1 - e; x++)
                this.setBlock(
                    x,
                    floor - 3,
                    this.random.nextInt(3) === 0
                        ? Types.NormalBrick
                        : Types.Coin,
                );

        s = this.random.nextInt(4);
        e = this.random.nextInt(4);

        if (floor - 4 <= 0 || x1 - 1 - e - (x0 + 1 + s) <= 2) return;

        let hasPowerUp = 0;
        for (let x = x0 + 1 + s; x < x1 - 1 - e; x++) {
            if (!rocks) continue;

            let type = Types.Coin;
            if (x !== x0 + 1 && x !== x1 - 2 && this.random.nextInt(3) <= 1)
                type = Types.NormalBrick;
            else if (
                this.random.nextInt(9) === 0 &&
                !hasPowerUp++ &&
                this.getBlock(x, floor - 8) === Types.Blank
            )
                type = Types.PowerUpBox;

            this.setBlock(x, floor - 6, type);
        }
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

    generateLevel() {
        this.clearMap();

        this.odds[this.ODDS_STRAIGHT] = 20;
        this.odds[this.ODDS_HILL_STRAIGHT] = 10;
        this.odds[this.ODDS_TUBES] = 2 + 1 * this.difficulty;
        this.odds[this.ODDS_JUMP] = 2 * this.difficulty;

        if (this.type > 0) this.odds[this.ODDS_HILL_STRAIGHT] = 0;

        for (let i = 0; i < this.odds.length; i++) {
            if (this.odds[i] < 0) this.odds[i] = 0;
            this.totalOdds += this.odds[i];
            this.odds[i] = this.totalOdds - this.odds[i];
        }

        let length = this.buildStraight(0, this.width, true);
        while (length < this.width)
            length += this.buildZone(length, this.width - length);

        const floor = this.height - 1 - this.random.nextInt(4);
        for (let x = length; x < this.width; x++)
            for (let y = floor; y < this.height; y++)
                this.setBlock(x, y, Types.Ground);

        if (this.type > 0) {
            let ceiling = 0;
            let run = 0;
            for (let x = 0; x < this.width; x++) {
                if (run-- <= 0 && x > 4) {
                    ceiling = this.random.nextInt(4);
                    run = this.random.nextInt(4) + 4;
                }
                for (let y = 0; y < this.height; y++)
                    if ((x > 4 && y <= ceiling) || x < 1)
                        this.setBlock(x, y, Types.NormalBrick);
            }
        }

        this.addFlag();
        return this.map.reduce(
            (prev, next) =>
                next.map((item, i) => (prev[i] || []).concat(next[i])),
            [],
        );
    }
}
