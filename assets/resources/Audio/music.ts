import { _decorator, AudioSource, Component, Node } from 'cc';
import { GameManager } from '../../GameManager';
const { ccclass, property } = _decorator;

@ccclass('music')
export class music extends Component {
    private gameManager: GameManager;
    private isPlayed: boolean;
    start() {
        this.isPlayed = false;
        this.gameManager = this.node.getParent().getComponent(GameManager);
    }

    update(deltaTime: number) {
        if (!this.isPlayed && this.gameManager.gameStarted) {
            this.node.getComponent(AudioSource).play();
            this.isPlayed = true;
        }
    }
}


