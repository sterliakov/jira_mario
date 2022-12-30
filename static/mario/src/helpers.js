import {Types} from './constants';

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
        var offsetX = hWidths - Math.abs(vX);
        var offsetY = hHeights - Math.abs(vY);

        if (offsetX >= offsetY) {
            if (vY > 0 && vY < 37) {
                if (objB.type !== Types.FlagPole) objA.y += offsetY;
                return 't';
            } else if (vY < 0) {
                if (objB.type !== Types.FlagPole) objA.y -= offsetY;
                return 'b';
            }
        } else {
            if (vX > 0) {
                objA.x += offsetX;
                return 'l';
            } else {
                objA.x -= offsetX;
                return 'r';
            }
        }
    }
    return null;
}
