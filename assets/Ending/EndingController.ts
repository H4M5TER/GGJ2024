import { _decorator, AudioSource, Color, Component, Label, math, Node, Sprite, Vec4 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EndingController')
export class EndingController extends Component {
    private sound: Node;
    private sprite: Node;
    private content: Node;
    private contentIndex;
    private alphaTimer;
    private timer;
    private textTimer;
    private textIndex;
    private storedString;
    private texts: string[] = [];
    start() {
        this.sound = this.node.getChildByName("Printer");
        this.sprite = this.node.getChildByName("ending");
        this.timer = 0;
        this.textTimer = 0;
        this.alphaTimer = 0;
        this.contentIndex = 0;

        this.content = this.node.getChildByName("Text");
        this.textIndex = 0;

        // Text Content
        this.texts[0] = "某年某月某日";
        this.texts[1] = "一位名为西芹菜的游戏主播因为受不了弹幕高手的忍辱";
        this.texts[2] = "当场下播";
        this.texts[3] = "当人们提到那位名为西芹菜的游戏主播的时候"
        this.texts[4] = "总是会想起，它那忍俊不禁的游戏技术";
        this.texts[5] = "至于西芹菜";
        this.texts[6] = "为了提升自己的游戏技术";
        this.texts[7] = "转而向游戏领域大神求助";
        this.texts[8] = "游戏领域大神推荐给了西芹菜很多解谜游戏";
        this.texts[9] = "西芹菜：我会好好品鉴它们的"
        this.texts[10] = "于是，西芹菜在游戏领域大神的帮助下";
        this.texts[11] = "游戏技术日渐进步";
        this.texts[12] = "最后成为游戏主播界的解密游戏担当";
        this.texts[13] = "完";
    }

    update(deltaTime: number) {
        // Timer
        this.timer += deltaTime*20;
        if (this.timer > .2) {
            this.textTimer += deltaTime*20;
            this.alphaTimer += deltaTime/20;
        }

        this.storedString = this.content.getComponent(Label).string;

        this.sprite.getComponent(Sprite).color = Color.fromVec4(new Vec4(this.alphaTimer, this.alphaTimer, this.alphaTimer, 1));

        if (this.timer > (this.texts[this.contentIndex].length + 20)*2 && this.contentIndex < 13) {
            this.timer = 0;
            this.contentIndex++;
            this.textIndex = 0;
            this.textTimer = 0;
        }

        if (this.textTimer > 2 && this.textIndex <= this.texts[this.contentIndex].length) {
            this.textTimer = 0;
            this.sound.getComponent(AudioSource).play();
            this.textIndex++;
        }

        this.content.getComponent(Label).string = this.texts[Math.min(this.contentIndex, 13)].substring(0, this.textIndex);
    }
}


