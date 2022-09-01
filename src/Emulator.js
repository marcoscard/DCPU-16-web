import { OPCODES, SpecialOPCODES } from './opcodes'


class Emulator {
    constructor() {
        this.ramSize = 0x10000
        this.memory = []
        this.memory.length = this.ramSize
        this.registers = ["A", "B", "C", "X", "Y", "Z", "I", "J"]
        this.cycle = 0
        this.memory.sp = 0
        this.memory.ex = 0
    }

    run() {
        for (let i = 0; i < Infinity; i++) {

            let instruction = this.fetchInstruction()
            let decodedInstruction = this.decode(instruction)
            //CHAIN METHODS
            this.execute(decodedInstruction)
        }
    }

    fetchInstruction() {
        let pc = this.memory.pc
        let instruction = this.memory[pc++]
        this.cycle++
        return instruction
    }

    decode(binary) {
        if ((binary & 0x1f) === 0) {
            let instruction = this.getSpecialInstruction(binary)
        } else {
            let instruction = this.getInstruction(binary)
        }
        return instruction
    }

    execute(decodedBinary) {
        let a = this.get(decodedBinary.a)
        let b = this.get(decodedBinary.b)

        switch (instruction.opcode) {
            case OPCODES.SET:
                instruction.a = instruction.b
                break;

            default:
                break;
        }
    }

    getSpecialInstruction(binary) {
        return {
            opcode: (binary & 0x3ff),
            a: this.addressFor({ value: (binary >> 10) & 0x3f, isA: true })
            //TODO addressfor
        }
    }

    getInstruction(binary) {
        return {
            opcode: (binary & 0x1f),
            a: this.addressFor({ value: (binary >> 10) & 0x3f, isA: true }),
            b: this.addressFor({ value: (binary >> 5) & 0x1f, isA: false })
        }
    }

    addressFor({ value, isA }) {
        if (value <= 0x7) {
            let register = this.registers[value]
            return register
        }
        else if (value <= 0x0f) {
            let binary = this.memory[value % 8]
            return binary
        }
        else if (value <= 0x17) {
            let nextInstruction = this.fetchInstruction()
            let binary = (nextInstruction + this.memory[register])
            return binary
        }
        else if (value >= 0x20 && value <= 0x3f) {
            let literal = value - 0x21
            return literal
        }
        switch (value) {
            case 0x18:
                if (isA) {
                    sp = this.memory.sp++
                    return this.memory[sp]
                }
                else {
                    sp = this.memory.sp - 1
                    return this.memory[sp]
                }

            case 0x19:
                return this.memory[this.memory.sp]

            case 0x1a:
                var nextInstruction = this.memory[this.memory.pc++]
                let sp = this.memory.sp
                return address = this.memory[sp + nextInstruction]

            case 0x1b:
                return this.memory.sp

            case 0x1c:
                return this.memory.pc

            case 0x1d:
                return this.memory.ex

            case 0x1e:
                var nextInstruction = this.fetchInstruction()
                return this.memory[nextInstruction]

            case 0x1f:
                var nextInstruction = this.fetchInstruction()
                return nextInstruction
        }

    }


}

function main() {
    emulator = new Emulator()
    emulator.run()
}