import api, {route, storage} from '@forge/api';
import Resolver from '@forge/resolver';

import {DEFAULT_GAME_CONF, DEFAULT_MARIO_CONF} from './constants';
import LevelGenerator from './levelGenerator';

const resolver = new Resolver();

resolver.define('testUp', (req) => {
    console.log(req);
    return 'Hello, world!';
});

const fetchIssue = async (key) => {
    const rsp = await api
        .asUser()
        .requestJira(route`/rest/api/3/issue/${key}`, {
            headers: {Accept: 'application/json'},
        });
    return rsp.json();
};
// const fetchProject = async (key) => {
//     const rsp = await api.asUser().requestJira(
//         route`/rest/api/3/project/${key}`,
//         {headers: {'Accept': 'application/json'}}
//     );
//     return rsp.json()
// }
const fetchUser = async () => {
    const rsp = await api.asUser().requestJira(route`/rest/api/3/myself`, {
        headers: {Accept: 'application/json'},
    });
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
    const key = `mario_${user.accountId}_${ctx.extension.project.key}`;
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
    const key = `mario_${user.accountId}_${ctx.extension.project.key}`;
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
    const key = `game_${user.accountId}_${ctx.extension.project.key}`;
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
    const key = `game_${user.accountId}_${ctx.extension.project.key}`;
    const oldGame = (await storage.get(key)) ?? DEFAULT_GAME_CONF;
    // TODO: add validation
    await storage.set(key, {
        ...oldGame,
        ...payload.game,
    });

    if (payload.levelFinished) {
        const key = `issues_played_${user.accountId}_${ctx.extension.project.key}`;
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
    if (issue.fields.assignee.accountId !== user.accountId) return false;
    if (issue.fields.status.name !== 'Done') return false;
    const key = `issues_played_${user.accountId}_${ctx.extension.project.key}`;
    const played = (await storage.get(key)) ?? [];
    return !played.includes(ctx.extension.issue.key);
});

resolver.define('getLevel', async (req) => {
    const {context: ctx, payload} = req;
    const [user, issue] = await Promise.all([
        fetchUser(),
        fetchIssue(ctx.extension.issue.key),
    ]);
    if (
        issue.fields.assignee.accountId !== user.accountId ||
        issue.fields.status.name !== 'Done'
    )
        return null;

    return new LevelGenerator(
        `level_${ctx.extension.project.key}_${payload.levelNum}`,
        3,
        4,
    ).generateLevel();
});

export const handler = resolver.getDefinitions();
