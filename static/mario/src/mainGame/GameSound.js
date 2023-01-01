import {Sounds} from '../constants';

export default class GameSound {
    play(element) {
        const sound = Sounds[element];
        sound.pause();
        sound.currentTime = 0;
        sound.play().catch((ex) => {});
    }
}
