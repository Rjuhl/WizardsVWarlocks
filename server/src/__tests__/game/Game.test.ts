
import { PlayerState } from "../../game/PlayerState";
import { IUser } from "../../models/schemas";
import { Game } from '../../game/Game';
import { IBasicStats } from "../../resources/interfaces/game/IBasicStats";
import { GameEndTypes } from "../../resources/types/GameEndTypes";
import mongoose, { ConnectOptions } from 'mongoose';
import { DB_URI, InitSpellRolls, DynamicObject } from "../../constants/TestConstants";
import { ICompleteTurnResponse } from "../../resources/interfaces/game/ICompleteTurnResponse";
import { Spells } from "../../constants/Spells";

jest.setTimeout(20000);
jest.spyOn(Game.prototype, 'makeRoll').mockImplementation(
    (numRolls: number, die: number, base: number) => numRolls + die + base
);

const TOTAL_SPELLS = Object.keys(Spells).length / 2;
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
describe("Game Test", () => {
    let SPELL_ROLL: DynamicObject;
    beforeAll(async () => {
        mongoose
        .connect(DB_URI)
        .then(() => console.log('Connected to Database'))
        .catch((err) => console.log(err));
        SPELL_ROLL = await InitSpellRolls();
    });

    afterAll(async () => {
        await mongoose.disconnect();    
    });

    const runBasicTests = (turnResponse: ICompleteTurnResponse, numValues: Array<number>, endType: GameEndTypes) => {
        expect(turnResponse.gameState.player1.playerStats.health).toBe(numValues[0]);
        expect(turnResponse.gameState.player2.playerStats.health).toBe(numValues[1]);
        expect(turnResponse.gameState.player1.playerStats.mana).toBe(numValues[2])
        expect(turnResponse.gameState.player2.playerStats.mana).toBe(numValues[3])
        expect(turnResponse.gamePhase).toBe(endType);
    }

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
    
        it("Test Attack on Attack", async () => {
            const aTurn = buildPlayerTurn(Spells.MAGIC_MISSLE, 1);
            const bTurn = buildPlayerTurn(Spells.MAGIC_MISSLE, 1);
            const turnResponse = await game.completeTurn(aTurn, bTurn);
            runBasicTests(turnResponse, [
                100 - SPELL_ROLL.MAGIC_MISSLE, 
                100 - SPELL_ROLL.MAGIC_MISSLE, 
                9, 9], GameEndTypes.ONGOING)
        });
    
        it("Test Attack and Block - no damage", async () => {
            const aTurn = buildPlayerTurn(Spells.MAGIC_MISSLE, 1);
            const bTurn = buildPlayerTurn(Spells.WARD, 1);
            const turnResponse = await game.completeTurn(aTurn, bTurn);
            runBasicTests(turnResponse, [100, 100, 9, 9], GameEndTypes.ONGOING)
        });
    
        it("Test Attack and Block - with damage", async () => {
            const aTurn = buildPlayerTurn(Spells.MAGIC_MISSLE, 2);
            const bTurn = buildPlayerTurn(Spells.WARD, 1);
            const turnResponse = await game.completeTurn(aTurn, bTurn)
            runBasicTests(turnResponse, [100, 100-4, 8, 9], GameEndTypes.ONGOING)
        });
    
        it("Test Attack and Passive", async () => {
            const aTurn = buildPlayerTurn(Spells.MAGIC_MISSLE, 1);
            const bTurn = buildPlayerTurn(Spells.RECHARGE, 0);
            const turnResponse = await game.completeTurn(aTurn, bTurn);
            runBasicTests(turnResponse, [100, 100-12, 9, 12], GameEndTypes.ONGOING)
        });
    
        it("Test Block and Block", async () => {
            const aTurn = buildPlayerTurn(Spells.WARD, 1);
            const bTurn = buildPlayerTurn(Spells.WARD, 1);
            const turnResponse = await game.completeTurn(aTurn, bTurn);
            runBasicTests(turnResponse, [100, 100, 9, 9], GameEndTypes.ONGOING)
        });
    
        it("Test Passive and Passive", async () => {
            const aTurn = buildPlayerTurn(Spells.RECHARGE, 0);
            const bTurn = buildPlayerTurn(Spells.RECHARGE, 0);
            const turnResponse = await game.completeTurn(aTurn, bTurn);
            runBasicTests(turnResponse, [100, 100, 12, 12], GameEndTypes.ONGOING);
        });
    
        it("Test Heal Works", async () => {
            const aTurn = buildPlayerTurn(Spells.HEAL, 1);
            const bTurn = buildPlayerTurn(Spells.HEAL, 2);
            const turnResponse = await game.completeTurn(aTurn, bTurn)
            runBasicTests(turnResponse, [100+7, 100+14, 9, 8], GameEndTypes.ONGOING)
        });

        it("Incorrect mana cost is caught", async () => {
            const aTurn = buildPlayerTurn(Spells.HEAVENLY_LIGHTNING_STRIKE, 3);
            const bTurn = buildPlayerTurn(Spells.MAGIC_MISSLE, 0);
            const turnResponse = await game.completeTurn(aTurn, bTurn)
            runBasicTests(turnResponse, [100, 100, 10, 10], GameEndTypes.ONGOING)
        });


        it("Unchargeable spells cannot be charged", async () => {
            const aTurn1 = buildPlayerTurn(Spells.RECHARGE, 0);
            const bTurn1 = buildPlayerTurn(Spells.RECHARGE, 0);
            const aTurn2 = buildPlayerTurn(Spells.HEAVENLY_LIGHTNING_STRIKE, 8);
            const bTurn2 = buildPlayerTurn(Spells.HEAVENLY_LIGHTNING_STRIKE, 12);
            await game.completeTurn(aTurn1, bTurn1);
            const turnResponse = await game.completeTurn(aTurn2, bTurn2);
            runBasicTests(turnResponse, [100-36, 100-36, 8, 8], GameEndTypes.ONGOING);
        });
    }) 

    describe("Status Effect Tests", () => {
        let game: Game;
        beforeEach(() => {
            const player1State = buildPlayerState(
                'player_a', 'password',
                58, 10, 1, 0
            );
            const player2State = buildPlayerState(
                'player_b', 'password',
                58, 10, 1, 0
            );
            game = new Game({
                player1: player1State,
                player2: player2State
            });
        });

        it("First Strike Apply Damage First", async () => {
            const aTurn = buildPlayerTurn(Spells.LIGHTNING_BOLT, 9);
            const bTurn = buildPlayerTurn(Spells.MAGIC_MISSLE, 9);
            const turnResponse = await game.completeTurn(aTurn, bTurn);
            expect(turnResponse.gamePhase).toBe(GameEndTypes.PLAYER_1_WINS);
        });

        it("Two First Strike Attacks Apply Damage Simultaneously", async () => {
            const aTurn = buildPlayerTurn(Spells.LIGHTNING_BOLT, 9);
            const bTurn = buildPlayerTurn(Spells.LIGHTNING_BOLT, 9);
            const turnResponse = await game.completeTurn(aTurn, bTurn);
            expect(turnResponse.gamePhase).toBe(GameEndTypes.TIE);
        });

        it("Ignited Effect Applies When Damage is Dealt and Deals Damage First Next Turn", async () => {
            // Turn 1
            const aTurn1 = buildPlayerTurn(Spells.FIRE_BALL, 1);
            const bTurn1 = buildPlayerTurn(Spells.HEAVENLY_LIGHTNING_STRIKE, 4);
            const turnResponse1 = await game.completeTurn(aTurn1, bTurn1);
            runBasicTests(turnResponse1, [58 - 36, 58 - 10, 9, 6], GameEndTypes.ONGOING);
            expect(turnResponse1.gameState.player2.ignited).toBe(3);

            // Turn 2
            const aTurn2 = buildPlayerTurn(Spells.HEAVENLY_LIGHTNING_STRIKE, 4);
            const bTurn2 = buildPlayerTurn(Spells.RECHARGE, 0);
            const turnResponse2 = await game.completeTurn(aTurn2, bTurn2);
            runBasicTests(turnResponse2, [58 - 36, 58 - 10 - 7 - 36, 5, 8], GameEndTypes.ONGOING);
            expect(turnResponse2.gameState.player2.ignited).toBe(2);

            //Turn 3
            const aTurn3 = buildPlayerTurn(Spells.RECHARGE, 0);
            const bTurn3 = buildPlayerTurn(Spells.LIGHTNING_BOLT, 7);
            const turnResponse3 = await game.completeTurn(aTurn3, bTurn3);
            expect(turnResponse3.gamePhase).toBe(GameEndTypes.PLAYER_1_WINS);
        });

        it("Ignited Effect Does Not Applies When Damage is Not Dealt", async () => {
            const aTurn = buildPlayerTurn(Spells.FIRE_BALL, 1);
            const bTurn = buildPlayerTurn(Spells.WARD, 1);
            const turnResponse = await game.completeTurn(aTurn, bTurn);
            runBasicTests(turnResponse, [58, 58, 9, 9], GameEndTypes.ONGOING);
            expect(turnResponse.gameState.player2.ignited).toBe(Spells.FIRE_BALL);
        });

        it("Test that Ignited Run Out Over 3 Turns", async () => {
            const aTurn = buildPlayerTurn(Spells.FIRE_BALL, 1);
            const bTurn = buildPlayerTurn(Spells.RECHARGE, 0);
            let turnResponse = await game.completeTurn(aTurn, bTurn);
            expect(turnResponse.gameState.player2.ignited).toBe(3);
            for (let i = 0; i < 4; i++) {
                turnResponse = await game.completeTurn(buildPlayerTurn(Spells.RECHARGE, 0), buildPlayerTurn(Spells.RECHARGE, 0));
            }
            expect(turnResponse.gameState.player2.ignited).toBe(Spells.FIRE_BALL);
            runBasicTests(turnResponse, [58, 58-10-7-7-7, 17, 20], GameEndTypes.ONGOING);
        });

        it("Test that Freeze Doubles Mana for Next Attack", async () => {
            // Turn 1
            const aTurn1 = buildPlayerTurn(Spells.FREEZE_SPELL, 1);
            const bTurn1 = buildPlayerTurn(Spells.RECHARGE, 0);
            const turnResponse1 = await game.completeTurn(aTurn1, bTurn1);
            runBasicTests(turnResponse1, [58, 58-9, 9, 12], GameEndTypes.ONGOING);
            expect(turnResponse1.gameState.player1.frozen).toBe(false);
            expect(turnResponse1.gameState.player2.frozen).toBe(true);

            // Turn 2
            const aTurn2 = buildPlayerTurn(Spells.RECHARGE, 0);
            const bTurn2 = buildPlayerTurn(Spells.HEAVENLY_LIGHTNING_STRIKE, 8);
            const turnResponse2 = await game.completeTurn(aTurn2, bTurn2);
            runBasicTests(turnResponse2, [58-36, 58-9, 11, 4], GameEndTypes.ONGOING);
            expect(turnResponse2.gameState.player2.frozen).toBe(false); 
        });

        it("Test that Frozen Effect is Always Removed Next Turn", async () => {
            const aTurn = buildPlayerTurn(Spells.FREEZE_SPELL, 1);
            const bTurn = buildPlayerTurn(Spells.RECHARGE, 0);
            let turnResponse = await game.completeTurn(aTurn, bTurn);
            expect(turnResponse.gameState.player2.frozen).toBe(true);
            turnResponse = await game.completeTurn(buildPlayerTurn(Spells.RECHARGE, 0), buildPlayerTurn(Spells.RECHARGE, 0));
            expect(turnResponse.gameState.player2.frozen).toBe(false);
        });

        it("Test that Frozen Effect is Only Applied if Damage is Dealt", async () => {
            const aTurn = buildPlayerTurn(Spells.FREEZE_SPELL, 1);
            const bTurn = buildPlayerTurn(Spells.WARD, 1);
            const turnResponse = await game.completeTurn(aTurn, bTurn);
            expect(turnResponse.gameState.player2.frozen).toBe(false);
        });

        it("Test Energy Steal (Damage/No Damage/Cap)", async () => {
            // Turn 1
            const aTurn1 = buildPlayerTurn(Spells.ENERGY_STEAL, 0);
            const bTurn1 = buildPlayerTurn(Spells.MAGIC_MISSLE, 1);
            const turnResponse1 = await game.completeTurn(aTurn1, bTurn1);
            runBasicTests(turnResponse1, [58-12, 58, 16, 9], GameEndTypes.ONGOING);
    
            //Turn 2
            const aTurn2 = buildPlayerTurn(Spells.ENERGY_STEAL, 0);
            const bTurn2 = buildPlayerTurn(Spells.RECHARGE, 0);
            const turnResponse2 = await game.completeTurn(aTurn2, bTurn2);
            runBasicTests(turnResponse2, [58-12, 58, 16, 11], GameEndTypes.ONGOING);

            // Turn 3
            const aTurn3 = buildPlayerTurn(Spells.ENERGY_STEAL, 0);
            const bTurn3 = buildPlayerTurn(Spells.HEAVENLY_LIGHTNING_STRIKE, 4);
            const turnResponse3 = await game.completeTurn(aTurn3, bTurn3);
            runBasicTests(turnResponse3, [58-12-36, 58, 24, 7], GameEndTypes.ONGOING);
        });

        it("Test Self-Inflicted Damage", async () => {
            const aTurn = buildPlayerTurn(Spells.CHAOTIC_ENERGY, 0);
            const bTurn = buildPlayerTurn(Spells.CHAOTIC_ENERGY, 0);
            const turnResponse = await game.completeTurn(aTurn, bTurn);
            runBasicTests(turnResponse, [58-7, 58-7, 17, 17], GameEndTypes.ONGOING);
        });

        it("Negate Block Overflow Reduction Works", async () => {
            const aTurn = buildPlayerTurn(Spells.DRACONIC_BREATH, 3);
            const bTurn = buildPlayerTurn(Spells.WARD, 1);
            const turnResponse = await game.completeTurn(aTurn, bTurn);
            runBasicTests(turnResponse, [58, 58-21, 7, 9], GameEndTypes.ONGOING);
        });

        it("Negate Fire Damage Works", async () => {
            const aTurn = buildPlayerTurn(Spells.WATER_JET, 1);
            const bTurn = buildPlayerTurn(Spells.FIRE_BALL, 1);
            const turnResponse = await game.completeTurn(aTurn, bTurn);
            runBasicTests(turnResponse, [58, 58-8, 9, 9], GameEndTypes.ONGOING);
            expect(turnResponse.gameState.player1.ignited).toBe(0);
        });
    });

    describe("Modifer Tests", () => {
        let game: Game;
        beforeEach(() => {
            const player1State = buildPlayerState(
                'player_a', 'password',
                100, 10, 1.4, 2
            );
            const player2State = buildPlayerState(
                'player_b', 'password',
                100, 10, 1.2, 1
            );
            game = new Game({
                player1: player1State,
                player2: player2State
            });
        });

        it("Character Modifiers Work on Attack", async () => {
            const aTurn = buildPlayerTurn(Spells.LIGHTNING_BOLT, 2);
            const bTurn = buildPlayerTurn(Spells.WATER_JET, 2);
            let turnResponse = await game.completeTurn(aTurn, bTurn);
            runBasicTests(turnResponse, [100-19, 100-30, 8, 8], GameEndTypes.ONGOING);
            turnResponse = await game.completeTurn(aTurn, bTurn);
            runBasicTests(turnResponse, [100-19-19, 100-30-30, 6, 6], GameEndTypes.ONGOING);
        })

        it("Character Modifiers Work on Defense", async () => {
            const aTurn = buildPlayerTurn(Spells.MAGIC_MISSLE, 2);
            const bTurn = buildPlayerTurn(Spells.WATER_FIELD, 1);
            const turnResponse = await game.completeTurn(aTurn, bTurn);
            runBasicTests(turnResponse, [100, 100-4, 8, 9], GameEndTypes.ONGOING);
        });

        it("Modifiers stack", async () => {
            await game.completeTurn(buildPlayerTurn(Spells.FORTIFY_ATTACK, 1), buildPlayerTurn(Spells.RECHARGE, 0));
            await game.completeTurn(buildPlayerTurn(Spells.LIGHTNING_RUNE, 1), buildPlayerTurn(Spells.RECHARGE, 0));
            const aTurn = buildPlayerTurn(Spells.LIGHTNING_BOLT, 2);
            const bTurn = buildPlayerTurn(Spells.RECHARGE, 0);
            const turnResponse = await game.completeTurn(aTurn, bTurn);
            runBasicTests(turnResponse, [100, 100-57, 6, 16], GameEndTypes.ONGOING);
        });

        it("Correct Modifers Apply/Persist", async () => {
            await game.completeTurn(buildPlayerTurn(Spells.FORTIFY_ATTACK, 1), buildPlayerTurn(Spells.RECHARGE, 0));
            await game.completeTurn(buildPlayerTurn(Spells.FIRE_RUNE, 1), buildPlayerTurn(Spells.RECHARGE, 0));
            await game.completeTurn(buildPlayerTurn(Spells.WATER_JET, 1), buildPlayerTurn(Spells.RECHARGE, 0));
            const aTurn = buildPlayerTurn(Spells.DRACONIC_BREATH, 2);
            const bTurn = buildPlayerTurn(Spells.RECHARGE, 0);
            const turnResponse = await game.completeTurn(aTurn, bTurn);
            runBasicTests(turnResponse, [100, 100-57, 6, 16], GameEndTypes.ONGOING);
        });
    });
})


// Tests

// Basic Tests
    // AvA 
    // AvB - overflow + no overflow
    // AvP
    // BvB
    // BvP
    // PvP
    // Heal works 
    // Recharge works (testing with passives)
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

// Modfier Tests
    // Basic modifers work
    // Modifiers stack
    // Correct modifers persist
    // Modifers effect the proper type
    // Special blocks work

// Win Conditions
    // Player 1 wins
    // Player 2 wins
    // Tie