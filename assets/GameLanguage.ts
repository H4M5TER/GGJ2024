import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameLanguage')
export class GameLanguage {
    private static _instance: GameLanguage = null;

    public language: string = "en";

    public static get Instance() {
        if (this._instance == null) {
            this._instance = new GameLanguage();
        }
        return this._instance;
    }

    private constructor() {

    }
}


