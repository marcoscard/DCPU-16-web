import { OPCODES, SpecialOPCODES } from './opcodes'


class Emulator {
    constructor() {
        this.ramSize = 0x10000
        this.memory = []
        this.memory.length = this.ramSize
        this.registers = ["A", "B", "C", "X", "Y", "Z", "I", "J"]
        this.cycle = 0
        this.sp = 0xffff
        this.pc = 0x0000
        this.ex = 0x0000
        this.ia = 0x0000
        this.interruptQueue = []
        this.triggerInterrupt = true
    }

    run() {
        for (var i = 0; i < Infinity; i++) {
            this.cycle++
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

        if (decodedBinary.opcode === 0x00) {
            switch (instruction.opcode) {
                case OPCODES.SET:
                    this.cycle++
                    this.set(b, this.get(a))
                    break;
                case OPCODES.ADD:
                    this.cycle += 2
                    this.set(b, this.get(b) + this.get(a))
                    if (this.get(b) > 0xffff) {
                        this.ex = 0x0001
                    }
                    break;
                case OPCODES.SUB:
                    this.cycle += 2
                    this.set(b, this.get(b) - this.get(a))
                    if (this.get(b) < 0x0000) {
                        this.ex = 0xffff
                    }
                    break;
                case OPCODES.MUL:
                    this.cycle += 2
                    this.set(b, this.get(b) * this.get(a))
                    this.ex = (this.get(b) >> 16) & 0xffff
                    break;
                case OPCODES.DIV:
                    this.cycle += 3
                    if (this.get(a) === 0) {
                        this.set(b, 0)
                        this.ex = 0
                    } else {
                        this.set(b, this.get(b) / this.get(a))
                        this.ex = ((this.get(b) << 16) / this.get(a)) & 0xffff
                    }
                    break;
                case OPCODES.MOD:
                    this.cycle += 3
                    if (this.get(a) === 0) {
                        this.set(b, 0)
                    } else {
                        this.set(b, this.get(b) % this.get(a))
                    }
                    break;
                case OPCODES.AND:
                    this.cycle++
                    this.set(b, this.get(b) & this.get(a))
                    break;
                case OPCODES.BOR:
                    this.cycle++
                    this.set(b, this.get(b) | this.get(a))
                    break;
                case OPCODES.XOR:
                    this.cycle++
                    this.set(b, this.get(b) ^ this.get(a))
                    break;
                case OPCODES.SHR:
                    this.cycle++
                    this.ex = ((this.get(b) << 16) >> this.get(a)) & 0xffff
                    this.set(b, this.get(b) >>> this.get(a))
                    break;
                case OPCODES.ASR:
                    this.cycle++
                    this.ex = ((this.get(b) << 16) >>> this.get(a)) & 0xffff
                    this.set(b, this.get(b) >> this.get(a))
                    break;
                case OPCODES.SHL:
                    this.cycle++
                    this.ex = ((this.get(b) << this.get(a)) >> 16) & 0xffff
                    this.set(b, this.get(b) << this.get(a))
                    break;
                case OPCODES.IFB:
                    this.cycle += 2
                    if ((this.get(b) & this.get(a)) !== 0) {
                        this.pc++
                    }
                    break;
                case OPCODES.IFC:
                    this.cycle += 2
                    if ((this.get(b) & this.get(a)) === 0) {
                        this.pc++
                    }
                    break;
                case OPCODES.IFE:
                    this.cycle += 2
                    if (this.get(b) === this.get(a)) {
                        this.pc++
                    }
                    break;
                case OPCODES.IFN:
                    this.cycle += 2
                    if (this.get(b) !== this.get(a)) {
                        this.pc++
                    }
                    break;
                case OPCODES.IFG:
                    this.cycle += 2
                    if (this.get(b) > this.get(a)) {
                        this.pc++
                    }
                    break;
                case OPCODES.IFL:
                    this.cycle += 2
                    if (this.get(b) < this.get(a)) {
                        this.pc++
                    }
                    break;
                case OPCODES.ADX:
                    this.cycle += 3
                    this.set(b, this.get(b) + this.get(a) + this.ex)
                    if (this.get(b) > 0xffff) {
                        this.ex = 0x0001
                    }
                case OPCODES.SBX:
                    this.cycle += 3
                    this.set(b, this.get(b) - this.get(a) + this.ex)
                    if (this.get(b) < 0x0000) {
                        this.ex = 0xffff
                    }
                    break;
                case OPCODES.STI:
                    this.cycle += 2
                    this.set(b, this.get(a))
                    this.registers.I++
                    this.registers.J++
                    break;
                case OPCODES.STD:
                    this.cycle += 2
                    this.set(b, this.get(a))
                    this.registers.I--
                    this.registers.J--
                    break;
                default:
                    break;
            }
        } else {
            switch (decodedBinary.opcode) {
                case OPCODES.JSR:
                    this.cycle += 3
                    this.sp = (this.sp - 1) & 0xffff
                    this.set(this.sp, this.pc + 1)
                    this.pc = this.get(decodedBinary.a)
                    break
                case OPCODES.INT:
                    this.cycle += 4
                    if (!this.triggerInterrupt) {
                        this.interruptQueue.push(this.get(a))
                    } else {
                        if (this.ia !== 0) {
                            this.sp = (this.sp - 1) & 0xffff
                            this.pc = this.ia
                            this.sp = (this.sp - 1) & 0xffff
                            this.set(0x00, this.get(a))
                        }
                    }
                    break
                case OPCODES.IAG:
                    this.cycle++
                    this.set(a, this.ia)
                    break
                case OPCODES.IAS:
                    this.cycle++
                    this.ia = this.get(a)
                    break
                case OPCODES.RFI:
                    this.cycle += 3
                    this.triggerInterrupt = true
                    this.sp = (this.sp + 1) & 0xffff
                    this.set(a, this.sp)
                    this.sp = (this.sp + 1) & 0xffff
                    this.set(pc, this.sp)
                    break
                case OPCODES.IAQ:
                    this.cycle++
                    if (this.get(a)) {
                        this.triggerInterrupt = false
                    } else {
                        this.triggerInterrupt = true
                    }
                    break
                
                // devices operations
            }
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
            var nextInstruction = this.memory[this.pc++]
            value = this.memory[nextInstruction + this.registers[value % 0x08]]
        }
        else if (value === 0x18) {
            if (isA) {
                return this.memory[this.sp++]
            }
            else {
                return this.memory[--this.sp]
            }
        }
        else if (value === 0x19) {
            return this.memory[this.sp]
        }
        else if (value === 0x1a) {
            var nextInstruction = this.memory[this.pc++]
            var sp = this.sp
            return value = this.memory[nextInstruction + sp]
        }
        else if (value === 0x1b) {
            return this.sp
        }
        else if (value === 0x1c) {
            return this.pc
        }
        else if (value === 0x1d) {
            return this.ex
        }
        else if (value === 0x1e) {
            return this.memory[this.pc++]
        }
        else if (value === 0x1f) {
            return this.memory[this.pc++]
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