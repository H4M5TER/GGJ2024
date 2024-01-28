import { _decorator, Component, Game, lerp, Node, Vec2, Vec3 } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('Playeer')
export class Playeer extends Component {

    private gameManager: GameManager;

    start() {
        this.gameManager = this.node.getParent().getComponent(GameManager);
    }

    update(deltaTime: number) {
        this.node.position = new Vec3(this.node.position.x, lerp(this.node.position.y, (this.gameManager.gameStarted?-9:this.node.position.y), deltaTime*4), 0);
    }
}


