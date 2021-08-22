import { OPCODES, SpecialOPCODES } from './opcodes'


class Emulator {
    constructor() {
        this.ramSize = 0x10000
        this.memory.length = this.ramSize
        this.registers = []
    }

    run() {
        for (var i = 0; i < Infinity; i++) {
            countCycle()
            instruction = this.fetchInstruction()
            decodedInstruction = this.decode(instruction)
            //CHAIN METHODS
            this.execute(decodedInstruction)
        }
    }

    fetchInstruction() {
        pc = this.memory.pc
        instruction = this.memory[pc]
        pc += 1
        return instruction
    }

    decode(binary) {
        if ((binary & 0x1f) === 0) {
            instruction = this.getSpecialInstruction(binary)
        } else {
            instruction = this.getInstruction(binary)
        }
        return instruction
    }

    execute(decodedBinary) {
        a = this.get(decodedBinary.a)
        b = this.get(decodedBinary.b)

        switch (instruction.opcode) {
            case OPCODES.SET:
                instruction.a = instruction.b
                break;

            default:
                break;
        }
    }

    countCycle(times = 1) {

    }

    getSpecialInstruction() {
        return {
            opcode: (binary & 0x3ff),
            a: ((binary >> 10) & 0x3f)
            //TODO addressfor
        }
    }

    getInstruction() {
        return {
            opcode: (binary & 0x1f),
            a: ((binary >> 10) & 0x3f),
            b: ((binary >> 5) & 0x1f)
            // TODO addressfor
        }
    }


}

function main() {
    emulator = new Emulator()
    emulator.run()
}