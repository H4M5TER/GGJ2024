import { _decorator, Component, Label, Node } from 'cc';
import { GameLanguage } from './GameLanguage';
const { ccclass, property } = _decorator;

@ccclass('StartButton')
export class StartButton extends Component {
    start() {
        this.node.getComponent(Label).string = GameLanguage.Instance.language == "en" ? "Play" : "开始";
    }

    update(deltaTime: number) {

    }
}


