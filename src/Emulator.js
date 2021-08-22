const Enum = require("enum")
OPCODES = [
    {DAT, cost: 0, args: Infinity},
    {ORG, cost: 0, args: 1},
    
    //null word
    {code: 0x00, cost: 0},

    //basic ops
    {SET: 0x01, cost: 1, args: 2},
    {ADD: 0x02, cost: 2, args: 2},
    {SUB: 0x03, cost: 2, args: 2},
    {MUL: 0x04, cost: 2, args: 2},
    {MLI: 0x05, cost: 2, args: 2},
    {DIV: 0x06, cost: 3, args: 2},
    {DVI: 0x07, cost: 3, args: 2},
    {MOD: 0x08, cost: 3, args: 2},
    {MDI: 0x09, cost: 3, args: 2},
    {AND: 0x0a, cost: 1, args: 2},
    {BOR: 0x0b, cost: 1, args: 2},
    {XOR: 0x0c, cost: 1, args: 2},
    {SHR: 0x0d, cost: 1, args: 2},
    {ASR: 0x0e, cost: 1, args: 2},
    {SHL: 0x0f, cost: 1, args: 2},
    {IFB: 0x10, cost: 2, args: 2},
    {IFC: 0x11, cost: 2, args: 2},
    {IFE: 0x12, cost: 2, args: 2},
    {IFN: 0x13, cost: 2, args: 2},
    {IFG: 0x14, cost: 2, args: 2},
    {IFA: 0x15, cost: 2, args: 2},
    {IFL: 0x16, cost: 2, args: 2},
    {IFU: 0x17, cost: 2, args: 2},
   
    {ADX: 0x1a, cost: 3, args: 2},
    {SBX: 0x1b, cost: 3, args: 2},
    
    {STI: 0x1e, cost: 2, args: 2},
    {STD: 0x1f, cost: 2, args: 2},

    //non-basic ops
    {JSR: 0x20, cost: 3, args: 1},
    {BRK: 0x40, cost: 0, args: 0},
    
    {HCF: 0xe0, cost: 9, args: 1},
    {INT: 0x100, cost: 4, args: 1},
    {IAG: 0x120, cost: 1, args: 1},
    {IAS: 0x140, cost: 1, args: 1},
    {RFI: 0x160, cost: 3, args: 1},
    {IAQ: 0x180, cost: 2, args: 1},
    
    {HWN: 0x200, cost: 2, args: 1},
    {HWQ: 0x220, cost: 4, args: 1},
    {HWI: 0x240, cost: 4, args: 1}
]


class Emulator {
    constructor() {
        this.ramSize = 0x10000
        this.memory.length = this.ramSize

        const register_index = new Enum(["A", "B", "C", "X", "Y", "Z", "I", "J"])
        this.registers = []
    }

    run() {
        for (var i = 0; i < Infinity; i++) {
            countCycle()
            instruction = this.fetchInstruction()
            instruction = this.decode(instruction)
            this.execute(instruction.opcode)
        }
    }

    fetchInstruction() {
        pc = this.memory.pc
        instruction = this.memory[pc]
        pc += 1
        return instruction
    }

    decode(binary) {
        instruction = {
            opcode:(binary & 0x1f),
            a: ((binary >> 10) & 0x3f),
            b: ((binary >> 5) & 0x1f)
        }
        return instruction
    }

    execute(opcode) {
        switch (opcode) {
            case CODES.SET:

                break;

            default:
                break;
        }
    }

    countCycle(times = 1) {

    }

}

function main() {
    emulator = new Emulator()
    emulator.run()
}