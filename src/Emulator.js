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
        this.skipNext = false
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
        let instruction
        if ((binary & 0x1f) === 0) {
            instruction = this.getSpecialInstruction(binary)
        } else {
            instruction = this.getInstruction(binary)
        }
        return instruction
    }

    execute(decodedBinary) {
        let a = decodedBinary.a
        let b = decodedBinary.b

        switch (decodedBinary.opcode) {
            case OPCODES.SET:
                this.cycle += 1
                this.set(b, a)

            case OPCODES.ADD:
                this.cycle += 2
                tmp = a + b
                if (tmp > 0xffff) {
                    this.memory.ex = 0x0001
                } else {
                    this.memory.ex = 0x0000
                }

            case OPCODES.SUB:
                this.cycle += 2
                tmp = a - b
                if (tmp < 0) {
                    this.memory.ex = 0xffff
                } else {
                    this.memory.ex = 0x0000
                }

            case OPCODES.MUL:
                this.cycle += 2
                tmp = a * b
                this.memory.ex = (tmp >> 16) & 0xffff
                this.set(b, tmp)

            case OPCODES.MLI:
                this.cycle += 2
                a = ~a + 1
                tmp = a * b
                this.memory.ex = (tmp >> 16) & 0xffff
                this.set(b, tmp)

            case OPCODES.DIV:
                this.cycle += 3
                if (a == 0) {
                    this.memory.ex = 0x0000
                } else {
                    tmp = b / a
                    this.memory.ex = ((b << 16) / a) & 0xffff
                    this.set(b, tmp)
                }

            case OPCODES.DVI:
                this.cycle += 3
                a = ~a + 1
                if (a == 0) {
                    this.memory.ex = 0x0000
                } else {
                    tmp = b / a
                    this.memory.ex = ((b << 16) / a) & 0xffff
                    this.set(b, tmp)
                }

            case OPCODES.MOD:
                this.cycle += 3
                if (a == 0) {
                    this.set(b, 0)
                } else {
                    this.set(b, b % a)
                }

            case OPCODES.MDI:
                this.cycle += 3
                a = ~a + 1
                if (a == 0) {
                    this.set(b, 0)
                } else {
                    this.set(b, b % a)
                }

            case OPCODES.AND:
                this.cycle += 1
                this.set(b, a & b)

            case OPCODES.BOR:
                this.cycle += 1
                this.set(b, a | b)

            case OPCODES.XOR:
                this.cycle += 1
                this.set(b, a ^ b)

            case OPCODES.SHR:
                this.cycle += 1
                tmp = b >>> a
                this.memory.ex = ((b << 16) >>> a) & 0xffff
                this.set(b, tmp)

            case OPCODES.ASR:
                this.cycle += 1
                b = ~b + 1
                tmp = b >> a
                this.memory.ex = ((b << 16) >>> a) & 0xffff
                this.set(b, tmp)

            case OPCODES.SHL:
                this.cycle += 1
                tmp = b << a
                this.memory.ex = (tmp >> 16) & 0xffff
                this.set(b, tmp)

            case OPCODES.IFB:
                this.cycle += 2
                if ((b & a) != 0) {
                    this.memory.pc++
                } else {
                    this.cycle += 1
                    this.skipNext = true
                }

            case OPCODES.IFC:
                this.cycle += 2
                if ((b & a) == 0) {
                    this.memory.pc++
                } else {
                    this.cycle += 1
                    this.skipNext = true
                }

            case OPCODES.IFE:
                this.cycle += 2
                if (b == a) {
                    this.memory.pc++
                } else {
                    this.cycle += 1
                    this.skipNext = true
                }

            case OPCODES.IFN:
                this.cycle += 2
                if (b != a) {
                    this.memory.pc++
                } else {
                    this.cycle += 1
                    this.skipNext = true
                }

            case OPCODES.IFG:
                this.cycle += 2
                if (b > a) {
                    this.memory.pc++
                } else {
                    this.cycle += 1
                    this.skipNext = true
                }

            case OPCODES.IFA:
                this.cycle += 2
                b = ~b + 1
                a = ~a + 1
                if (b > a) {
                    this.memory.pc++
                } else {
                    this.cycle += 1
                    this.skipNext = true
                }

            case OPCODES.IFL:
                this.cycle += 2
                if (b < a) {
                    this.memory.pc++
                } else {
                    this.cycle += 1
                    this.skipNext = true
                }

            case OPCODES.IFU:
                this.cycle += 2
                b = ~b + 1
                a = ~a + 1
                if (b < a) {
                    this.memory.pc++
                } else {
                    this.cycle += 1
                    this.skipNext = true
                }

            case OPCODES.ADX:
                this.cycle += 3
                tmp = b + a + this.memory.ex
                if (tmp > 0xffff) {
                    this.memory.ex = 0x0001
                } else {
                    this.memory.ex = 0x0000
                }

            case OPCODES.SBX:
                this.cycle += 3
                tmp = b - a + this.memory.ex
                if (tmp < 0) {
                    this.memory.ex = 0xffff
                } else {
                    this.memory.ex = 0x0000
                }

            case OPCODES.STI:
                this.cycle += 2
                this.set(b, a)
                this.memory.I++
                this.memory.J++

            case OPCODES.STD:
                this.cycle += 2
                this.set(b, a)
                this.memory.I--
                this.memory.J--
        }
    }

    getSpecialInstruction(binary) {
        return {
            opcode: (binary & 0x3ff),
            a: this.addressFor({ value: (binary >> 10) & 0x3f, isA: true })
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
            let register = this.registers[value - 0x8]
            return this.memory[register]
        }
        else if (value <= 0x17) {
            let nextInstruction = this.fetchInstruction()
            let register = this.registers[value - 0x10]
            return (nextInstruction + this.memory[register])
        }
        else if (value >= 0x20 && value <= 0x3f) {
            let literal = value - 0x21
            return literal
        }
        switch (value) {
            case 0x18:
                if (isA) {
                    let sp = this.memory.sp++
                    return this.memory[sp]
                }
                else {
                    let sp = this.memory.sp - 1
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