import schemas, { IDatabaseSpell } from '../models/schemas'

export class GameFactory {
    private playerSchema;
    constructor() {
        this.playerSchema = schemas.Users
    }

    private async getPlayerInfo(player: number) {

    }

    public async initGame(player1Id: number, player2Id: number) {

    }
}