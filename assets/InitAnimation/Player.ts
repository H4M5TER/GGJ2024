import { _decorator, AudioSource, Component, director, Game, Label, lerp, log, math, Node, random, Sprite, Vec2, Vec3 } from 'cc';
import { GameManager } from '../GameManager';
import { GameLanguage } from '../GameLanguage';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {

    private gameManager: GameManager;
    private playerDialog: Node;
    private playerDialogText: Label;

    private wordTimer;
    private startTimer;
    private randomTimer;

    private introTexts: string[] = [];
    private puzzleSolvingTexts: string[] = [];
    private playerFailedTexts: string[] = [];
    private playerSuccessTexts: string[] = [];
    private introIndex;
    private wordNumber;

    private someoneSpeak: AudioSource;

    private isSpeaking: boolean;

    public state: string; // "solving" "success" "failed"

    private printText: string;

    start() {
        director.on('success', () => {
            this.state = 'success'
            this.randomTimer = 1000
        })
        director.on('failure', () => {
            this.state = 'failed'
            this.randomTimer = 1000
        })
        director.on("timerClear", () => {
            this.randomTimer = 0;
        })

        this.gameManager = this.node.getParent().getComponent(GameManager);
        this.playerDialog = this.node.getChildByName("dialog");
        this.playerDialogText = this.node.getChildByName("dialog").getChildByName("Label").getComponent(Label);

        this.startTimer = 0;
        this.wordTimer = 0;
        this.wordNumber = 0;
        this.randomTimer = 0;

        this.someoneSpeak = this.node.getChildByName("SomeoneSpeak").getComponent(AudioSource);

        this.state = "solving"

        this.isSpeaking = true;

        let lan = GameLanguage.Instance.language;

        this.introTexts[0] = lan == "en" ? "Hello everyone I'm Westcelery" : "大家好啊我是西芹菜";
        this.introTexts[1] = lan == "en" ? "Today I'll show you something you want" : "今天来给大家看点想看的东西";

        this.puzzleSolvingTexts = [lan == "en" ? "A bit hard" : '有点难',
        lan == "en" ? "Maybe should this?" : '或许应该这样？',
        lan == "en" ? "Emm" : '唔',
        lan == "en" ? "And like this?" : '然后应该这样？',
        lan == "en" ? "This chest go here" : '这个箱子这样推',
        lan == "en" ? "And go there" : '然后这样走',
        lan == "en" ? "Westcelery drinks some water" : '主播喝口水先',
            '...',
        lan == "en" ? "Maybe I know how to do" : '好像有思路了'];

        this.playerFailedTexts = [lan == "en" ? "That's wrong" : '这样好像不行',
        lan == "en" ? "Let's have a deep thought" : '好好思考一下吧',
        lan == "en" ? "Maybe close" : '或许还差一点',
        lan == "en" ? "Looks like have a chance" : '好像有戏'];

        this.playerSuccessTexts = [lan == "en" ? "You are a game domain god" : '不愧是游戏领域大神',
        lan == "en" ? "Nice" : '厉害',
        lan == "en" ? "Awesome" : '好强',
        lan == "en" ? "I need to try harder" : '我也要努力了',
        lan == "en" ? "Won't beated by you next time" : '下次不会输给你了'];

        this.introIndex = 0;
    }

    update(deltaTime: number) {
        this.startTimer += this.gameManager.gameStarted ? deltaTime * 20 : 0;
        this.wordTimer += this.gameManager.gameStarted ? deltaTime * 20 : 0;

        // Visible
        this.playerDialog.setScale(lerp(this.playerDialog.scale.x, this.isSpeaking ? 1 : 0, deltaTime * 10),
            lerp(this.playerDialog.scale.y, this.isSpeaking ? 1 : 0, deltaTime * 10), 0);

        // SpeakingScale
        this.node.setScale(this.isSpeaking ? Math.sin(this.startTimer) / 200 + 1 : 1, this.node.scale.y, 0);

        if (this.introIndex < 2) {
            if (this.startTimer > (this.introTexts[this.introIndex].length * 2 + 20)) {
                this.introIndex++;
                this.startTimer = 0;
                this.wordNumber = 0;
                if (this.introIndex == 2) {
                    this.isSpeaking = false;
                }
            }
            this.printText = this.introTexts[this.introIndex];
            if (this.isSpeaking) {
                if (this.wordTimer > 2 && this.wordNumber <= this.printText.length) {
                    this.wordTimer = 0;
                    this.wordNumber++;
                    this.someoneSpeak.play();
                }
            }
        } else {
            this.randomTimer += deltaTime * 10;
            if (this.randomTimer > 100) {
                this.isSpeaking = true;
                if (this.state == "solving") {
                    this.printText = this.puzzleSolvingTexts[math.randomRangeInt(0, 8)];
                }
                if (this.state == "success") {
                    this.printText = this.playerSuccessTexts[math.randomRangeInt(0, 4)];
                    this.state = "solving";
                }
                if (this.state == "failed") {
                    this.printText = this.playerFailedTexts[math.randomRangeInt(0, 3)];
                    this.state = "solving";
                }
                this.isSpeaking = true;
                this.startTimer = 0;
                this.randomTimer = 0;
            }
            if (this.isSpeaking) {
                if (this.wordTimer > 2 && this.wordNumber <= this.printText.length) {
                    this.wordTimer = 0;
                    this.wordNumber++;
                    this.someoneSpeak.play();
                }
                if (this.startTimer > this.printText.length * 2 + 10) {
                    this.startTimer = 0;
                    this.wordNumber = 0;
                    this.isSpeaking = false;
                }
            }
        }
        if (this.isSpeaking) {
            this.playerDialogText.string = this.printText.substring(0, this.wordNumber);
        }

        this.node.position = new Vec3(this.node.position.x, lerp(this.node.position.y, (this.gameManager.gameStarted ? -9 : this.node.position.y), deltaTime * 4), 0);
    }
}


