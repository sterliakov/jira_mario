import {invoke} from '@forge/bridge';

import {Types} from './constants';

const fetchLevel = async (levelNum) => {
    return invoke('getLevel', {levelNum});
};
const _levelCache = {};
const deepClone = (arr) => JSON.parse(JSON.stringify(arr));

export async function getLevel(levelNum) {
    if (levelNum in _levelCache) return deepClone(_levelCache[levelNum]);
    const lvl = await fetchLevel(levelNum);
    _levelCache[levelNum] = lvl;
    return deepClone(lvl);
}
export async function getGameState() {
    return invoke('getGame');
}
export async function saveGameState(newStatePart, levelFinished = false) {
    return invoke('setGame', {game: newStatePart, levelFinished});
}
export async function getMario() {
    return invoke('getMario');
}
export async function saveMario(newStatePart) {
    return invoke('setMario', {mario: newStatePart});
}
export async function getCanPlay() {
    return invoke('canPlay');
}

export function collisionCheck(objA, objB) {
    // get the vectors to check against
    const vX = objA.x + objA.width / 2 - (objB.x + objB.width / 2);
    const vY = objA.y + objA.height / 2 - (objB.y + objB.height / 2);

    // add the half widths and half heights of the objects
    const hWidths = objA.width / 2 + objB.width / 2;
    const hHeights = objA.height / 2 + objB.height / 2;

    // if the x and y vector are less than the half width or half height, then we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        // figures out on which side we are colliding (top, bottom, left, or right)
        const offsetX = hWidths - Math.abs(vX);
        const offsetY = hHeights - Math.abs(vY);

        if (offsetX >= offsetY) {
            if (0 < vY && vY < 37) {
                if (objB.type !== Types.FlagPole) objA.y += offsetY;
                return 't';
            } else if (vY < 0) {
                if (objB.type !== Types.FlagPole) objA.y -= offsetY;
                return 'b';
            }
        } else {
            objA.x += offsetX * Math.sign(vX);
            return vX > 0 ? 'l' : 'r';
        }
    }
    return null;
}
