import { _decorator, Component, Node, Label, Font, UITransform, Vec2, Vec3, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DanmakuFrame')
export class DanmakuFrame extends Component {
    @property({ type: Font })
    font: Font
    @property({type: Node})
    gameManager: Node

    danmakuRegular = ['主播加油', '666', '看上去好难', '主播没事慢慢想', '游戏名叫什么', '音乐好听', '主播好可爱', '摸摸', '这不挺简单的', '乱过', '没意思', '有点意思', '看上去很有意思', '谜题设计不错', '不错', '好！', '开播了吗', '看困了', '有手就行',]
    danmakuSuccess = ['厉害啊', '主播拉了', '头脑真好', '不愧是游戏领域大神', '原来如此', '赢', '狠狠地鸿儒主播', '主播加油啊', '狠狠恶补解密',]
    danmakuFailure = ['是谁干的？', '不行啊这', '拉了', '想清楚了再发言', '是有点头疼', '再试试', '主播继续',]
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


