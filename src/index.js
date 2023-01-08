import api, {route, startsWith, storage} from '@forge/api';
import Resolver from '@forge/resolver';

import {DEFAULT_GAME_CONF, DEFAULT_MARIO_CONF} from './constants';
import LevelGenerator from './levelGenerator';

const resolver = new Resolver();
const _useJson = {
    headers: {Accept: 'application/json'},
};

resolver.define('testUp', (req) => {
    console.log(req);
    return 'Hello, world!';
});

const fetchIssue = async (key) => {
    const rsp = await api
        .asUser()
        .requestJira(route`/rest/api/3/issue/${key}`, _useJson);
    return rsp.json();
};
const fetchUser = async () => {
    const rsp = await api
        .asUser()
        .requestJira(route`/rest/api/3/myself`, _useJson);
    return rsp.json();
};

resolver.define('getIssue', async (req) => {
    const {context: ctx} = req;
    console.log(ctx.extension);
    const issue = await fetchIssue(ctx.extension.issue.key);
    console.log(issue);
    return issue;
});

resolver.define('getMario', async (req) => {
    const {context: ctx} = req;
    const user = await fetchUser();
    console.log(user);
    const key = `mario_${ctx.extension.project.key}_${user.accountId}`;
    let mario = await storage.get(key);
    if (!mario) {
        mario = DEFAULT_MARIO_CONF;
        await storage.set(key, mario);
    }
    return mario;
});
resolver.define('setMario', async (req) => {
    const {context: ctx, payload} = req;
    const user = await fetchUser();
    const key = `mario_${ctx.extension.project.key}_${user.accountId}`;
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
    const user = await fetchUser();
    const key = `game_${ctx.extension.project.key}_${user.accountId}`;
    let game = await storage.get(key);
    if (!game || game.lifeCount === 0) {
        game = DEFAULT_GAME_CONF;
        await storage.set(key, game);
    }
    return game;
});
resolver.define('setGame', async (req) => {
    const {context: ctx, payload} = req;
    const user = await fetchUser();
    const key = `game_${ctx.extension.project.key}_${user.accountId}`;
    const oldGame = (await storage.get(key)) ?? DEFAULT_GAME_CONF;
    // TODO: add validation
    await storage.set(key, {
        ...oldGame,
        ...payload.game,
    });

    if (payload.levelFinished) {
        const key = `issues_played_${ctx.extension.project.key}_${user.accountId}`;
        const played = (await storage.get(key)) ?? [];
        played.push(ctx.extension.issue.key);
        await storage.set(key, played);
    }
    return {success: true};
});

resolver.define('canPlay', async (req) => {
    const {context: ctx} = req;
    const [user, issue] = await Promise.all([
        fetchUser(),
        fetchIssue(ctx.extension.issue.key),
    ]);
    if (issue.fields.assignee?.accountId !== user.accountId) return 'NOT_OWNER';
    if (issue.fields.status.name !== 'Done') return 'NOT_COMPLETED';
    const key = `issues_played_${ctx.extension.project.key}_${user.accountId}`;
    const played = (await storage.get(key)) ?? [];
    if (played.includes(ctx.extension.issue.key)) return 'ALREADY_PLAYED';
    return 'OK';
});

resolver.define('getLevel', async (req) => {
    const {context: ctx, payload} = req;
    const [user, issue] = await Promise.all([
        fetchUser(),
        fetchIssue(ctx.extension.issue.key),
    ]);
    if (
        issue.fields.assignee?.accountId !== user.accountId ||
        issue.fields.status.name !== 'Done'
    )
        return null;

    return new LevelGenerator(
        `level_${ctx.extension.project.key}_${payload.levelNum}`,
        3,
        4,
    ).generateLevel();
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
        console.log(results, cursor);
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
            user: await (
                await api
                    .asUser()
                    .requestJira(
                        route`/rest/api/3/user?accountId=${u.user}`,
                        _useJson,
                    )
            ).json(),
        })),
    );
});

export const handler = resolver.getDefinitions();