import { OPCODES, SpecialOPCODES } from './opcodes'


class Emulator {
    constructor() {
        this.ramSize = 0x10000
        this.memory = []
        this.memory.length = this.ramSize
        this.registers = ["A","B","C","X","Y","Z","I","J"]
    }

    run() {
        for (var i = 0; i < Infinity; i++) {
            countCycle()
            var instruction = this.fetchInstruction()
            var decodedInstruction = this.decode(instruction)
            //CHAIN METHODS
            this.execute(decodedInstruction)
        }
    }

    fetchInstruction() {
        var pc = this.memory.pc
        var instruction = this.memory[pc++]
        return instruction
    }

    decode(binary) {
        if ((binary & 0x1f) === 0) {
            var instruction = this.getSpecialInstruction(binary)
        } else {
            var instruction = this.getInstruction(binary)
        }
        return instruction
    }

    execute(decodedBinary) {
        var a = this.get(decodedBinary.a)
        var b = this.get(decodedBinary.b)

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
            // TODO addressfor
        }
    }

    addressFor({ value,isA}) {
        var register, address
        if( value <= 0x7){
            register = this.registers[value]
        }
        else if ( value <= 0x0f){
            address = this.memory[value % 0x08]
        }
        else if ( value <= 0x17){
            var nextInstruction = this.memory[this.memory.pc++]
            address = (nextInstruction + this.memory[register])
        }
        else if ( value === 0x19) {
            var sp = this.memory.sp
            return this.memory[sp]
        } 
        else if ( value === 0x1a) {
            var nextInstruction = this.memory[this.memory.pc++]
            var sp = this.memory.sp
            return address = (nextInstruction + this.memory[nextInstruction + sp])
        } 
        else if ( value === 0x1b) {
            return this.memory.sp
        }
        else if ( value === 0x1c) {
            return this.memory.pc
        }
        else if ( value === 0x1d ) {
            return this.memory.ex
        }
        else if ( value === 0x1e) {
            return this.memory[this.memory.pc++]
        }
        else if ( value === 0x1f) {
            //TODO
        }
        else if ( value === 0x18) {
            //TODO
        }
        
    }


}

function main() {
    emulator = new Emulator()
    emulator.run()
}