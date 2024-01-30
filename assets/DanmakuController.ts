import { _decorator, Component, Node, Label, Font, UITransform, Vec2, Vec3, director } from 'cc';
import { GameLanguage } from './GameLanguage';
const { ccclass, property } = _decorator;

@ccclass('DanmakuFrame')
export class DanmakuFrame extends Component {
    @property({ type: Font })
    font: Font
    @property({type: Node})
    gameManager: Node

    lan = GameLanguage.Instance.language;

    danmakuRegular = [this.lan == "en" ? "Cheer" : '主播加油',
    this.lan == "en" ? "Awesome!" : '666',
    this.lan == "en" ? "Looks so hard" : '看上去好难',
    this.lan == "en" ? "Slowly thinking" : '主播没事慢慢想',
    this.lan == "en" ? "Name of the game?" : '游戏名叫什么',
    this.lan == "en" ? "Nice music" : '音乐好听',
    this.lan == "en" ? "Westcelery so cute" : '主播好可爱',
    this.lan == "en" ? "Pat pat" : '摸摸',
    this.lan == "en" ? "So easy" : '这不挺简单的',
    this.lan == "en" ? "Easy to beat" : '乱过',
    this.lan == "en" ? "Not fun" : '没意思',
    this.lan == "en" ? "A bit fun" : '有点意思',
    this.lan == "en" ? "Seems very fun" : '看上去很有意思',
    this.lan == "en" ? "Nice level design" : '谜题设计不错',
    this.lan == "en" ? "Nice" : '不错',
    this.lan == "en" ? "Good!" : '好！',
    this.lan == "en" ? "Stream started?" : '开播了吗',
    this.lan == "en" ? "I want to sleep" : '看困了',
    this.lan == "en" ? "Skill issue" : '有手就行',]
    danmakuSuccess = [this.lan == "en" ? "Awe-Awesome" : '厉害啊',
    this.lan == "en" ? "Streamer lame" : '主播拉了',
    this.lan == "en" ? "Nice brain" : '头脑真好',
    this.lan == "en" ? "Game domain god" : '不愧是游戏领域大神',
    this.lan == "en" ? "I see" : '原来如此',
    this.lan == "en" ? "Win" : '赢',
    this.lan == "en" ? "Teach streamer" : '狠狠地鸿儒主播',
    this.lan == "en" ? "Cheer streamer" : '主播加油啊',
    this.lan == "en" ? "Go to play puzzle" : '狠狠恶补解密',]
    danmakuFailure = [this.lan == "en" ? "Who did that?" : '是谁干的？',
    this.lan == "en" ? "Skill issue" : '不行啊这',
    this.lan == "en" ? "Lame" : '拉了',
    this.lan == "en" ? "Speak through brain" : '想清楚了再发言',
    this.lan == "en" ? "Headache" : '是有点头疼',
    this.lan == "en" ? "Try again" : '再试试',
    this.lan == "en" ? "Come on Streamer" : '主播继续',]
    currentPool = this.danmakuRegular
    store: Node[] = []

    start() {
        const sendDanmaku = () => {
            const node = new Node()
            node.addComponent(UITransform).anchorPoint = new Vec2(0, 0)
            const label = node.addComponent(Label)
            label.string = this.currentPool[Math.floor(Math.random() * this.currentPool.length)]
            label.font = this.font
            label.fontSize = 8
            label.lineHeight = 8
            this.store.forEach(node => {
                const pos = node.getPosition()
                node.setPosition(new Vec3(pos.x, pos.y + 8, 0))
            })
            if (this.store.length > 15) {
                const node = this.store.shift()
                this.node.removeChild(node)
            }
            this.node.addChild(node)
            this.store.push(node)
            // this.scheduleOnce(sendDanmaku, Math.random() + 0.5)
        }
        // sendDanmaku()
        // this.schedule(sendDanmaku, 1)
        // eventTarget.on('danmaku-start', sendDanmaku)
        director.on('danmaku-start', ()=>{
            this.schedule(sendDanmaku, 1)
        })
        director.on('danmaku-end', () => {
            this.unschedule(sendDanmaku)
        })
        director.on('success', () => {
            this.currentPool = this.danmakuSuccess
            this.scheduleOnce(() => {
                this.currentPool = this.danmakuRegular
            }, 2)
        })
        director.on('failure', () => {
            this.currentPool = this.danmakuFailure
            this.scheduleOnce(() => {
                this.currentPool = this.danmakuRegular
            }, 2)
        })
    }

    update(deltaTime: number) {

    }
}


