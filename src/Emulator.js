import { OPCODES, SpecialOPCODES } from './opcodes'


class Emulator {
    constructor() {
        this.ramSize = 0x10000
        this.memory = []
        this.memory.length = this.ramSize
        this.registers = ["A", "B", "C", "X", "Y", "Z", "I", "J"]
    }

    run() {
        for (var i = 0; i < Infinity; i++) {
            countCycle()
            var instruction = this.fetchInstruction()
            var decodedInstruction = this.decode(instruction)
            this.execute(decodedInstruction)
        }
    }

    fetchInstruction() {
        var pc = this.memory.pc
        var instruction = this.memory[pc++]
        return instruction
    }

    decode(binary) {
        var instruction
        if ((binary & 0x1f) === 0) {
            var instruction = this.getSpecialInstruction(binary)
        } else {
            var instruction = this.getInstruction(binary)
        }
        return instruction
    }

    execute(decodedBinary) {
        var a = decodedBinary.a
        var b = decodedBinary.b

        switch (instruction.opcode) {
            case OPCODES.SET:
                this.set(b, this.get(a))
            case OPCODES.ADD:
                this.set(b, this.get(b) + this.get(a))
                if (this.get(b) > 0xffff) {
                    this.memory.ex = 0x0001
                }
                break;
            case OPCODES.SUB:
                this.set(b, this.get(b) - this.get(a))
                if (this.get(b) < 0x0000) {
                    this.memory.ex = 0xffff
                }
                break;
            case OPCODES.MUL:
                this.set(b, this.get(b) * this.get(a))
                this.memory.ex = (this.get(b) >> 16) & 0xffff
                break;
            case OPCODES.DIV:
                if (this.get(a) === 0) {
                    this.set(b, 0)
                    this.memory.ex = 0
                } else {
                    this.set(b, this.get(b) / this.get(a))
                    this.memory.ex = ((this.get(b) << 16) / this.get(a)) & 0xffff
                }
                break;
            case OPCODES.MOD:
                if (this.get(a) === 0) {
                    this.set(b, 0)
                } else {
                    this.set(b, this.get(b) % this.get(a))
                }
                break;
            case OPCODES.AND:
                this.set(b, this.get(b) & this.get(a))
                break;
            case OPCODES.BOR:
                this.set(b, this.get(b) | this.get(a))
                break;
            case OPCODES.XOR:
                this.set(b, this.get(b) ^ this.get(a))
                break;
            case OPCODES.SHR:
                this.memory.ex = ((this.get(b) << 16) >> this.get(a)) & 0xffff
                this.set(b, this.get(b) >>> this.get(a))
                break;
            case OPCODES.ASR:
                this.memory.ex = ((this.get(b) << 16) >>> this.get(a)) & 0xffff
                this.set(b, this.get(b) >> this.get(a))
                break;
            case OPCODES.SHL:
                this.memory.ex = ((this.get(b) << this.get(a)) >> 16) & 0xffff
                this.set(b, this.get(b) << this.get(a))
                break;
            case OPCODES.IFB:
                if ((this.get(b) & this.get(a)) !== 0) {
                    this.memory.pc++
                }
                break;
            case OPCODES.IFC:
                if ((this.get(b) & this.get(a)) === 0) {
                    this.memory.pc++
                }
                break;
            case OPCODES.IFE:
                if (this.get(b) === this.get(a)) {
                    this.memory.pc++
                }
                break;
            case OPCODES.IFN:
                if (this.get(b) !== this.get(a)) {
                    this.memory.pc++
                }
                break;
            case OPCODES.IFG:
                if (this.get(b) > this.get(a)) {
                    this.memory.pc++
                }
                break;
            case OPCODES.IFL:
                if (this.get(b) < this.get(a)) {
                    this.memory.pc++
                }
                break;
            case OPCODES.ADX:
                this.set(b, this.get(b) + this.get(a) + this.memory.ex)
                if (this.get(b) > 0xffff) {
                    this.memory.ex = 0x0001
                }
            case OPCODES.SBX:
                this.set(b, this.get(b) - this.get(a) + this.memory.ex)
                if (this.get(b) < 0x0000) {
                    this.memory.ex = 0xffff
                }
                break;
            case OPCODES.STI:
                this.set(b, this.get(a))
                this.registers.I++
                this.registers.J++
                break;
            case OPCODES.STD:
                this.set(b, this.get(a))
                this.registers.I--
                this.registers.J--
                break;
            default:
                break;
        }
    }

    set(key, value) {
        if (key <= 0x07) {
            this.registers[key] = value
        }
        else if (key & 0x10000) { return }
        else {
            this.memory[key] = value
        }
    }

    get(key) {
        if (key <= 0x07) {
            return this.registers[key]
        }
        else if (key & 0x10000) { return }
        else {
            return this.memory[key]
        }
    }

    countCycle(times = 1) {
        for (var i = 0; i < times; i++) {
            this.cycle()
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
        var register, value
        if (value <= 0x7) {
            register = this.registers[value]
        }
        else if (value <= 0x0f) {
            value = this.memory[value % 0x08]
        }
        else if (value <= 0x17) {
            var nextInstruction = this.memory[this.memory.pc++]
            value = this.memory[nextInstruction + this.registers[value % 0x08]]
        }
        else if (value === 0x18) {
            if (isA) {
                return this.memory[this.memory.sp++]
            }
            else {
                return this.memory[--this.memory.sp]
            }
        }
        else if (value === 0x19) {
            return this.memory[this.memory.sp]
        }
        else if (value === 0x1a) {
            var nextInstruction = this.memory[this.memory.pc++]
            var sp = this.memory.sp
            return value = this.memory[nextInstruction + sp]
        }
        else if (value === 0x1b) {
            return this.memory.sp
        }
        else if (value === 0x1c) {
            return this.memory.pc
        }
        else if (value === 0x1d) {
            return this.memory.ex
        }
        else if (value === 0x1e) {
            return this.memory[this.memory.pc++]
        }
        else if (value === 0x1f) {
            return this.memory[this.memory.pc++]
        }
        else if (value >= 0x20 && value <= 0x3f) {
            return value - 0x21
        }
    }


}

function main() {
    emulator = new Emulator()
    emulator.run()
}