import { _decorator, Component, director, log, Node } from 'cc';
import { GameLanguage } from './GameLanguage';
const { ccclass, property } = _decorator;

@ccclass('Language')
export class Language extends Component {

    private language: string;

    start() {
        this.language = "en";
    }

    update(deltaTime: number) {
        
    }

    onGameStart(event, data) {
        GameLanguage.Instance.language = data;
        director.loadScene("game");
    }
}


