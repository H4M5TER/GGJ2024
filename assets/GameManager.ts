import { _decorator, Component, Input, input, instantiate, log, Node, Prefab, resources, Sprite, SpriteFrame, TextAsset, KeyCode, UITransform, director, Label, AudioSource } from 'cc';
import { GameLanguage } from './GameLanguage';
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
  spriteRecord: Record<number, SpriteFrame> = {}

  // levels: string[] = []
  levels = [, "####\r\n#.@.##\r\n#.&.^#\r\n######", " ####\r\n#.@.#\r\n#^#&.#\r\n#....#\r\n#..##\r\n ##", "########\r\n#...#...#\r\n#.&@^.&.#\r\n#..^####\r\n ###", "#######\r\n#.@#@^#\r\n#.&#.&#\r\n#.^#..#\r\n#######", "########\r\n#..^...#\r\n#^@#@&.#\r\n#&.....#\r\n#..#####\r\n ##", "  ###\r\n #@..#\r\n  #..#\r\n  #&.#\r\n ##@##\r\n#^&^@#\r\n ####", " ####\r\n#....#\r\n#@##.#\r\n #@.&.#\r\n #..^#\r\n  ###", "   ###\r\n  #^^^#\r\n ##&&&##\r\n#^&@@@&^#\r\n#^&@#@&^#\r\n#^&@@@&^#\r\n ##&&&##\r\n  #^^^#\r\n   ###", "#####\r\n#...#\r\n#^..#\r\n#@..#\r\n#.###\r\n#&&.#\r\n#^..#\r\n#@..#\r\n#####", "#######\r\n#^@^@##\r\n###.&.#\r\n###&..#\r\n###...#\r\n#######", " #######\r\n#@@@@...#\r\n#....&&.#\r\n#..^^..#\r\n#&&&&##\r\n#^^^^#\r\n ####", " #####\r\n#@^&^@#\r\n #...#\r\n #&@&#\r\n #...#\r\n#@^&^@#\r\n #####"]
  currentLevel: number = 1
  lastLevel = 12
  levelSuccess = false

  map: Grid[][] = []
  pitRemains: number = -1
  players: Position[] = []
  mapChanges: Map<Grid, EffectType> = new Map()
  moveQueue: Position[] = []

  inputLabel: Label

  gameStarted = false
  gameEnd = false
  lockInput = false

  zoomRate = 16

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
    // ;[...Array(13).keys()].slice(1).forEach((i) => {
    //   resources.load('level' + i, TextAsset, (err, data) => {
    //     assert(err)
    //     this.levels[i] = data.text
    //   })
    // })
  }

  step() {
    if (!this.moveQueue.length) {
      this.lockInput = false
      this.unschedule(this.step)
      return this.turnEnd()
    }
    const { x, y } = this.moveQueue.shift()
    this.handleMove(x, y)
  }

  playSound(name: string) {
    const audio = this.node.getChildByPath('Audio/' + name).getComponent(AudioSource)
    if (audio.playing) return
    audio.playOneShot(audio.clip)
  }

  turnEnd() {
    if (this.levelSuccess) {
      this.levelSuccess = false
      this.currentLevel += 1
      director.emit('success')
      this.loadMap()
    } else {
      director.emit('failure')
      this.loadMap()
    }
  }

  resolveQueue() {
    if (!this.moveQueue.length) return
    this.lockInput = true
    this.inputLabel.string = ''
    this.schedule(this.step, 0.3)
  }

  onGameStart() {
    if (this.gameStarted) return
    this.gameStarted = true
    director.emit('danmaku-start')
    const audio = this.node.getChildByPath('Audio/Music').getComponent(AudioSource)
    audio.play()
    this.node.getChildByPath('StartMenu').active = false
    this.loadMap()
    const enterQueue = (x, y) => {
      // Clear the randomTimer of the player
      director.emit("timerClear")
      if (this.lockInput) return
      this.moveQueue.push({ x: x, y: y })
    }
    const label = this.inputLabel = this.node.getChildByName('Input').getComponent(Label)
    input.on(Input.EventType.KEY_DOWN, (e) => {
      switch (e.keyCode) {
        case KeyCode.ARROW_UP:
        case KeyCode.KEY_W:
          label.string += GameLanguage.Instance.language == "en" ? "U" : '上'
          enterQueue(0, 1)
          break
        case KeyCode.ARROW_DOWN:
        case KeyCode.KEY_S:
          label.string += GameLanguage.Instance.language == "en" ? "D" : '下'
          enterQueue(0, -1)
          break
        case KeyCode.ARROW_LEFT:
        case KeyCode.KEY_A:
          label.string += GameLanguage.Instance.language == "en" ? "L" : '左'
          enterQueue(-1, 0)
          break
        case KeyCode.ARROW_RIGHT:
        case KeyCode.KEY_D:
          label.string += GameLanguage.Instance.language == "en" ? "R" : '右'
          enterQueue(1, 0)
          break
        case KeyCode.KEY_R:
          this.loadMap()
          break
        case KeyCode.ENTER:
        case KeyCode.SPACE:
          // this.playSound('Printer')
          this.resolveQueue()
          break
        case KeyCode.BACKSPACE:
          label.string = label.string.slice(0, -1)
          this.moveQueue.pop()
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
      if (effect === EffectType.PitGone) {
        this.pitRemains -= 1
        this.playSound('DropStuff')
      }
      grid.type = effect2grid(effect)
      refreshGrid(grid)
      this.mapChanges.delete(grid)
      if (!this.pitRemains) {
        this.levelSuccess = true
        return
      }
    }
  }

  createNodeWithSpriteFrame(spriteFrame: SpriteFrame) {
    const node = new Node()
    const transform = node.addComponent(UITransform)
    transform.anchorX = transform.anchorY = 0
    const sprite = node.addComponent(Sprite)
    sprite.spriteFrame = spriteFrame
    return node
  }

  loadMap() {
    if (this.gameEnd) return
    if (this.currentLevel > this.lastLevel) {
      director.loadScene('Ending')
      this.gameEnd = true
    }
    const level = this.node.getChildByPath('window/Level')
    const ground = this.node.getChildByPath('window/Ground')
    level.removeAllChildren()
    ground.removeAllChildren()
    const leveltext = this.levels[this.currentLevel]
    if (!leveltext) throw `level ${this.currentLevel} not exisit`
    const map = leveltext.split(/\r?\n/).reverse().map(v => v.trimEnd())
    const height = map.length
    const width = Math.max(...map.map(line => line.length))
    this.zoomRate = Math.min(100 / height, 108 / width) / 16
    level.setScale(this.zoomRate, this.zoomRate, 0)
    ground.setScale(this.zoomRate, this.zoomRate, 0)
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
        return
      }
      this.mapChanges.set(grid, effect)
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
        this.playSound('FootStep')
        setGrid(current, EffectType.PlayerMoveFrom)
        setGrid(target, EffectType.PlayerMoveTo)
        player.x += mov_x
        player.y += mov_y
      } else {
        // this.playSound('Collision')
      }
    })
  }
}


