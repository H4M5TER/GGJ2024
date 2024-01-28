import { _decorator, Component, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property({type: Prefab})
    private sprites = []
    private moving = false
    start() {
        
    }

    update(deltaTime: number) {
        
    }
}


