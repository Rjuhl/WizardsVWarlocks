
import { PlayerState } from "../../game/PlayerState";
import { IUser } from "../../models/schemas";
import { Game } from '../../game/Game';
import { IBasicStats } from "../../resources/interfaces/game/IBasicStats";
import { GameEndTypes } from "../../resources/types/GameEndTypes";
import mongoose, { ConnectOptions } from 'mongoose';
import { DB_URI } from "../../TestConstants";

jest.setTimeout(20000);
jest.spyOn(Game.prototype, 'makeRoll').mockImplementation(
    (numRolls: number, die: number, base: number) => numRolls + die + base
);

const TOTAL_SPELLS = 22
const buildPlayerTurn = (
    spellId: number,
    manaSpent: number,
    newSpells: Array<number> | null = null
) => {
    return {
        spellId: spellId,
        manaSpent: manaSpent,
        newSpells: newSpells
    };
};
const buildPlayerState = (
    username: string, 
    password: string, 
    health: number,
    mana: number,
    classMultiplier: number,
    classType: number,
    ignited?: number,
    frozen?: boolean,
    observedSpells?: Array<number>,
    observedStats?: IBasicStats,

) => {
    const playerState = new PlayerState({
        admin: false,
        username: username,
        password: password,
        health: health,
        mana: mana,
        classMultiplier: classMultiplier,
        class: classType,
        money: 0,
        activeSpells: [...Array(TOTAL_SPELLS).keys()],
        spellsOwned: [...Array(TOTAL_SPELLS).keys()],
    } as unknown as IUser);

    if (ignited) playerState.ignited = ignited;
    if (frozen) playerState.frozen = frozen;
    if (observedSpells) playerState.observedSpells = observedSpells;
    if (observedStats) playerState.observedStats = observedStats;
    return playerState
};
describe("Basic tests", () => {
    let game: Game;

    beforeEach(() => {
        const player1State = buildPlayerState(
            'player_a', 'password',
            100, 10, 1, 0
        );
        const player2State = buildPlayerState(
            'player_b', 'password',
            100, 10, 1, 0
        );
        game = new Game({
            player1: player1State,
            player2: player2State
        });
    });

    beforeAll(async () => {
        mongoose
        .connect(DB_URI)
        .then(() => console.log('Connected to Database'))
        .catch((err) => console.log(err));
    });

    afterAll(async () => {
        await mongoose.disconnect();    
    });

    it("Test Attack on Attack", async () => {
        const aTurn = buildPlayerTurn(6, 1);
        const bTurn = buildPlayerTurn(6, 1);
        const turnResponse = await game.completeTurn(aTurn, bTurn)
        expect(turnResponse.gameState.player1.playerStats.health).toBe(100 - 12);
        expect(turnResponse.gameState.player2.playerStats.health).toBe(100 - 12);
        expect(turnResponse.gamePhase).toBe(GameEndTypes.ONGOING);
    });

    it("Test Attack and Block - no damage", async () => {
        const aTurn = buildPlayerTurn(6, 1);
        const bTurn = buildPlayerTurn(7, 1);
        const turnResponse = await game.completeTurn(aTurn, bTurn)
        expect(turnResponse.gameState.player1.playerStats.health).toBe(100);
        expect(turnResponse.gameState.player2.playerStats.health).toBe(100);
        expect(turnResponse.gamePhase).toBe(GameEndTypes.ONGOING);
    })

    it("Test Attack and Block - with damage", async () => {
        const aTurn = buildPlayerTurn(6, 2);
        const bTurn = buildPlayerTurn(7, 1);
        const turnResponse = await game.completeTurn(aTurn, bTurn)
        expect(turnResponse.gameState.player1.playerStats.health).toBe(100);
        expect(turnResponse.gameState.player2.playerStats.health).toBe(100 - 4);
        expect(turnResponse.gamePhase).toBe(GameEndTypes.ONGOING);
    })

    

})

// Tests

// Basic Tests
    // AvA 
    // AvB - overflow + no overflow
    // AvP
    // BvA
    // BvB
    // BvP
    // PvP
    // Heal works
    // Recharge works
    // Charged spells charge correctly
    // Spells that cannot be charged dont charge

// Status work
    // First Strike Works
    // Ignited works
    // Freeze works
    // Energy steal works
    // Self inflicted damage works
    // Negate block overflow works
    // Negate fire damage works
    // Special blocks work

// Modfier Tests
    // Basic modifers work
    // Modifiers stack
    // Correct modifers persist
    // Correct modifers remove themselves
    // Modifers effect the proper type

// Win Conditions
    // Player 1 wins
    // Player 2 wins
    // Tie