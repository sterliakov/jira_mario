import api, {route, startsWith, storage} from '@forge/api';
import Resolver from '@forge/resolver';

import {DEFAULT_GAME_CONF, DEFAULT_MARIO_CONF} from './constants';
import LevelGenerator from './levelGenerator';

const resolver = new Resolver();
const _useJson = {
    headers: {Accept: 'application/json'},
};

const fetchIssue = async (key) => {
    const rsp = await api
        .asUser()
        .requestJira(route`/rest/api/3/issue/${key}`, _useJson);
    return rsp.json();
};
const fetchUser = async (userId) => {
    const rsp = await api
        .asUser()
        .requestJira(route`/rest/api/3/user?accountId=${userId}`, _useJson);
    return rsp.json();
};
const fetchMaxPriority = async (userId) => {
    const rsp = await api
        .asUser()
        .requestJira(route`/rest/api/3/priority/search`, _useJson);
    return (await rsp.json()).total;
};

resolver.define('getMario', async (req) => {
    const {context: ctx} = req;
    const key = `mario_${ctx.extension.project.key}_${ctx.accountId}`;
    let mario = await storage.get(key);
    if (!mario) {
        mario = DEFAULT_MARIO_CONF;
        await storage.set(key, mario);
    }
    return mario;
});
resolver.define('setMario', async (req) => {
    const {context: ctx, payload} = req;
    const key = `mario_${ctx.extension.project.key}_${ctx.accountId}`;
    const oldMario = (await storage.get(key)) ?? DEFAULT_MARIO_CONF;
    // TODO: add validation
    await storage.set(key, {
        ...oldMario,
        ...payload.mario,
    });
    return {success: true};
});

resolver.define('getGame', async (req) => {
    const {context: ctx} = req;
    const key = `game_${ctx.extension.project.key}_${ctx.accountId}`;
    let game = await storage.get(key);
    if (!game || game.lifeCount <= 0) {
        game = DEFAULT_GAME_CONF;
        await storage.set(key, game);
    }
    return game;
});
resolver.define('setGame', async (req) => {
    const {context: ctx, payload} = req;
    const key = `game_${ctx.extension.project.key}_${ctx.accountId}`;
    const oldGame = (await storage.get(key)) ?? DEFAULT_GAME_CONF;
    // TODO: add validation
    await storage.set(key, {
        ...oldGame,
        ...payload.game,
    });

    if (payload.levelFinished) {
        const key = `issues_played_${ctx.extension.project.key}_${ctx.accountId}`;
        const played = (await storage.get(key)) ?? [];
        played.push(ctx.extension.issue.key);
        await storage.set(key, played);
    }
    return {success: true};
});

const disownsIssue = (fields, ctx) => {
    if (fields.assignee?.accountId !== ctx.accountId) return 'NOT_OWNER';
    if (
        !fields.resolution
        || (fields.resolution.id !== '10000'
            && fields.resolution.name !== 'Done'
            && fields.status?.name !== 'Done')
    )
        return 'NOT_COMPLETED';
    return null;
};

resolver.define('canPlay', async (req) => {
    const {context: ctx} = req;
    const {accountId, extension: ctxExt} = ctx;
    const issue = await fetchIssue(ctxExt.issue.key);

    const owns = disownsIssue(issue.fields, ctx);
    if (owns != null) return owns;

    const key = `issues_played_${ctxExt.project.key}_${accountId}`;
    const played = (await storage.get(key)) ?? [];
    if (played.includes(ctxExt.issue.key)) return 'ALREADY_PLAYED';
    return 'OK';
});

resolver.define('getLevel', async (req) => {
    const {context: ctx, payload} = req;
    const [issue, maxPriority] = await Promise.all([
        fetchIssue(ctx.extension.issue.key),
        fetchMaxPriority(),
    ]);
    if (disownsIssue(issue.fields, ctx)) return null;

    const gen = new LevelGenerator(
        `level_${ctx.extension.project.key}_${payload.levelNum}`,
        issue.fields,
        maxPriority,
    );
    return {
        level: gen.generateLevel(),
        scoreMultiplier: gen.getScoreMultiplier(),
    };
});

resolver.define('getLeaderboard', async (req) => {
    const {context: ctx} = req;
    const users = [];
    let cursor;
    while (true) {
        let q = storage
            .query()
            .where('key', startsWith(`game_${ctx.extension.project.key}`))
            .limit(20);
        if (cursor) q = q.cursor(cursor);
        const {results, nextCursor} = await q.getMany();
        if (!results.length) break;
        cursor = nextCursor;
        users.push(
            ...results.map((r) => ({
                user: r.key.split('_').at(-1),
                game: r.value,
            })),
        );
    }
    return await Promise.all(
        users.map(async (u) => ({
            game: u.game,
            user: await fetchUser(u.user),
        })),
    );
});

export const handler = resolver.getDefinitions();
