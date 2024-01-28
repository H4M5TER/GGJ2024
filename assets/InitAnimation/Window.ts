import { _decorator, Component, lerp, Node, Vec3 } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('Window')
export class Window extends Component {
    
    private gameManager: GameManager;

    start() {
        this.gameManager = this.node.getParent().getComponent(GameManager);
    }

    update(deltaTime: number) {
        this.node.setScale(new Vec3(lerp(this.node.scale.x, this.gameManager.gameStarted?1:0, deltaTime*6), lerp(this.node.scale.y, this.gameManager.gameStarted?1:0, deltaTime*6), 0))
    }
}


