import { _decorator, Component, Input, input, instantiate, log, Node, Prefab, resources, Sprite, SpriteFrame, TextAsset, KeyCode, PostProcessStage, floatToHalf } from 'cc';
const { ccclass, property } = _decorator;

const enum GridType {
  Empty,
  Ground,
  Player,
  Wall,
  Chest,
  Pit,
}

interface Grid {
  type: GridType,
  node: Node,
  x: number,
  y: number
}

interface Position {
  x: number
  y: number
}

const enum EffectType {
  PlayerMoveFrom,
  ChestMoveFrom,
  PlayerMoveTo,
  ChestMoveTo,
  PitGone,
}

@ccclass('GameManager')
export class GameManager extends Component {
  map: Grid[][] = []
  mapChanges: Map<Grid, EffectType> = new Map()
  spriteRecord: Record<number, SpriteFrame> = {}
  levels: string[] = []
  players: Position[] = []
  pitRemains: number = -1
  currentLevel: number = 1
  moveQueue: Position[] = []
  gameStarted = false
  lockInput = false

  start() {
    function assert(err) {
      if (err) {
        log(err)
        throw err
      }
    }
    const loadSprite = (path: string, type: GridType) => {
      resources.load(path, SpriteFrame, (err, data) => {
        assert(err)
        this.spriteRecord[type] = data
      })
    }
    loadSprite('sokobanPlayer1/spriteFrame', GridType.Player)
    loadSprite('ground/spriteFrame', GridType.Ground)
    loadSprite('wall/spriteFrame', GridType.Wall)
    loadSprite('chest/spriteFrame', GridType.Chest)
    loadSprite('pit/spriteFrame', GridType.Pit)
      ;[...Array(13).keys()].slice(1).forEach((i) => {
        resources.load('level' + i, TextAsset, (err, data) => {
          assert(err)
          this.levels[i] = data.text
        })
      })
  }

  step() {
    if (!this.moveQueue.length) {
      this.lockInput = false
      this.unschedule(step)
      return
    }
    const { x, y } = this.moveQueue.shift()
    this.handleMove(x, y)
  }

  onGameStart() {
    if (this.gameStarted) return
    this.gameStarted = true
    this.node.getChildByPath('StartMenu').active = false
    this.loadMap()
    const enterQueue = (x, y) => {
      this.moveQueue.push({ x: x, y: y })
    }
    input.on(Input.EventType.KEY_DOWN, (e) => {
      switch (e.keyCode) {
        case KeyCode.ARROW_UP:
        case KeyCode.KEY_W:
          enterQueue(0, 1)
          break
        case KeyCode.ARROW_DOWN:
        case KeyCode.KEY_S:
          enterQueue(0, -1)
          break
        case KeyCode.ARROW_LEFT:
        case KeyCode.KEY_A:
          enterQueue(-1, 0)
          break
        case KeyCode.ARROW_RIGHT:
        case KeyCode.KEY_D:
          enterQueue(1, 0)
          break
        case KeyCode.KEY_R:
          this.loadMap()
          break
        case KeyCode.ENTER:
        case KeyCode.SPACE:
          this.lockInput = true
          this.schedule(this.step, 0.2)
          break
      }
    })
  }

  update(deltaTime: number) {
    const refreshGrid = (grid: Grid) => {
      grid.node.getComponent(Sprite).spriteFrame = this.spriteRecord[grid.type]
    }
    let v
    function effect2grid(effect: EffectType) {
      if (effect === EffectType.PlayerMoveFrom) return GridType.Ground
      if (effect === EffectType.ChestMoveFrom) return GridType.Ground
      if (effect === EffectType.PlayerMoveTo) return GridType.Player
      if (effect === EffectType.ChestMoveTo) return GridType.Chest
      if (effect === EffectType.PitGone) return GridType.Ground
    }
    for (let [grid, effect] of this.mapChanges) {
      log(`${grid.x}, ${grid.y}: ${effect}`)
      if (effect === EffectType.PitGone) {
        this.pitRemains -= 1
      }
      grid.type = effect2grid(effect)
      refreshGrid(grid)
      this.mapChanges.delete(grid)
      if (!this.pitRemains) {
        this.currentLevel += 1
        return this.loadMap()
      }
    }
  }

  createNodeWithSpriteFrame(spriteFrame: SpriteFrame) {
    const node = new Node()
    const sprite = node.addComponent(Sprite)
    sprite.spriteFrame = spriteFrame
    return node
  }

  loadMap() {
    const level = this.node.getChildByPath('window/Level')
    const ground = this.node.getChildByPath('window/Ground')
    level.removeAllChildren()
    ground.removeAllChildren()
    const leveltext = this.levels[this.currentLevel]
    if (!leveltext) throw `level ${this.currentLevel} not exisit`
    const map = leveltext.split('\n').reverse()
    // const height = map.length
    // const width = Math.max(...map.map(line=>line.length))
    // this.map = Array(width).map(()=>Array(height))
    this.pitRemains = 0
    this.players = []
    this.map = []
    this.lockInput = false
    this.moveQueue = []
    this.unschedule(this.step)
    function symbol2type(symbol: string) {
      if (symbol == '.') return GridType.Ground
      if (symbol == '@') return GridType.Player
      if (symbol == '#') return GridType.Wall
      if (symbol == '&') return GridType.Chest
      if (symbol == '^') return GridType.Pit
      return GridType.Empty
    }
    for (let y = 0; y < map.length; ++y) {
      this.map[y] = []
      for (let x = 0; x < map[y].length; ++x) {
        const type = symbol2type(map[y][x])
        if (type === GridType.Empty) continue
        if (type === GridType.Player) {
          this.players.push({ x: x, y: y })
        }
        if (type === GridType.Pit) {
          this.pitRemains += 1
        }
        const groundGrid = this.createNodeWithSpriteFrame(this.spriteRecord[GridType.Ground])
        ground.addChild(groundGrid)
        this.setPosition(groundGrid, x, y)
        const grid = this.createNodeWithSpriteFrame(this.spriteRecord[type])
        level.addChild(grid)
        this.setPosition(grid, x, y)
        this.map[y][x] = {
          type: type,
          node: grid,
          x: x,
          y: y,
        }
      }
    }
  }

  setPosition(node: Node, x, y) {
    node.setPosition(x * 16, y * 16, 0)
  }

  handleMove(mov_x: number, mov_y: number) {
    const setGrid = (grid: Grid, effect: EffectType) => {
      if (this.mapChanges.has(grid)) {
        if (this.mapChanges.get(grid) < effect) {
          this.mapChanges.set(grid, effect)
        }
      } else {
        this.mapChanges.set(grid, effect)
      }
    }
    const tryMove = (target: Grid): boolean => {
      if (!target) return false
      let further
      if (this.map[target.y + mov_y])
        further = this.map[target.y + mov_y][target.x + mov_x]
      else
        further = undefined
      switch (target.type) {
        case GridType.Wall:
        case GridType.Pit:
          return false
        case GridType.Player:
          return tryMove(further)
        case GridType.Chest:
          if (further.type === GridType.Wall)
            return false
          if (further.type === GridType.Ground) {
            setGrid(further, EffectType.ChestMoveTo)
            return true
          }
          if (further.type === GridType.Pit) {
            setGrid(further, EffectType.PitGone)
            return true
          }
          if (further.type === GridType.Player) {
            if (tryMove(further)) {
              setGrid(further, EffectType.ChestMoveTo)
              return true
            }
            return false
          }
          if (further.type === GridType.Chest)
            return false
        case GridType.Ground:
          return true
        default:
          return false
      }
    }
    this.players.forEach((player) => {
      const current = this.map[player.y][player.x]
      const target = this.map[player.y + mov_y][player.x + mov_x]
      if (!target) return
      if (tryMove(target)) {
        setGrid(current, EffectType.PlayerMoveFrom)
        setGrid(target, EffectType.PlayerMoveTo)
        player.x += mov_x
        player.y += mov_y
      }
    })
  }
}


